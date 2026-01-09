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

## ▶️ How to Run Locally

### 1️⃣ Install dependencies
```bash
npm install
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

