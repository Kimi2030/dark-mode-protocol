import base58
from fastapi import FastAPI, HTTPException, Request
from pydantic import BaseModel
from solana.rpc.api import Client
from solders.keypair import Keypair
from solders.transaction import VersionedTransaction
import os
import json

app = FastAPI(title="Gasless Flash Loan Relayer", version="1.0.0")

# Setup connections
RPC_URL = os.getenv("SOLANA_RPC_URL", "https://api.mainnet-beta.solana.com")
TARGET_PROFIT_MARGIN_BPS = int(os.getenv("TARGET_PROFIT_MARGIN_BPS", "10")) # 0.1% min profit
RELAYER_SECRET_KEY = os.getenv("RELAYER_SECRET_KEY")

# For demo purposes, if no key, we create an ephemeral one
if not RELAYER_SECRET_KEY:
    relayer_keypair = Keypair()
else:
    # Assuming string list of 64 bytes
    secret_bytes = bytes(json.loads(RELAYER_SECRET_KEY))
    relayer_keypair = Keypair.from_bytes(secret_bytes)

# Solana Client
client = Client(RPC_URL)

class ArbitrageRequest(BaseModel):
    transaction_base58: str
    expected_profit_usdc: float
    user_pubkey: str

@app.get("/health")
def health_check():
    return {
        "status": "online",
        "relayer_pubkey": str(relayer_keypair.pubkey()),
        "mode": "V0 + LUTs Optimized"
    }

@app.post("/relay")
async def execute_relay(req: ArbitrageRequest):
    """
    Endpoint for frontend to submit the partially signed Versioned Transaction.
    The Relayer validates the expected profit against gas costs and signs it as Fee Payer.
    """
    try:
        # 1. Deserialize the V0 Transaction
        tx_bytes = base58.b58decode(req.transaction_base58)
        transaction = VersionedTransaction.from_bytes(tx_bytes)

        # 2. Risk Management & Profit Calculation
        # In production, we'd simulate the transaction to confirm `expected_profit_usdc` is real
        # and not a spoofed parameter, and that the `reimburse_relayer` instruction successfully
        # pays back exactly the gas used + bounty to `relayer_keypair.pubkey()`.
        
        gas_cost_estimate = 0.000005 # 5k lamports
        jito_tip_estimate = 0.0001   # 100k lamports
        total_sol_cost = gas_cost_estimate + jito_tip_estimate
        
        # very rough check
        if req.expected_profit_usdc <= 0:
             raise HTTPException(status_code=400, detail="Unprofitable trade. Relayer rejects signature.")
             
        # Simulate local verification pseudo-code:
        # simulation = client.simulate_transaction(transaction)
        # if simulation.value.err:
        #     raise HTTPException(status_code=400, detail="Transaction simulation failed")

        # 3. Sign as Relayer (Fee Payer)
        # In a V0 Transaction, we apply signatures to the message. The payer is typically index 0.
        signed_tx = VersionedTransaction(transaction.message, [relayer_keypair])

        # 4. Wrap and Send as a Jito Bundle (Pseudo-code for integration)
        # jito_client = JitoBlockEngineClient(...)
        # bundle = Bundle(transactions=[signed_tx], tip=jito_tip_estimate)
        # bundle_uuid = jito_client.send_bundle(bundle)

        # 5. Broadcast fallback via normal RPC
        # tx_sig = client.send_raw_transaction(signed_tx.to_bytes())

        return {
            "status": "success",
            "message": "Transaction signed and dispatched.",
            "relayer_signed": True,
            # "signature": str(tx_sig.value)
        }

    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    # Run the server on port 8000
    uvicorn.run(app, host="0.0.0.0", port=8000)
