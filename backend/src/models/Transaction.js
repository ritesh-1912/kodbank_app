import pool from '../config/database.js';

/**
 * Get recent transactions for a user by uid
 */
export const getTransactionsByUid = async (uid, options = {}) => {
  const { limit = 20, type, search } = options;
  const limitNum = Math.min(parseInt(limit, 10) || 20, 50);
  let sql = `SELECT id, type, amount, description, created_at AS createdAt 
             FROM \`Transaction\` WHERE uid = ?`;
  const params = [uid];
  if (type === 'credit' || type === 'debit') {
    sql += ' AND type = ?';
    params.push(type);
  }
  if (search && String(search).trim()) {
    sql += ' AND description LIKE ?';
    params.push(`%${String(search).trim()}%`);
  }
  sql += ' ORDER BY created_at DESC LIMIT ?';
  params.push(limitNum);
  const [rows] = await pool.execute(sql, params);
  return rows;
};

/**
 * Insert a single transaction record
 */
export const insertTransaction = async (uid, type, amount, description) => {
  await pool.execute(
    'INSERT INTO `Transaction` (uid, type, amount, description) VALUES (?, ?, ?, ?)',
    [uid, type, amount, description]
  );
};

/**
 * Insert transaction using same connection (for transfers)
 */
export const insertTransactionWithConnection = async (connection, uid, type, amount, description) => {
  await connection.execute(
    'INSERT INTO `Transaction` (uid, type, amount, description) VALUES (?, ?, ?, ?)',
    [uid, type, amount, description]
  );
};

/**
 * Insert sample transactions for new user
 */
export const insertSampleTransactions = async (uid) => {
  const samples = [
    ['credit', 100000, 'Account opening bonus'],
    ['debit', 2500, 'Utility payment'],
    ['debit', 1200, 'Shopping'],
    ['credit', 5000, 'Transfer received'],
    ['debit', 800, 'Subscription']
  ];
  for (const [type, amount, description] of samples) {
    await pool.execute(
      'INSERT INTO `Transaction` (uid, type, amount, description) VALUES (?, ?, ?, ?)',
      [uid, type, amount, description]
    );
  }
};
