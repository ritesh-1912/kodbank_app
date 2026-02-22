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
 * Verify password
 */
export const verifyPassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};
