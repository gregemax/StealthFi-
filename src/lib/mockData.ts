export const MOCK_STATS = {
  totalLockedValue: "$142,847,293",
  activeLoans: "3,847",
  yourCollateral: null, // always encrypted
  yourHealthFactor: 1.82,
};

export const MOCK_ASSETS = [
  { symbol: "BTC", name: "Bitcoin", icon: "₿", via: "Ika dWallet" },
  { symbol: "ETH", name: "Ethereum", icon: "Ξ", via: "Ika dWallet" },
];

export const MOCK_LIQUIDATIONS = [
  {
    id: "0x4f3a...██████",
    collateralType: "BTC",
    ltvRange: "82–89%",
    closesIn: 3600, // seconds
    estimatedSize: "~$48k–$61k",
  },
  {
    id: "0x7c1b...██████",
    collateralType: "ETH",
    ltvRange: "85–91%",
    closesIn: 7200,
    estimatedSize: "~$12k–$18k",
  },
  {
    id: "0x2e9d...██████",
    collateralType: "BTC",
    ltvRange: "80–86%",
    closesIn: 1800,
    estimatedSize: "~$95k–$120k",
  },
  {
    id: "0x8a5f...██████",
    collateralType: "ETH",
    ltvRange: "83–88%",
    closesIn: 5400,
    estimatedSize: "~$7k–$11k",
  },
];

export const MOCK_BORROW_MAX_USDC = 50000;

export const DEPOSIT_STEPS = [
  "Creating dWallet via Ika...",
  "Encrypting collateral via Encrypt FHE...",
  "Confirmed on Solana devnet ✓",
];

export const BORROW_STEPS = [
  "Verifying encrypted collateral proof...",
  "Issuing loan via Encrypt FHE...",
  "Confirmed on Solana devnet ✓",
];
