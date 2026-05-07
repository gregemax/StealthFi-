import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  encryptValue,
  computeHealthFactor,
  triggerDecryption,
  getClusterStatus,
} from "@/lib/fheSimulator";

// Speed up delays for tests
vi.useFakeTimers();

async function runWithTimers<T>(fn: () => Promise<T>): Promise<T> {
  const p = fn();
  await vi.runAllTimersAsync();
  return p;
}

describe("fheSimulator", () => {
  beforeEach(() => vi.clearAllTimers());

  describe("encryptValue", () => {
    it("returns a string prefixed with 0xFHE:REFHE_v1:", async () => {
      const result = await runWithTimers(() => encryptValue(1.5));
      expect(result).toMatch(/^0xFHE:REFHE_v1:/);
    });

    it("is deterministic — same amount produces same ciphertext", async () => {
      const a = await runWithTimers(() => encryptValue(42));
      const b = await runWithTimers(() => encryptValue(42));
      expect(a).toBe(b);
    });

    it("different amounts produce different ciphertexts", async () => {
      const a = await runWithTimers(() => encryptValue(1));
      const b = await runWithTimers(() => encryptValue(2));
      expect(a).not.toBe(b);
    });

    it("ciphertext body is 256 hex chars", async () => {
      const result = await runWithTimers(() => encryptValue(10));
      const body = result.replace("0xFHE:REFHE_v1:", "");
      expect(body).toHaveLength(256);
      expect(body).toMatch(/^[0-9a-f]+$/);
    });
  });

  describe("computeHealthFactor", () => {
    it("returns a string prefixed with 0xFHE:HF:", async () => {
      const result = await runWithTimers(() =>
        computeHealthFactor("0xFHE:REFHE_v1:abc", 10000)
      );
      expect(result).toMatch(/^0xFHE:HF:/);
    });
  });

  describe("triggerDecryption", () => {
    it("returns a number", async () => {
      const result = await runWithTimers(() =>
        triggerDecryption("0xFHE:HF:abc", "pubkey123")
      );
      expect(typeof result).toBe("number");
    });

    it("health factor result is >= 1.0", async () => {
      const result = await runWithTimers(() =>
        triggerDecryption("0xFHE:HF:abc", "pubkey")
      );
      expect(result).toBeGreaterThanOrEqual(1.0);
    });
  });

  describe("getClusterStatus", () => {
    it("returns expected cluster shape", async () => {
      const status = await runWithTimers(() => getClusterStatus());
      expect(status).toMatchObject({
        executors: 3,
        decryptors: 7,
        latency: "43ms",
        cluster: "encrypt-devnet-1",
      });
    });
  });
});
