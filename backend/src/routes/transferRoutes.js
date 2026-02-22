import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { transfer } from '../controllers/transferController.js';

const router = express.Router();
router.post('/', authenticateToken, transfer);
export default router;
