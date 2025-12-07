-- 1. Create the Database (Schema)
CREATE SCHEMA IF NOT EXISTS FinexaLoansDB;
USE FinexaLoansDB;

-- 2. Create the users table
CREATE TABLE users (
    -- FIX: Use CHAR(36) for UUID storage. Use DATETIME.
    user_id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    date_of_birth DATE,
    phone_number VARCHAR(20),
    occupation VARCHAR(100),
    address TEXT,
    national_id VARCHAR(50) UNIQUE,
    created_at DATETIME NOT NULL DEFAULT NOW(),
    updated_at DATETIME NOT NULL DEFAULT NOW()
);

-- 3. Create the loans table
CREATE TABLE loans (
    -- FIX: Use CHAR(36) and DATETIME.
    loan_id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    borrower_id CHAR(36) NOT NULL, 
    loan_type VARCHAR(50) NOT NULL,
    amount DECIMAL(14,2) NOT NULL, 
    interest_rate DECIMAL(6,4) NOT NULL, 
    duration_months INT NOT NULL,
    collateral VARCHAR(255),
    status VARCHAR(50) NOT NULL,
    start_date DATE NOT NULL,
    next_due_date DATE NOT NULL,
    created_at DATETIME NOT NULL DEFAULT NOW(),
    updated_at DATETIME NOT NULL DEFAULT NOW(),
    FOREIGN KEY (borrower_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 4. Create the payments table
CREATE TABLE payments (
    -- FIX: Use CHAR(36) and DATETIME.
    payment_id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    loan_id CHAR(36) NOT NULL,
    amount_paid DECIMAL(14,2) NOT NULL,
    payment_date DATETIME NOT NULL, 
    payment_method VARCHAR(50) NOT NULL,
    scheduled_due_date DATE NOT NULL,
    created_at DATETIME NOT NULL DEFAULT NOW(),
    FOREIGN KEY (loan_id) REFERENCES loans(loan_id) ON DELETE CASCADE
);

-- 5. Helpful Indexes (Standard MySQL syntax)
CREATE INDEX idx_loans_borrower_id ON loans(borrower_id);
CREATE INDEX idx_payments_loan_id ON payments(loan_id);