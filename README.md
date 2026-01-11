## 🚀 Project Overview

This is a decentralized e-commerce DApp where users can:

- Buy products using **MNEE stablecoin**
- Interact directly through their **crypto wallet**
- Avoid signup, login, and personal data sharing
- Request refunds transparently via smart contracts

**Wallet address = User identity**

No email. No password. No data leakage.

---

## ❓ Problem

Traditional e-commerce platforms require users to:
- Create accounts
- Share phone numbers, emails, and bank details
- Trust centralized systems with sensitive data

This creates **privacy risks** and unnecessary friction.

---

## ✅ Solution

This DApp removes all centralized identity requirements.

- Users connect their wallet
- Pay using MNEE stablecoin
- Transactions are tracked by public address
- Refunds are handled through programmable smart contracts
- Analytics are handled off-chain

---

## 🧠 Architecture (Hybrid Model)

- **Frontend:** Web-based DApp (React / Web3)
- **Smart Contracts:** Solidity (payment & refund only)
- **Blockchain:** Ethereum (MNEE stablecoin)
- **Backend:** Transaction indexing & analytics
- **Database:** PostgreSQL (off-chain data storage)

Smart contracts handle **money**  
AI + backend handle **logic & insights**

---

## 💰 How MNEE is Used

- All purchases are made using **MNEE stablecoin**
- Payments are sent directly from user wallets
- Refunds are executed through the smart contract
- Events emitted on-chain are used for analytics

This showcases **real programmable money in commerce**.

---

## 🧪 Demo

▶ **Demo Video (Local Environment):**  


The project is demonstrated using a fully functional **local setup**.  
All payment and refund flows are shown in the demo video.

---

## 🛠️ Tech Stack

- Solidity
- Hardhat
- Ethers.js
- React
- Web3 Wallets
- PostgreSQL
- Node.js

---



### 1️⃣ Install dependencies
```bash
npm install
1. Backend Dependencies
npm install express cors pg ethers fs path dotenv
2. Frontend Dependencies
npm install react react-dom react-router-dom ethers
3. Development Dependencies
npm install -D nodemon @types/node @types/express @types/cors @types/pg

🗄️ Database Schema for PostgreSQL

-- Create database
CREATE DATABASE mnee_commerce;

-- Connect to the database
\c mnee_commerce;

-- 1. Orders table (main table for storing purchases)
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    chain_id INTEGER NOT NULL,
    contract_address VARCHAR(42) NOT NULL,
    order_id VARCHAR(255) NOT NULL,
    buyer_address VARCHAR(42) NOT NULL,
    amount NUMERIC(36, 18) NOT NULL,
    product_name VARCHAR(255) DEFAULT 'Unknown Product',
    tx_hash VARCHAR(66) UNIQUE NOT NULL,
    block_number INTEGER NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    refunded BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Indexer state table (tracks last synced block)
CREATE TABLE indexer_state (
    id SERIAL PRIMARY KEY,
    chain_id INTEGER NOT NULL,
    contract_address VARCHAR(42) NOT NULL,
    last_block INTEGER DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(chain_id, contract_address)
);

-- Create indexes for better performance
CREATE INDEX idx_orders_buyer ON orders(buyer_address);
CREATE INDEX idx_orders_timestamp ON orders(timestamp DESC);
CREATE INDEX idx_orders_contract ON orders(contract_address);
CREATE INDEX idx_orders_refunded ON orders(refunded);

-- Create composite index for common queries
CREATE INDEX idx_orders_buyer_contract ON orders(buyer_address, contract_address);

-- Insert sample products (optional, for reference)
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price NUMERIC(36, 18) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample products matching your frontend
INSERT INTO products (name, price) VALUES
    ('Eminem Music', 48),
    ('Blockchain Course', 115),
    ('Web3 Book', 58),
    ('R.R. Martin Book', 45),
    ('Quantum Computing', 99);

## ▶️ How to Run Locally

2️⃣ Start local blockchain
npx hardhat node
3️⃣ Deploy smart contracts
npx hardhat run scripts/deploy-and-save.js --network localhost
4️⃣ Start backend
cd backend
node index.js
node listener.js
5️⃣ Start frontend
cd frontend
npm run dev

--MetaMask--
Network Name: MNEE Cloud Node

RPC URL: https://outlieralgo.cloud/rpc

Chain ID: 31337

Currency Symbol: ETH


