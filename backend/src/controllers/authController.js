import { body, validationResult } from 'express-validator';
import { createUser, findByUsername, findByEmail, verifyPassword } from '../models/KodUser.js';
import { saveToken } from '../models/UserToken.js';
import { generateToken, getTokenExpiry } from '../utils/jwtUtils.js';

/**
 * User Registration Controller
 */
export const register = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { username, email, password, phone, role } = req.body;

    // Enforce role to be 'customer' only
    const userRole = role === 'customer' ? 'customer' : 'customer';

    // Check if username already exists
    const existingUser = await findByUsername(username);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Username already exists'
      });
    }

    // Check if email already exists
    const existingEmail = await findByEmail(email);
    if (existingEmail) {
      return res.status(409).json({
        success: false,
        message: 'Email already exists'
      });
    }

    // Create user (UID auto-assigned by database, balance defaults to 100000)
    await createUser(username, email, password, phone, userRole);

    res.status(201).json({
      success: true,
      message: 'User registered successfully. Please login.'
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during registration'
    });
  }
};

/**
 * User Login Controller
 */
export const login = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { username, password } = req.body;

    // Find user by username
    const user = await findByUsername(username);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      });
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      });
    }

    // Generate JWT token (username as subject, role as claim)
    const token = generateToken(user.username, user.role);

    // Calculate expiry date
    const expiryDate = getTokenExpiry();

    // Save token to UserToken table
    await saveToken(user.uid, token, expiryDate);

    // Set token as HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production' || process.env.VERCEL === '1', // HTTPS in production
      sameSite: 'lax', // Changed from 'strict' to 'lax' for better compatibility
      maxAge: 24 * 60 * 60 * 1000 // 24 hours in milliseconds
    });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      user: {
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during login'
    });
  }
};

/**
 * Validation rules for registration (UID is auto-assigned by database)
 */
export const validateRegister = [
  body('username').trim().isLength({ min: 2 }).withMessage('Username must be at least 2 characters'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('phone').trim().notEmpty().withMessage('Phone number is required').matches(/^[0-9]+$/).withMessage('Phone number must contain only digits'),
  body('role').optional().equals('customer').withMessage('Role must be customer')
];

/**
 * Validation rules for login
 */
export const validateLogin = [
  body('username').trim().notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required')
];
