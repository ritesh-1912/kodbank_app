import pool from '../config/database.js';

/**
 * Get all cards for a user by uid
 */
export const getCardsByUid = async (uid) => {
  const [rows] = await pool.execute(
    'SELECT id, last_four, card_type AS cardType, brand, created_at AS createdAt FROM Card WHERE uid = ? ORDER BY created_at DESC',
    [uid]
  );
  return rows;
};

/**
 * Insert default card for new user (Visa debit, last 4 random)
 */
export const insertDefaultCard = async (uid) => {
  const lastFour = String(Math.floor(1000 + Math.random() * 9000));
  await pool.execute(
    'INSERT INTO Card (uid, last_four, card_type, brand) VALUES (?, ?, ?, ?)',
    [uid, lastFour, 'debit', 'Visa']
  );
};

/**
 * Add a new card for user (returns new card id and last_four)
 */
export const addCard = async (uid, cardType = 'debit', brand = 'Visa') => {
  const lastFour = String(Math.floor(1000 + Math.random() * 9000));
  const [result] = await pool.execute(
    'INSERT INTO Card (uid, last_four, card_type, brand) VALUES (?, ?, ?, ?)',
    [uid, lastFour, cardType, brand]
  );
  return { id: result.insertId, last_four: lastFour, cardType, brand };
};
