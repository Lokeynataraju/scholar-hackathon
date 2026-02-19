# Scholar-SBT: On-Chain Achievement Verification System

**RIFT 2026 Hackathon - Build on Algorand Track**

## 🚀 Live Demo
- **Frontend URL:** [https://scholar-hackathon.vercel.app](https://scholar-hackathon.vercel.app)
- **LinkedIn Demo Video:** [LINK_TO_YOUR_LINKEDIN_VIDEO] (Your video MUST tag RIFT's official LinkedIn page: https://www.linkedin.com/company/rift-pwioi/)
- **Testnet Contract App ID:** `755768739`
- **Testnet Explorer Link:** [https://lora.algorand.io/testnet/application/755768739](https://lora.algorand.io/testnet/application/755768739)

## 📝 Problem Statement
**Note:** Select your problem statement on the RIFT website (Window: 19 Feb, 6:00 PM – 8:00 PM).
*(Replace this section with your selected problem statement or description of your original idea once chosen)*

Current educational credentials (certificates, degrees) are fragmented, easily forgeable, and hard to verify instantly. Students lack ownership of their achievements, and employers struggle with verification.

**Solution:** Scholar-SBT issues Soulbound Tokens (SBTs) on the Algorand blockchain. These act as verifiable, tamper-proof digital credentials that students own and can share instantly.

## 🏗 Architecture Overview

The system consists of three main components:

1.  **Smart Contract (Algorand):** 
    -   Written in **TEALScript** (AlgoKit).
    -   Manages `createMilestone` (Admin only) and `claimScholarSBT` (Student).
    -   Stores achievements in Box Storage (mapping `student_address -> milestone_id`).
    -   Ensures non-transferability (Soulbound) logic.

2.  **Frontend (React + Vite):**
    -   Built with **AlgoKit Utils** and **use-wallet-react**.
    -   Connects to Pera/Defly/Exodus wallets (and Mnemonic for dev testing).
    -   Provides distinct UI for Admins (create), Students (claim), and Verifiers (check).

3.  **Use of AlgoKit:**
    -   Project initialized with `algokit init`.
    -   Local development using `algokit localnet`.
    -   Deployed to Testnet using `algokit deploy`.

## 🛠 Tech Stack
-   **Blockchain:** Algorand
-   **Toolkit:** AlgoKit
-   **Smart Contract:** TEALScript (TypeScript)
-   **Frontend:** React, Vite, TailwindCSS, DaisyUI
-   **Wallet Integration:** @txnlab/use-wallet-react
-   **Deployment:** Vercel (Frontend), Algorand Testnet (Contract)

## ⚙️ Installation & Setup

### Prerequisites
-   Node.js v18+
-   Docker (for LocalNet)
-   AlgoKit CLI

### 1. Clone Repository
```bash
git clone https://github.com/YOUR_GITHUB_USERNAME/scholar-sbt.git
cd scholar-sbt
```

### 2. Install Dependencies
```bash
algokit bootstrap all
```

### 3. Run LocalNet (Optional for local testing)
```bash
algokit localnet start
npm run deploy:localnet # Deploys contract to LocalNet
```

### 4. Run Frontend
```bash
cd projects/frontend
npm run dev
```
Open [http://localhost:5173](http://localhost:5173)

## 📖 Usage Guide

### 1. Admin Role
-   Connect wallet (Creator account).
-   Go to **Admin** tab.
-   Enter "Milestone Name" (e.g., "Dean's List 2024") and "Metadata URI".
-   Click **Create Milestone**.
-   *Note the Milestone ID generated.*

### 2. Student Role
-   Connect student wallet.
-   Go to **Student** tab.
-   Enter the **Milestone ID**.
-   Click **Claim**.
-   The SBT is now minted to your account!

### 3. Verification
-   Go to **Verify** tab.
-   Enter any Student Address and Milestone ID.
-   System checks on-chain if the student holds that specific SBT.

## ⚠️ Known Limitations
-   Currently, anyone can claim an SBT if they know the ID (in a real-world scenario, we would add an allowlist or admin-signature check for claiming).
-   Metadata URI is stored as a simple string; integration with IPFS for file hosting is manual.

## 👥 Team Members
-   **Team Lead / Full Stack:** [Your Name]
-   **Role:** [Your Role]
-   *(Add other team members here)*

---
*Built for RIFT 2026 Hackathon | Powered by Algorand*
