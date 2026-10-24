const { neon } = require('@neondatabase/serverless');
const { SignJWT, jwtVerify } = require('jose');

function db() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL manquante dans Vercel.');
  return neon(process.env.DATABASE_URL);
}
function secret() {
  if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 32) throw new Error('SESSION_SECRET doit contenir au moins 32 caractères.');
  return new TextEncoder().encode(process.env.SESSION_SECRET);
}
function send(res, status, data) {
  res.status(status).setHeader('Content-Type','application/json; charset=utf-8').json(data);
}
function cookie(value, maxAge) {
  return 'lahmy_session='+value+'; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age='+maxAge;
}
async function createSession(email) {
  return new SignJWT({ email, role: 'admin' }).setProtectedHeader({ alg: 'HS256' }).setIssuedAt().setExpirationTime('8h').sign(secret());
}
async function admin(req) {
  const raw = req.headers.cookie || '';
  const match = raw.match(/(?:^|;\s*)lahmy_session=([^;]+)/);
  if (!match) return false;
  try {
    const { payload } = await jwtVerify(decodeURIComponent(match[1]), secret());
    return payload.role === 'admin' && payload.email === process.env.ADMIN_EMAIL;
  } catch { return false; }
}
function method(req, res, allowed) {
  if (!allowed.includes(req.method)) {
    res.setHeader('Allow', allowed.join(', '));
    send(res, 405, { error: 'Méthode non autorisée.' });
    return false;
  }
  return true;
}
module.exports = { db, send, cookie, createSession, admin, method };