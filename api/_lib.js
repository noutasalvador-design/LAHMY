const { neon } = require('@neondatabase/serverless');
const { createHmac, timingSafeEqual } = require('node:crypto');

function db() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL manquante dans Vercel.');
  return neon(process.env.DATABASE_URL);
}
function secret() {
  if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 32) throw new Error('SESSION_SECRET doit contenir au moins 32 caractères.');
  return process.env.SESSION_SECRET;
}
function send(res, status, data) {
  res.status(status).setHeader('Content-Type','application/json; charset=utf-8').json(data);
}
function cookie(value, maxAge) {
  return 'lahmy_session='+value+'; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age='+maxAge;
}
function sign(value) {
  return createHmac('sha256',secret()).update(value).digest('base64url');
}
async function createSession(email) {
  const payload=Buffer.from(JSON.stringify({email,role:'admin',exp:Math.floor(Date.now()/1000)+28800})).toString('base64url');
  return payload+'.'+sign(payload);
}
async function admin(req) {
  const raw = req.headers.cookie || '';
  const match = raw.match(/(?:^|;\s*)lahmy_session=([^;]+)/);
  if (!match) return false;
  try {
    const token=decodeURIComponent(match[1]).split('.');
    if(token.length!==2)return false;
    const expected=Buffer.from(sign(token[0]));
    const actual=Buffer.from(token[1]);
    if(expected.length!==actual.length||!timingSafeEqual(expected,actual))return false;
    const payload=JSON.parse(Buffer.from(token[0],'base64url').toString('utf8'));
    return payload.role==='admin'&&String(payload.email).toLowerCase()===String(process.env.ADMIN_EMAIL||'').trim().toLowerCase()&&payload.exp>Date.now()/1000;
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