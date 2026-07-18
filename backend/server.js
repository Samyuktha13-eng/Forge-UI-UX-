require('dotenv').config();
const express = require('express');
const path = require('path');
const app = express();

if (!process.env.GROQ_API_KEY) {
  console.warn('GROQ_API_KEY is missing; AI API endpoints will fail until it is set in Vercel environment variables.');
}

// Rate limiting — max 30 requests per minute per IP
const requestCounts = new Map();
app.use('/api', (req, res, next) => {
  const ip = req.ip;
  const now = Date.now();
  const entry = requestCounts.get(ip) || { count: 0, start: now };
  if (now - entry.start > 60000) { entry.count = 0; entry.start = now; }
  entry.count++;
  requestCounts.set(ip, entry);
  if (entry.count > 30) return res.status(429).json({ error: 'Too many requests. Please wait a moment.' });
  next();
});

// CSRF protection — only allow requests from same origin in production
app.use('/api', (req, res, next) => {
  const origin = req.headers.origin || req.headers.referer || '';
  const allowed = ['http://localhost:3000', 'http://127.0.0.1:3000'];
  if (process.env.VERCEL_URL) allowed.push(`https://${process.env.VERCEL_URL}`);
  if (process.env.ALLOWED_ORIGIN) allowed.push(process.env.ALLOWED_ORIGIN);
  if (!origin || allowed.some(o => origin.startsWith(o))) return next();
  return res.status(403).json({ error: 'Forbidden' });
});

app.use(express.json({ limit: '10kb' }));
app.use(express.static(path.join(__dirname, '../frontend')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});
app.get('/about', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/about.html'));
});
app.get('/podcasts', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/podcasts.html'));
});
app.get('/contact', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/contact.html'));
});

app.post('/api/chat', require('./api/chat'));
app.post('/api/match', require('./api/match'));
app.post('/api/summary', require('./api/summary'));
app.get('/api/episodes', require('./api/episodes'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Talkiepedia running at http://localhost:${PORT}`));
