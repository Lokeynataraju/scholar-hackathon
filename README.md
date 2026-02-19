# Scholar-SBT: On-Chain Achievement Verification System

**RIFT 2026 Hackathon - Build on Algorand Track**

## 🚀 Live Demo & Links
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FLokeynataraju%2Fscholar-sbt)

- **Frontend URL:** [https://scholar-hackathon.vercel.app](https://scholar-hackathon.vercel.app)
- **LinkedIn Demo Video:** [LINK_TO_YOUR_LINKEDIN_VIDEO] (Your video MUST tag RIFT's official LinkedIn page: https://www.linkedin.com/company/rift-pwioi/)
- **Testnet Contract App ID:** `755768738`
- **Testnet Explorer Link:** [https://lora.algorand.io/testnet/application/755768738](https://lora.algorand.io/testnet/application/755768738)

## 📝 Problem Statement
> **"Fake degrees are a billion-dollar industry. Verification is a nightmare."**

We address the critical issues of **Credential Fraud** and **Verification Inefficiency**.
*   **Fraud:** Anyone can forge a PDF certificate.
*   **Time:** Employers take weeks to verify education history.
*   **Ownership:** Students don't own their records; universities do.

👉 **[📄 Read the Full Pitch & Solution (PITCH.md)](PITCH.md)**

**The Solution:** Scholar-SBT issues **Soulbound Tokens** on Algorand. These are permanent, tamper-proof, and instantly verifiable via QR Code.

## ⭐ Key Features (Winning Factors)
1.  **Smart "Proof of Watch"**: Students cannot just click "Claim". A smart timer ensures they watch the video content before the Mint button unlocks.
2.  **Instant QR Verification**: Employers scan a QR code to see a **Dynamically Generated Student Profile** (Total Courses, Skill Level, Rank) fetched directly from the blockchain/local history.
3.  **Token-Gated Masterclass (DeFi)**: A "Learn-to-Earn" economy. Students earn coins by learning, then SPEND those coins to unlock premium content (e.g., Data Structures Masterclass).
4.  **Tamper-Proof Credentials**: Uses Algorand Standard Assets (ASAs) that are frozen/soulbound to the student's wallet.

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
git clone https://github.com/Lokeynataraju/scholar-sbt.git
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

## 👥 Team Members (The Builders)
We built this together with equal passion and distinct expertise:

1.  **Akash (Full Stack Lead)**  
    *   Designed the **System Architecture** and **Smart Contract Logic** (TEALScript).
    *   Managed the end-to-end integration of Blockchain with the Frontend.
2.  **Harshith Kumar C (Frontend Engineer)**  
    *   Built the entire **Interactive UI/UX** using React & Tailwind.
    *   Implemented the **Gamification Logic** (Points, Leaderboard, Wallet Connection).
3.  **Meghana M (Blockchain Developer)**  
    *   Optimized the **Algorand Asset Structure** (ASAs) and box storage retrieval.
    *   Handled **Smart Contract Verification Scenarios** and security checks.
4.  **Bhavana N (Product & Deployment)**  
    *   Defined the **User Journey** and **Real-World Use Cases** (Zero-Knowledge verification).
    *   Managed the **Vercel Deployment Pipeline** and Quality Assurance testing.

---
*Built for RIFT 2026 Hackathon | Powered by Algorand*
