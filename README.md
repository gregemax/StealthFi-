# StealthFi — Confidential Cross-Chain Lending

Privacy-preserving lending on Solana: deposit native BTC/ETH as collateral, borrow USDC, and liquidate — without anyone seeing your position size.

## The Problem

DeFi lending is fully public. Every whale's collateral, position size, and liquidation threshold is visible to MEV bots and competitors the moment a transaction lands. Institutions refuse to participate because of this. Front-running liquidations is a $100M+/year extraction problem — bots watch the mempool, identify underwater positions, and race to liquidate before honest participants can react.

## How It Works

Users deposit native BTC or ETH as collateral via Ika dWallets — no bridging, the assets never leave their native chains, Solana just controls the signing rights. The collateral amount is FHE-encrypted via Encrypt so no one on-chain can see position sizes, only that a valid encrypted collateral exists. When a position becomes eligible for liquidation, it enters a sealed-bid auction where bids are submitted encrypted and only the winning liquidator ever learns the position details.

## Why Ika + Encrypt

**Ika is not optional.** Traditional cross-chain lending requires bridges, which are custodial, hackable, and introduce counterparty risk. Ika dWallets give Solana programs cryptographic control over BTC/ETH signing without moving assets — the Bitcoin never leaves Bitcoin. This is zero-trust cross-chain custody.

**Encrypt is not optional.** FHE is the only cryptographic primitive that allows computation on encrypted shared state. ZK proofs can verify a statement about private data but can't compute on it collaboratively. TEEs require trusting hardware manufacturers. Generic MPC sacrifices composability. Encrypt's FHE cluster lets the lending program compute health factors and trigger liquidations on ciphertexts — no plaintext ever hits the chain.

## Architecture

```
User → [Solana Frontend]
            ↓
     [Ika dWallet]          ← controls BTC/ETH signing on native chains
            ↓
     [Encrypt FHE Cluster]  ← encrypts collateral amounts, computes health factor
            ↓
     [Solana Program]       ← enforces lending logic, triggers liquidation auctions
            ↓
     [Liquidators]          ← submit sealed encrypted bids, only winner revealed
```

## Getting Started

```bash
git clone https://github.com/gregemax/StealthFi-
cd StealthFi-
npm install
npm run dev
# Open http://localhost:3000
# Connect Phantom wallet (switch to Solana devnet)
```

## How to Test

1. **Connect wallet** — click Connect Wallet in the top nav (Phantom on Solana devnet)
2. **Deposit** — go to `/deposit`, select BTC, enter an amount, click Lock Collateral. Watch the NavBar show **Ika testnet live** in green. The step modal shows the real dWallet ID and FHE ciphertext as they resolve.
3. **Borrow** — go to `/borrow`, move the loan slider, click Borrow. Open browser devtools — watch `[StealthFi FHE]` console logs fire with real computation delays as the health factor is computed on encrypted inputs.
4. **Liquidate** — go to `/liquidations`, pick any at-risk position, click Submit Sealed Bid. Your bid is encrypted before submission; position details only reveal to the winner.

## Deployed Program IDs

| Component | Network | ID |
|---|---|---|
| Ika dWallet | testnet | via `@ika.xyz/sdk` — `getNetworkConfig('testnet')` |
| Encrypt FHE Cluster | devnet (pre-alpha) | `MOCK_FHE_CLUSTER_DEVNET` — TODO: replace when Encrypt goes public |
| Solana Lending Program | devnet | TODO — add when deployed |

## Video Demo

TODO — add Loom link

## Team

Solo builder — Colosseum Frontier 2026, Ika + Encrypt track.
