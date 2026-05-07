import { describe, it, expect } from "vitest";
import { MOCK_STATS, MOCK_ASSETS, MOCK_LIQUIDATIONS, DEPOSIT_STEPS, BORROW_STEPS } from "@/lib/mockData";
import { SOLANA_RPC, IKA_NETWORK, FHE_CLUSTER_ID, LIQUIDATION_THRESHOLD, COLLATERAL_RATIO } from "@/lib/constants";

describe("mockData", () => {
  it("MOCK_STATS has required fields", () => {
    expect(MOCK_STATS.totalLockedValue).toBeTruthy();
    expect(MOCK_STATS.activeLoans).toBeTruthy();
    expect(typeof MOCK_STATS.yourHealthFactor).toBe("number");
    expect(MOCK_STATS.yourCollateral).toBeNull();
  });

  it("MOCK_ASSETS has BTC and ETH", () => {
    const symbols = MOCK_ASSETS.map((a) => a.symbol);
    expect(symbols).toContain("BTC");
    expect(symbols).toContain("ETH");
  });

  it("MOCK_LIQUIDATIONS has 4 entries with required fields", () => {
    expect(MOCK_LIQUIDATIONS).toHaveLength(4);
    for (const pos of MOCK_LIQUIDATIONS) {
      expect(pos.id).toBeTruthy();
      expect(pos.collateralType).toMatch(/BTC|ETH/);
      expect(pos.ltvRange).toMatch(/\d+–\d+%/);
      expect(pos.closesIn).toBeGreaterThan(0);
    }
  });

  it("DEPOSIT_STEPS and BORROW_STEPS have 3 steps each", () => {
    expect(DEPOSIT_STEPS).toHaveLength(3);
    expect(BORROW_STEPS).toHaveLength(3);
  });
});

describe("constants", () => {
  it("SOLANA_RPC points to devnet", () => {
    expect(SOLANA_RPC).toContain("devnet.solana.com");
  });

  it("IKA_NETWORK is testnet", () => {
    expect(IKA_NETWORK).toBe("testnet");
  });

  it("FHE_CLUSTER_ID is set", () => {
    expect(FHE_CLUSTER_ID).toBeTruthy();
  });

  it("LIQUIDATION_THRESHOLD is between 0 and 1", () => {
    expect(LIQUIDATION_THRESHOLD).toBeGreaterThan(0);
    expect(LIQUIDATION_THRESHOLD).toBeLessThan(1);
  });

  it("COLLATERAL_RATIO is > 1", () => {
    expect(COLLATERAL_RATIO).toBeGreaterThan(1);
  });
});
