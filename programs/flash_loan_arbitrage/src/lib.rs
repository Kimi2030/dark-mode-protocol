use anchor_lang::prelude::*;
use anchor_lang::solana_program::{program::invoke, system_instruction};
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

// We define a unique public key for our program. Wait for deployment to replace this.
declare_id!("FLoxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx");

#[program]
pub mod flash_loan_arbitrage {
    use super::*;

    /// Initializes the arbitrage state if needed (optional depending on architecture, 
    /// usually flash loans require no on-chain state other than the execution instruction itself).
    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Flash Loan Arbitrage initialized");
        Ok(())
    }

    /// Executes the flash loan arbitrage and reimburses the relayer
    /// The actual swaps (USDC -> Token X -> SOL -> USDC) will be constructed via CPI
    /// or by packing Jupiter instructions in the same transaction. Here we focus on the
    /// validation and relayer reimbursement logic.
    pub fn reimburse_relayer(
        ctx: Context<ReimburseRelayer>,
        expected_profit: u64,
        gas_cost: u64,
        relayer_bounty: u64,
    ) -> Result<()> {
        let relayer = &ctx.accounts.relayer;
        let user = &ctx.accounts.user;
        let user_token_account = &ctx.accounts.user_token_account;
        
        // Security check: ensure the signer is authorized.
        // In a real scenario, you'd check against a whitelist or just ensure the relayer signed.
        require!(relayer.is_signer, ArbitrageError::UnauthorizedRelayer);

        // Calculate total cost to reimburse
        let total_cost = gas_cost.checked_add(relayer_bounty).ok_or(ArbitrageError::MathOverflow)?;

        // Ensure the expected profit is greater than the total cost
        require!(expected_profit > total_cost, ArbitrageError::UnprofitableArbitrage);

        // Verify balance after the arbitrage instructions (which ran earlier in the transaction).
        // For security, you would normally store the `pre_balance` and compare it with current balance,
        // or rely on the flash loan provider's built-in repayment check, ensuring the net gain is positive.
        
        let current_balance = user_token_account.amount;
        msg!("Current Arbitrage Balance: {}", current_balance);

        // Here we simulate the transfer from the profit generated to the relayer.
        // Assuming the profit is in native SOL for gas reimbursement, or USDC (we use SOL here for direct gas coverage):
        let transfer_instruction = system_instruction::transfer(
            user.key,
            relayer.key,
            total_cost,
        );

        invoke(
            &transfer_instruction,
            &[
                user.to_account_info(),
                relayer.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
            ],
        )?;

        msg!("Reimbursed relayer {} lamports", total_cost);

        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}

#[derive(Accounts)]
pub struct ReimburseRelayer<'info> {
    /// The user who initiated the arbitrage
    #[account(mut)]
    pub user: Signer<'info>,

    /// The relayer (fee payer) who submits the transaction
    #[account(mut)]
    pub relayer: Signer<'info>,

    /// The user's token account (e.g., USDC or WSOL) where profit is deposited
    #[account(mut)]
    pub user_token_account: Account<'info, TokenAccount>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
}

#[error_code]
pub enum ArbitrageError {
    #[msg("The expected profit is less than the gas cost plus bounty.")]
    UnprofitableArbitrage,
    #[msg("Math overflow occurred calculating costs.")]
    MathOverflow,
    #[msg("Signer is not an authorized relayer.")]
    UnauthorizedRelayer,
}
