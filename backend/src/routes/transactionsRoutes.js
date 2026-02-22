import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { listTransactions } from '../controllers/transactionsController.js';

const router = express.Router();
router.get('/', authenticateToken, listTransactions);
export default router;
