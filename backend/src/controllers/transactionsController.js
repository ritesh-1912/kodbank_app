import { getUidByUsername } from '../models/KodUser.js';
import { getTransactionsByUid } from '../models/Transaction.js';

/**
 * GET /api/transactions – list recent transactions (optional: type, search, limit)
 */
export const listTransactions = async (req, res) => {
  try {
    const uid = await getUidByUsername(req.user.username);
    if (!uid) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    const options = {
      limit: req.query.limit,
      type: req.query.type,
      search: req.query.search
    };
    const transactions = await getTransactionsByUid(uid, options);
    res.json({ success: true, transactions });
  } catch (err) {
    console.error('Transactions list error:', err);
    if (err.code === 'ER_NO_SUCH_TABLE') {
      return res.json({ success: true, transactions: [] });
    }
    res.status(500).json({ success: false, message: 'Failed to fetch transactions' });
  }
};
