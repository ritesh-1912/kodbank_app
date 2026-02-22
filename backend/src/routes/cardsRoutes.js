import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { listCards, createCard } from '../controllers/cardsController.js';

const router = express.Router();
router.get('/', authenticateToken, listCards);
router.post('/', authenticateToken, createCard);
export default router;
