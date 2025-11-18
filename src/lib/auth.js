import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'electric-utility-super-secret-key-2024';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '30d';

// Generate JWT token
export function generateToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN
  });
}

// Verify JWT token
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}

// Set token as HTTP-only cookie
export function setTokenCookie(res, token) {
  res.cookies.set('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    path: '/'
  });
}

// Clear token cookie
export function clearTokenCookie(res) {
  res.cookies.set('token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: new Date(0),
    path: '/'
  });
}

// Get user ID from request
export async function getUserIdFromRequest(req) {
  try {
    const token = req.cookies.get('token')?.value;
    
    if (!token) {
      return null;
    }

    const decoded = verifyToken(token);
    return decoded.userId;
  } catch (error) {
    return null;
  }
}

// Generate refresh token (for future use)
export function generateRefreshToken(userId) {
  return jwt.sign({ userId, type: 'refresh' }, JWT_SECRET, {
    expiresIn: '90d'
  });
}