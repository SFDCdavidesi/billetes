const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'billetes-secret-change-in-production';
const JWT_EXPIRES_IN = '7d';
const COOKIE_NAME = 'billetes_session';

function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

function getSessionCookieOptions() {
  const isProduction = process.env.NODE_ENV === 'production';
  return {
    name: COOKIE_NAME,
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 días
  };
}

function getTokenFromRequest(request) {
  const cookie = request.cookies.get(COOKIE_NAME);
  return cookie?.value || null;
}

function getUserFromRequest(request) {
  const token = getTokenFromRequest(request);
  if (!token) return null;
  return verifyToken(token);
}

module.exports = {
  JWT_SECRET,
  COOKIE_NAME,
  signToken,
  verifyToken,
  getSessionCookieOptions,
  getTokenFromRequest,
  getUserFromRequest,
};
