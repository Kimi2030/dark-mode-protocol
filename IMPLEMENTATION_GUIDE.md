# Dark Mode Protocol - Implementation Guide

This guide breaks down the core technical implementation of the Solana Flash Loan Arbitrage system. It is designed for developers who want to understand how the 4 core pillars of the application interact to achieve gasless, high-frequency execution.

---

## Pillar 1: The Smart Contract (`programs/flash_loan_arbitrage/src/lib.rs`)

The Rust/Anchor program acts as the on-chain enforcer for the flash loan. 

### Core Logic: `reimburse_relayer`
Because we are executing "gasless" transactions, a Relayer wallet must pay the Solana base fee. The smart contract ensures the Relayer is mathematically guaranteed to be reimbursed from the arbitrage profit.

1. **Signer Verification**: It explicitly requires that the `relayer` account signed the transaction. 
   `require!(relayer.is_signer, ArbitrageError::UnauthorizedRelayer);`
2. **Profitability Check**: It mathematically ensures `expected_profit > (gas_cost + relayer_bounty)`. If the profit isn't high enough, the smart contract aborts, reverting the flash loan.
3. **Reimbursement**: It executes a system transfer, moving the gas cost directly from the user's profit account back to the relayer.

---

## Pillar 2: Transaction Engine (`scripts/transactionBuilder.ts`)

Standard Solana transactions are limited to 1232 bytes. A complex arbitrage route (User -> Flash Loan -> Orca -> Raydium -> Meteora -> Flash Loan Repay) requires easily 30+ accounts, which exceeds the byte limit.

### Address Lookup Tables (LUTs) & V0
We solve this by utilizing **Versioned Transactions (V0)**.
1. `buildArbitrageVersionedTransaction`: Fetches the public keys stored in predefined LUT arrays, compressing them into 1-byte indexes.
2. `TransactionMessage.compileToV0Message(lookupTables)`: Compresses the heavy instruction set.
3. **Partial Signing**: The transactions are structured to allow Two-Party signing.
   - `signAsUser`: The personal wallet signs to authorize the token movements.
   - `signAsRelayer`: The Python bot signs to authorize paying the network SOL fee.

---

## Pillar 3: Relayer Bot (`relayer/relayer.py`)

The Relayer is a Python FastAPI service that monitors execution requests and subsidizes network fees (Gasless execution).

1. **API Endpoint (`/relay`)**: The frontend sends the partially signed V0 transaction to this endpoint.
2. **Risk Management Evaluation**: The python script unpacks the Base58 string, simulates the transaction against the Solana RPC, and verifies that the `reimburse_relayer` instruction successfully loop-backs the gas cost.
3. **MEV Bundling (Jito)**: If profitable, the Python script signs the transaction and wraps it in a **Jito Bundle**, sending it directly to a Jito Block Engine. This completely bypasses the public mempool, making it impossible for other bots to "front-run" or steal the arbitrage opportunity.

---

## Pillar 4: Tactical Dashboard (`app/page.tsx`)

The Next.js 14 frontend serves as the visual command center. It uses Framer Motion, Tailwind CSS, and Lucide React.

### Architecture Highlights
- **State Management**: Uses React Hooks (`useState`, `useEffect`) to manage the Global Opportunity Scanner feed, which simulates scanning 24 different DEX and CEX platforms.
- **Wallet Connection**: A `RECEIVER WALLET` input field dictates where profits are routed on-chain.
- **Dynamic Formula Rendering**: Instantly calculates the mathematical net-profit (`Est. Net Profit`) based on Jito Validator Tips and the Loan size using the formula:
  `P_net = (R_exp * (1-S)) - (A_in * (1+F_loan)) - T_jito - F_relayer`
- **One-Click Execution Matrix**: Clicking `Execute` on the global scanner auto-fills the transaction builder parameters and triggers the logging simulation cycle (`Scanning` -> `Building V0` -> `Jito Simulating` -> `Confirmed`).
