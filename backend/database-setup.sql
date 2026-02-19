-- Kodbank Database Schema Setup
-- Run this script in your MySQL database (Aiven)

-- Create KodUser table
CREATE TABLE IF NOT EXISTS KodUser (
    uid INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    role ENUM('customer', 'manager', 'admin') DEFAULT 'customer',
    balance DECIMAL(15, 2) DEFAULT 100000.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create UserToken table
CREATE TABLE IF NOT EXISTS UserToken (
    tid INT AUTO_INCREMENT PRIMARY KEY,
    token TEXT NOT NULL,
    uid INT NOT NULL,
    expairy DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (uid) REFERENCES KodUser(uid) ON DELETE CASCADE,
    INDEX idx_uid (uid),
    INDEX idx_expairy (expairy)
);
