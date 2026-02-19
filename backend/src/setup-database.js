import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const connectionConfig = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: {
    rejectUnauthorized: false // Required for Aiven SSL connections
  }
};

async function setupDatabase() {
  let connection;
  try {
    console.log('Connecting to database...');
    connection = await mysql.createConnection(connectionConfig);
    console.log('Connected successfully!');

    // Read SQL file
    const sqlFile = path.join(__dirname, '../database-setup.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');

    // Split by semicolons and execute each statement
    const statements = sql.split(';').filter(stmt => stmt.trim().length > 0);

    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await connection.execute(statement);
          console.log('✓ Executed SQL statement');
        } catch (error) {
          // Ignore "table already exists" errors
          if (error.code === 'ER_TABLE_EXISTS_ERROR') {
            console.log('⚠ Table already exists, skipping...');
          } else {
            throw error;
          }
        }
      }
    }

    console.log('\n✅ Database setup completed successfully!');
    console.log('Tables created: KodUser, UserToken');
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('Database connection closed.');
    }
  }
}

setupDatabase();
