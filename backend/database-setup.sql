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

-- Card table (one or more per user)
CREATE TABLE IF NOT EXISTS Card (
    id INT AUTO_INCREMENT PRIMARY KEY,
    uid INT NOT NULL,
    last_four VARCHAR(4) NOT NULL,
    card_type ENUM('debit', 'credit') DEFAULT 'debit',
    brand VARCHAR(20) DEFAULT 'Visa',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (uid) REFERENCES KodUser(uid) ON DELETE CASCADE,
    INDEX idx_uid (uid)
);

-- Transaction history
CREATE TABLE IF NOT EXISTS Transaction (
    id INT AUTO_INCREMENT PRIMARY KEY,
    uid INT NOT NULL,
    type ENUM('credit', 'debit') NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    description VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (uid) REFERENCES KodUser(uid) ON DELETE CASCADE,
    INDEX idx_uid (uid),
    INDEX idx_created (created_at)
);
