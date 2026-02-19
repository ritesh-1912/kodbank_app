import { verifyToken } from '../utils/jwtUtils.js';

/**
 * JWT Authentication Middleware
 * Verifies JWT token from cookie and attaches user info to request
 */
export const authenticateToken = async (req, res, next) => {
  try {
    // Extract token from cookie
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required. Please login.' 
      });
    }

    // Verify token
    const decoded = verifyToken(token);

    // Attach user info to request object
    req.user = {
      username: decoded.sub, // Subject claim contains username
      role: decoded.role      // Role claim
    };

    next();
  } catch (error) {
    return res.status(401).json({ 
      success: false, 
      message: 'Invalid or expired token. Please login again.' 
    });
  }
};
