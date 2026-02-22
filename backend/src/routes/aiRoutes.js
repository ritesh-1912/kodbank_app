import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { chat } from '../controllers/aiController.js';

const router = express.Router();
router.post('/', authenticateToken, chat);
export default router;
