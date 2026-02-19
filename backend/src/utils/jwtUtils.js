import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-change-in-production';
const JWT_EXPIRY = process.env.JWT_EXPIRY || '24h';

/**
 * Generate JWT token with username as subject and role as claim
 * @param {string} username - Username to use as subject
 * @param {string} role - User role to include as claim
 * @returns {string} JWT token
 */
export const generateToken = (username, role) => {
  const payload = {
    sub: username, // Subject claim (username)
    role: role,    // Custom claim for role
    iat: Math.floor(Date.now() / 1000) // Issued at
  };

  return jwt.sign(payload, JWT_SECRET, {
    algorithm: 'HS256', // Standard HMAC SHA-256 algorithm
    expiresIn: JWT_EXPIRY
  });
};

/**
 * Verify and decode JWT token
 * @param {string} token - JWT token to verify
 * @returns {object} Decoded token payload
 * @throws {Error} If token is invalid or expired
 */
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET, {
      algorithms: ['HS256']
    });
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

/**
 * Calculate token expiry timestamp
 * @param {string} expiryString - Expiry string (e.g., '24h', '7d')
 * @returns {Date} Expiry date
 */
export const getTokenExpiry = (expiryString = JWT_EXPIRY) => {
  const now = new Date();
  const expiry = expiryString.toLowerCase();
  
  if (expiry.endsWith('h')) {
    const hours = parseInt(expiry);
    now.setHours(now.getHours() + hours);
  } else if (expiry.endsWith('d')) {
    const days = parseInt(expiry);
    now.setDate(now.getDate() + days);
  } else if (expiry.endsWith('m')) {
    const minutes = parseInt(expiry);
    now.setMinutes(now.getMinutes() + minutes);
  }
  
  return now;
};
