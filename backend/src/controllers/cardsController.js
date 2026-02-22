import { getUidByUsername } from '../models/KodUser.js';
import { getCardsByUid, addCard } from '../models/Card.js';

/**
 * GET /api/cards – list cards for authenticated user
 */
export const listCards = async (req, res) => {
  try {
    const uid = await getUidByUsername(req.user.username);
    if (!uid) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    const cards = await getCardsByUid(uid);
    res.json({ success: true, cards });
  } catch (err) {
    console.error('Cards list error:', err);
    if (err.code === 'ER_NO_SUCH_TABLE') {
      return res.json({ success: true, cards: [] });
    }
    res.status(500).json({ success: false, message: 'Failed to fetch cards' });
  }
};

/**
 * POST /api/cards – add a new card (body: cardType?, brand?)
 */
export const createCard = async (req, res) => {
  try {
    const uid = await getUidByUsername(req.user.username);
    if (!uid) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    const cardType = (req.body?.cardType || 'debit').toLowerCase() === 'credit' ? 'credit' : 'debit';
    const brand = ['Visa', 'Mastercard'].includes(req.body?.brand) ? req.body.brand : 'Visa';
    const card = await addCard(uid, cardType, brand);
    res.status(201).json({ success: true, card: { id: card.id, last_four: card.last_four, cardType: card.cardType, brand: card.brand } });
  } catch (err) {
    console.error('Add card error:', err);
    if (err.code === 'ER_NO_SUCH_TABLE') {
      return res.status(503).json({ success: false, message: 'Cards are not set up yet. Run the database setup SQL to create the Card table.' });
    }
    res.status(500).json({ success: false, message: 'Failed to add card' });
  }
};
