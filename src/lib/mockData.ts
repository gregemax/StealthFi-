export const MOCK_STATS = {
  totalLockedValue: "$142,847,293",
  activeLoans: "3,847",
  yourCollateral: null,
  yourHealthFactor: 1.82,
};

export const MOCK_ASSETS = [
  { symbol: "BTC", name: "Bitcoin", icon: "₿", via: "Ika dWallet (Bitcoin mainnet)" },
  { symbol: "ETH", name: "Ethereum", icon: "Ξ", via: "Ika dWallet (Ethereum mainnet)" },
];

export const ASSET_PRICES: Record<string, number> = {
  BTC: 97000,
  ETH: 3200,
};

export interface LiquidationPosition {
  id: string;
  asset: "BTC" | "ETH";
  collateralRange: string;
  ltv: number;
  healthFactor: number;
  closesInSeconds: number;
}

export const MOCK_LIQUIDATIONS: LiquidationPosition[] = [
  {
    id: "0xSTLTH:4f3ab91c",
    asset: "BTC",
    collateralRange: "$45,000 – $67,000",
    ltv: 87,
    healthFactor: 1.12,
    closesInSeconds: 3600 * 2,
  },
  {
    id: "0xSTLTH:7c1be04a",
    asset: "ETH",
    collateralRange: "$12,000 – $18,000",
    ltv: 83,
    healthFactor: 1.28,
    closesInSeconds: 3600 * 5,
  },
  {
    id: "0xSTLTH:2e9df773",
    asset: "BTC",
    collateralRange: "$95,000 – $120,000",
    ltv: 91,
    healthFactor: 1.07,
    closesInSeconds: 3600 * 8,
  },
  {
    id: "0xSTLTH:8a5fc2d1",
    asset: "ETH",
    collateralRange: "$7,000 – $11,000",
    ltv: 79,
    healthFactor: 1.41,
    closesInSeconds: 3600 * 3,
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
