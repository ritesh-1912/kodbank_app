import pool from '../config/database.js';
import bcrypt from 'bcryptjs';

/**
 * Create a new user with default balance of 100000. UID is auto-assigned by database.
 */
export const createUser = async (username, email, password, phone, role = 'customer') => {
  const hashedPassword = await bcrypt.hash(password, 12);
  const balance = 100000; // Default initial balance

  const [result] = await pool.execute(
    `INSERT INTO KodUser (username, email, password, phone, role, balance) 
     VALUES (?, ?, ?, ?, ?, ?)`,
    [username, email, hashedPassword, phone, role, balance]
  );

  return result.insertId;
};

/**
 * Find user by username
 */
export const findByUsername = async (username) => {
  const [rows] = await pool.execute(
    'SELECT * FROM KodUser WHERE username = ?',
    [username]
  );
  return rows[0] || null;
};

/**
 * Find user by email
 */
export const findByEmail = async (email) => {
  const [rows] = await pool.execute(
    'SELECT * FROM KodUser WHERE email = ?',
    [email]
  );
  return rows[0] || null;
};

/**
 * Get balance by username
 */
export const getBalanceByUsername = async (username) => {
  const [rows] = await pool.execute(
    'SELECT balance FROM KodUser WHERE username = ?',
    [username]
  );
  return rows[0]?.balance || null;
};

/**
 * Get uid by username (for cards/transactions)
 */
export const getUidByUsername = async (username) => {
  const [rows] = await pool.execute(
    'SELECT uid FROM KodUser WHERE username = ?',
    [username]
  );
  return rows[0]?.uid ?? null;
};

/**
 * Find user by uid (for transfers)
 */
export const findByUid = async (uid) => {
  const [rows] = await pool.execute('SELECT uid, username, balance FROM KodUser WHERE uid = ?', [uid]);
  return rows[0] || null;
};

/**
 * Get balance by uid
 */
export const getBalanceByUid = async (uid) => {
  const [rows] = await pool.execute('SELECT balance FROM KodUser WHERE uid = ?', [uid]);
  return rows[0]?.balance ?? null;
};

/**
 * Transfer amount from one user to another (call within a connection transaction)
 */
export const deductBalance = async (connection, uid, amount) => {
  const [result] = await connection.execute(
    'UPDATE KodUser SET balance = balance - ? WHERE uid = ? AND balance >= ?',
    [amount, uid, amount]
  );
  return result.affectedRows === 1;
};

export const addBalance = async (connection, uid, amount) => {
  const [result] = await connection.execute(
    'UPDATE KodUser SET balance = balance + ? WHERE uid = ?',
    [amount, uid]
  );
  return result.affectedRows === 1;
};

/**
 * Verify password
 */
export const verifyPassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};
