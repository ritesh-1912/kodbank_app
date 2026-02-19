import pool from '../config/database.js';

/**
 * Save token to UserToken table
 */
export const saveToken = async (uid, token, expiry) => {
  const [result] = await pool.execute(
    `INSERT INTO UserToken (uid, token, expairy) 
     VALUES (?, ?, ?)`,
    [uid, token, expiry]
  );
  return result.insertId;
};

/**
 * Find token by user ID
 */
export const findTokenByUserId = async (uid) => {
  const [rows] = await pool.execute(
    'SELECT * FROM UserToken WHERE uid = ? ORDER BY tid DESC LIMIT 1',
    [uid]
  );
  return rows[0] || null;
};

/**
 * Delete expired tokens (optional cleanup function)
 */
export const deleteExpiredTokens = async () => {
  await pool.execute(
    'DELETE FROM UserToken WHERE expairy < NOW()'
  );
};
