import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import pool from './config/database.js';
import authRoutes from './routes/authRoutes.js';
import balanceRoutes from './routes/balanceRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const VERCEL_URL = process.env.VERCEL_URL;

// CORS middleware - must be first, before any routes
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const allowedOrigins = [
    FRONTEND_URL,
    VERCEL_URL ? `https://${VERCEL_URL}` : null,
    process.env.VERCEL ? `https://${process.env.VERCEL_URL}` : null
  ].filter(Boolean);
  
  // Allow requests from frontend URL, Vercel URL, or localhost
  if (origin && (allowedOrigins.includes(origin) || origin.includes('localhost:3000') || origin.includes('vercel.app'))) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.header('Access-Control-Expose-Headers', 'Set-Cookie');
  }
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/balance', balanceRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Kodbank API is running' });
});

// Database health check (for debugging registration 500 errors)
app.get('/api/health/db', async (req, res) => {
  try {
    await pool.execute('SELECT 1');
    res.json({ success: true, message: 'Database connected' });
  } catch (err) {
    console.error('DB health check failed:', err);
    res.status(500).json({
      success: false,
      message: 'Database connection failed',
      error: err.message,
      code: err.code
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Export for Vercel serverless functions
export default app;

// Only listen if not in Vercel environment
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Frontend URL: ${FRONTEND_URL}`);
  });
}
