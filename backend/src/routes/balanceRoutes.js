import express from 'express';
import { checkBalance } from '../controllers/balanceController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/balance (protected route)
router.get('/', authenticateToken, checkBalance);

export default router;
