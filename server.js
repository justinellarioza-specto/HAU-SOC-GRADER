'use strict';
const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const { MongoClient } = require('mongodb');

const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.MONGODB_DB || 'hau_soc_grader';
const JWT_SECRET = process.env.JWT_SECRET;
const PROD = process.env.NODE_ENV === 'production';
const COOKIE = 'hsg_session';
const SESSION_DAYS = 30;

if (!MONGODB_URI) { console.error('Missing MONGODB_URI environment variable.'); process.exit(1); }
if (!JWT_SECRET || JWT_SECRET.length < 16) { console.error('Missing JWT_SECRET (at least 16 characters).'); process.exit(1); }

const STUDENT_NO = /^[A-Za-z0-9-]{4,20}$/;

function clean(v) { return typeof v === 'string' ? v.trim() : ''; }
function publicUser(u) { return { name: u.name, studentNumber: u.studentNumber }; }

async function main() {
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const users = client.db(DB_NAME).collection('users');
  await users.createIndex({ studentNumberKey: 1 }, { unique: true });

  const app = express();
  app.set('trust proxy', 1);
  app.disable('x-powered-by');
  app.use(express.json({ limit: '512kb' }));
  app.use(cookieParser());
  app.use((req, res, next) => {
    res.set('X-Content-Type-Options', 'nosniff');
    res.set('X-Frame-Options', 'SAMEORIGIN');
    res.set('Referrer-Policy', 'same-origin');
    next();
  });

  const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, standardHeaders: 'draft-7', legacyHeaders: false,
    message: { error: 'Too many attempts. Try again in a few minutes.' } });

  function setSession(res, user) {
    const token = jwt.sign({ sub: String(user._id) }, JWT_SECRET, { expiresIn: `${SESSION_DAYS}d` });
    res.cookie(COOKIE, token, { httpOnly: true, sameSite: 'lax', secure: PROD, maxAge: SESSION_DAYS * 864e5, path: '/' });
  }

  async function requireUser(req, res, next) {
    try {
      const token = req.cookies[COOKIE];
      if (!token) return res.status(401).json({ error: 'Not logged in.' });
      const { sub } = jwt.verify(token, JWT_SECRET);
      const { ObjectId } = require('mongodb');
      const user = await users.findOne({ _id: new ObjectId(sub) });
      if (!user) return res.status(401).json({ error: 'Not logged in.' });
      req.user = user;
      next();
    } catch (e) {
      res.status(401).json({ error: 'Not logged in.' });
    }
  }

  app.post('/api/signup', authLimiter, async (req, res) => {
    const name = clean(req.body.name);
    const studentNumber = clean(req.body.studentNumber);
    const password = typeof req.body.password === 'string' ? req.body.password : '';
    if (!name || name.length > 80) return res.status(400).json({ error: 'Enter your name (up to 80 characters).' });
    if (!STUDENT_NO.test(studentNumber)) return res.status(400).json({ error: 'Student number should be 4 to 20 letters, numbers or dashes.' });
    if (password.length < 8 || password.length > 128) return res.status(400).json({ error: 'Password must be at least 8 characters.' });
    const now = new Date();
    const doc = { name, studentNumber, studentNumberKey: studentNumber.toUpperCase(),
      passwordHash: await bcrypt.hash(password, 12), data: null, createdAt: now, updatedAt: now };
    try {
      const r = await users.insertOne(doc);
      doc._id = r.insertedId;
    } catch (e) {
      if (e && e.code === 11000) return res.status(409).json({ error: 'That student number already has an account. Log in instead.' });
      throw e;
    }
    setSession(res, doc);
    res.status(201).json({ user: publicUser(doc) });
  });

  app.post('/api/login', authLimiter, async (req, res) => {
    const studentNumber = clean(req.body.studentNumber);
    const password = typeof req.body.password === 'string' ? req.body.password : '';
    const user = STUDENT_NO.test(studentNumber) ? await users.findOne({ studentNumberKey: studentNumber.toUpperCase() }) : null;
    const ok = user ? await bcrypt.compare(password, user.passwordHash) : false;
    if (!ok) return res.status(401).json({ error: 'Wrong student number or password.' });
    setSession(res, user);
    res.json({ user: publicUser(user) });
  });

  app.post('/api/logout', (req, res) => {
    res.clearCookie(COOKIE, { httpOnly: true, sameSite: 'lax', secure: PROD, path: '/' });
    res.json({ ok: true });
  });

  app.get('/api/me', requireUser, (req, res) => res.json({ user: publicUser(req.user) }));

  app.get('/api/data', requireUser, (req, res) => res.json({ data: req.user.data || null, updatedAt: req.user.updatedAt }));

  app.put('/api/data', requireUser, async (req, res) => {
    const data = req.body && req.body.data;
    if (!data || typeof data !== 'object' || Array.isArray(data)) return res.status(400).json({ error: 'Nothing to save.' });
    const updatedAt = new Date();
    await users.updateOne({ _id: req.user._id }, { $set: { data, updatedAt } });
    res.json({ ok: true, updatedAt });
  });

  app.use('/api', (req, res) => res.status(404).json({ error: 'Not found.' }));
  app.use(express.static(path.join(__dirname, 'public'), { extensions: ['html'] }));
  app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

  app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong on the server. Try again.' });
  });

  app.listen(PORT, () => console.log(`HAU SOC Grader running on port ${PORT}`));
}

main().catch(err => { console.error('Failed to start:', err.message); process.exit(1); });
