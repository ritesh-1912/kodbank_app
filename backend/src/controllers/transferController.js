import pool from '../config/database.js';
import { getUidByUsername, getBalanceByUid, findByUsername, findByUid, deductBalance, addBalance } from '../models/KodUser.js';
import { insertTransactionWithConnection } from '../models/Transaction.js';

/**
 * POST /api/transfer – send money to another user (by username or uid)
 * Body: { toUsername?: string, toUid?: number, amount: number, note?: string }
 */
export const transfer = async (req, res) => {
  try {
    const { toUsername, toUid, amount: rawAmount, note } = req.body || {};
    const amount = parseFloat(rawAmount);

    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Valid amount (greater than 0) is required.' });
    }

    const senderUsername = req.user.username;
    const senderUid = await getUidByUsername(senderUsername);
    if (!senderUid) {
      return res.status(404).json({ success: false, message: 'Sender user not found.' });
    }

    let recipientUid = null;
    let recipientUsername = '';
    if (toUid != null && Number.isInteger(Number(toUid))) {
      const recipient = await findByUid(Number(toUid));
      if (!recipient) {
        return res.status(404).json({ success: false, message: 'Recipient not found.' });
      }
      recipientUid = recipient.uid;
      recipientUsername = recipient.username;
    } else if (toUsername && String(toUsername).trim()) {
      const recipient = await findByUsername(String(toUsername).trim());
      if (!recipient) {
        return res.status(404).json({ success: false, message: 'Recipient username not found.' });
      }
      recipientUid = recipient.uid;
      recipientUsername = recipient.username;
    } else {
      return res.status(400).json({ success: false, message: 'Provide toUsername or toUid.' });
    }

    if (senderUid === recipientUid) {
      return res.status(400).json({ success: false, message: 'You cannot transfer to yourself.' });
    }

    const senderBalance = await getBalanceByUid(senderUid);
    if (senderBalance == null || Number(senderBalance) < amount) {
      return res.status(400).json({ success: false, message: 'Insufficient balance.' });
    }

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      const deducted = await deductBalance(conn, senderUid, amount);
      if (!deducted) {
        await conn.rollback();
        return res.status(400).json({ success: false, message: 'Insufficient balance.' });
      }
      await addBalance(conn, recipientUid, amount);
      const descSender = note ? `Transfer to ${recipientUsername}: ${note}` : `Transfer to ${recipientUsername}`;
      const descRecipient = note ? `Transfer from ${senderUsername}: ${note}` : `Transfer from ${senderUsername}`;
      await insertTransactionWithConnection(conn, senderUid, 'debit', amount, descSender);
      await insertTransactionWithConnection(conn, recipientUid, 'credit', amount, descRecipient);
      await conn.commit();
    } catch (txErr) {
      await conn.rollback();
      throw txErr;
    } finally {
      conn.release();
    }

    res.status(200).json({
      success: true,
      message: `₹${amount.toLocaleString('en-IN')} sent to ${recipientUsername}.`,
      amount,
      to: recipientUsername,
      toUid: recipientUid
    });
  } catch (err) {
    console.error('Transfer error:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Transfer failed. Please try again.'
    });
  }
};
