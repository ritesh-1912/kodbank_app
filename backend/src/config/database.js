import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

let pool = null;

/**
 * Get the connection pool, creating it on first use.
 * Lazy init ensures process.env is read at request time on Vercel (not at cold start).
 */
function getPool() {
  if (pool) return pool;

  const host = process.env.DB_HOST;
  if (!host || (typeof host === 'string' && host.trim() === '')) {
    const onVercel = !!process.env.VERCEL;
    throw new Error(
      onVercel
        ? 'DB_HOST is not set in this Vercel function. In Vercel: Project → Settings → Environment Variables, add DB_HOST (and DB_PORT, DB_USER, DB_PASSWORD, DB_NAME). Set for Production (and Preview). Then Deployments → Redeploy. If you use Root Directory, set it to the repo root (.) so the api/ receives env vars.'
        : 'DB_HOST is not set. Add DB_HOST to your .env or environment.'
    );
  }

  const port = parseInt(process.env.DB_PORT, 10) || 3306;
  pool = mysql.createPool({
    host: host.trim(),
    port: Number.isNaN(port) ? 3306 : port,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    ssl: process.env.DB_SSL === 'false' ? undefined : { rejectUnauthorized: false },
    connectTimeout: 10000,
  });

  return pool;
}

// Default export: lazy pool so process.env is read at first request time (fixes Vercel ENOTFOUND)
const poolProxy = {
  execute(...args) {
    return getPool().execute(...args);
  },
  query(...args) {
    return getPool().query(...args);
  }
};
export default poolProxy;
