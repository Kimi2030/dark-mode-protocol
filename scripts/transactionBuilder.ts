import {
  Connection,
  Keypair,
  PublicKey,
  TransactionInstruction,
  TransactionMessage,
  VersionedTransaction,
  AddressLookupTableAccount,
} from '@solana/web3.js';
import bs58 from 'bs58';

/**
 * Interface representing the inputs required to build a V0 transaction
 * for Flash Loan Arbitrage with Relayer Fee Payer logic.
 */
export interface ArbitrageTxParams {
  connection: Connection;
  userPublicKey: PublicKey;
  relayerPublicKey: PublicKey;
  instructions: TransactionInstruction[];
  lookupTableAddresses: string[];
  recentBlockhash: string;
}

/**
 * Builds a VersionedTransaction (MessageV0) utilizing Address Lookup Tables (LUTs).
 * Configures the transaction such that the 'relayer' pays the gas base fee.
 */
export async function buildArbitrageVersionedTransaction({
  connection,
  userPublicKey,
  relayerPublicKey,
  instructions,
  lookupTableAddresses,
  recentBlockhash,
}: ArbitrageTxParams): Promise<VersionedTransaction> {
  // 1. Fetch and resolve Address Lookup Tables
  const lookupTables: AddressLookupTableAccount[] = [];
  for (const address of lookupTableAddresses) {
    const lutPubKey = new PublicKey(address);
    const lookupTableAccount = await connection.getAddressLookupTable(lutPubKey);
    if (lookupTableAccount.value) {
      lookupTables.push(lookupTableAccount.value);
    } else {
      console.warn(`LUT not found or empty: ${address}`);
    }
  }

  // 2. Compile MessageV0
  // Setup the relayer as the payer of the transaction fee
  const messageV0 = new TransactionMessage({
    payerKey: relayerPublicKey,
    recentBlockhash: recentBlockhash,
    instructions: instructions, // This array must include the reimburse_relayer IX and Jupiter Swaps
  }).compileToV0Message(lookupTables);

  // 3. Create Versioned Transaction
  const transaction = new VersionedTransaction(messageV0);

  return transaction;
}

/**
 * Signs the VersionedTransaction as the User (partial signer).
 */
export function signAsUser(
  transaction: VersionedTransaction,
  userKeypair: Keypair
): VersionedTransaction {
  transaction.sign([userKeypair]);
  return transaction;
}

/**
 * Signs the VersionedTransaction as the Relayer Fee Payer.
 * Called by the backend/bot after verifying expected profit > gas block.
 */
export function signAsRelayer(
  transaction: VersionedTransaction,
  relayerKeypair: Keypair
): VersionedTransaction {
  transaction.sign([relayerKeypair]);
  return transaction;
}

/**
 * Utility to serialize the transaction for transport between Frontend <-> Backend
 */
export function serializeTransaction(transaction: VersionedTransaction): string {
  const serializedBytes = transaction.serialize();
  return bs58.encode(serializedBytes);
}

/**
 * Utility to deserialize the transaction
 */
export function deserializeTransaction(base58String: string): VersionedTransaction {
  const decodedBytes = bs58.decode(base58String);
  return VersionedTransaction.deserialize(decodedBytes);
}

/**
 * Adds an MEV Jito Tip instruction to an array of instructions
 */
export function addJitoTipInstruction(
  instructions: TransactionInstruction[],
  userPublicKey: PublicKey,
  tipAmountLamports: number,
  jitoTipAccountPubkey: PublicKey
): TransactionInstruction[] {
  // Note: the jitoTipAccountPubkey is one of Jito's designated tip accounts
  import('@solana/web3.js').then(({ SystemProgram }) => {
      const tipIx = SystemProgram.transfer({
        fromPubkey: userPublicKey,
        toPubkey: jitoTipAccountPubkey,
        lamports: tipAmountLamports,
      });
      instructions.push(tipIx);
  })
  
  return instructions;
}
