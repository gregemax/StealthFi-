import { SuiJsonRpcClient, getJsonRpcFullnodeUrl } from "@mysten/sui/jsonRpc";
import { Transaction } from "@mysten/sui/transactions";
import { IkaClient, IkaTransaction, getNetworkConfig } from "@ika.xyz/sdk";

const IKA_NETWORK = "testnet" as const;

// Singleton SuiClient pointed at Sui testnet (Ika runs on Sui)
const suiClient = new SuiJsonRpcClient({
  url: getJsonRpcFullnodeUrl(IKA_NETWORK),
  network: IKA_NETWORK,
});

const networkConfig = getNetworkConfig(IKA_NETWORK);

// Singleton IkaClient
export const ikaClient = new IkaClient({
  suiClient,
  config: networkConfig,
});

/**
 * Verify the Ika client can reach the network by fetching the current epoch.
 * Returns true on success, false on failure.
 */
export async function checkIkaConnection(): Promise<boolean> {
  try {
    await ikaClient.getEpoch();
    console.log("[StealthFi Ika] Connected to Ika testnet ✓");
    return true;
  } catch (err) {
    console.error("[StealthFi Ika Error] Connection check failed:", err);
    return false;
  }
}

export interface DWalletResult {
  dwalletId: string;
  btcAddress: string;
}

/**
 * Attempt real DKG via IkaTransaction.requestDWalletDKG.
 * Full DKG requires a funded Sui keypair + WASM — falls back to a deterministic
 * mock derived from the caller's address so the UI always works during the demo.
 *
 * TODO: integrate Ika SDK — pass a real Ed25519Keypair + funded SUI/IKA coins
 * to complete the on-chain DKG flow.
 */
export async function createDWallet(senderAddress?: string): Promise<DWalletResult> {
  console.log("[StealthFi Ika] Initiating dWallet DKG...");

  try {
    // Real path: IkaTransaction needs a funded keypair and coins.
    // We instantiate it to prove the SDK is wired, then fall through to mock
    // since we don't have a live keypair in the browser demo context.
    new IkaTransaction({ ikaClient, transaction: new Transaction() });
    console.log("[StealthFi Ika] IkaTransaction instantiated — DKG requires funded keypair, using demo fallback");
    throw new Error("DKG_NEEDS_KEYPAIR"); // intentional — triggers fallback below
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg !== "DKG_NEEDS_KEYPAIR") {
      console.error("[StealthFi Ika Error] DKG failed:", err);
    }

    // Deterministic mock dWallet ID derived from sender (stable across renders)
    const seed = senderAddress ?? "demo";
    const hash = Array.from(seed).reduce((acc, c) => acc ^ c.charCodeAt(0), 0xdeadbeef);
    const hex = Math.abs(hash).toString(16).padStart(8, "0");
    const dwalletId = `0x${hex}${"a1b2c3d4e5f6".repeat(4).slice(0, 56)}`;
    // Mock BTC address (P2WPKH-style)
    const btcAddress = `bc1q${hex}${"0f1e2d3c4b5a".repeat(3).slice(0, 30)}`;

    console.log("[StealthFi Ika] Demo dWallet ID:", dwalletId);
    return { dwalletId, btcAddress };
  }
}

/**
 * Stub for signing a message with a dWallet.
 * TODO: integrate Ika SDK — use IkaTransaction.requestPresign + requestSign
 */
export async function signWithDWallet(
  dwalletId: string,
  message: Uint8Array
): Promise<string> {
  console.log(`[StealthFi Ika] signWithDWallet called for ${dwalletId}, msg length ${message.length} — stub`);
  // TODO: integrate Ika SDK
  // const ikaTx = new IkaTransaction({ ikaClient });
  // await ikaTx.requestPresign({ dwalletId, ... });
  // await ikaTx.requestSign({ ... });
  return "0xMOCK_SIGNATURE";
}
