// Simple in-memory rate limiter — best effort on Vercel (resets per cold start)
const requests = new Map();

module.exports = function rateLimit(req, res, limit = 20) {
  const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.socket?.remoteAddress || 'unknown';
  const now = Date.now();
  const entry = requests.get(ip) || { count: 0, start: now };
  if (now - entry.start > 60000) { entry.count = 0; entry.start = now; }
  entry.count++;
  requests.set(ip, entry);
  if (entry.count > limit) {
    res.status(429).json({ error: 'Too many requests. Please wait a moment.' });
    return false;
  }
  return true;
};
