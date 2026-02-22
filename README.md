# Dark Mode Protocol - Solana Flash Loan Arbitrage

A high-frequency, gasless circular arbitrage architecture built on Solana. This repository integrates Versioned Transactions (V0), Address Lookup Tables (LUTs), and MEV tip execution with a gasless fee-payer abstraction.

## Project Structure

- `programs/` - The Rust/Anchor smart contract containing the `reimburse_relayer` logic.
- `app/` - The Next.js 14 frontend built with Tailwind CSS, Framer Motion, and Lucide React.
- `scripts/` - TypeScript transaction builder for V0 messages and LUT resolution.
- `relayer/` - Python FastAPI backend acts as the fee-payer bot to sign profitable gasless transactions.

## Setup Instructions

### 1. Smart Contract (Anchor)
You will need Rust and the Solana CLI installed.
```bash
# Build the program
anchor build
```

### 2. Frontend Dashboard
```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

### 3. Relayer Bot (Python)
```bash
cd relayer
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python relayer.py
```

## GitHub Deployment Setup

Run these commands in your terminal to connect this local repository to a new GitHub repository:

```bash
# 1. Create a repository on GitHub via the web interface.
# 2. Link your local project to your GitHub repository:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY_NAME.git
git branch -M main
git push -u origin main
```

## V2 Arbitrage Capabilities (Global Scanner Update)
We have expanded the Tactical Dashboard to emulate a globally connected arbitrage feed:

- **Wallet Configurator**: Added a dedicated `RECEIVER WALLET` input field. The execution logic will explicitly fail if no wallet address is provided.
- **Provider Switching**: Select the capital provider for your flash loan (`Solend`, `Marginfi`, `Kamino`, `Meteora`, `Drift`).
- **Global Opportunity Scanner**: 
  - Integrated a live-scrolling simulated feed aggregating data from 24 major platforms (12 CEXs and 12 DEXs).
  - Uses an expanded list of 12 volatile Solana crypto assets.
- **One-Click Execution Matrix**: Clicking `EXECUTE` on a specific Matrix Opportunity automatically routes those specific buy/sell exchanges and expected spreads directly into the simulation backend.
