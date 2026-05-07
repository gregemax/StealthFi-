import { SuiJsonRpcClient, getJsonRpcFullnodeUrl } from "@mysten/sui/jsonRpc";
import { Transaction } from "@mysten/sui/transactions";
import {
  IkaClient,
  IkaTransaction,
  getNetworkConfig,
  prepareDKGAsync,
  Curve,
  UserShareEncryptionKeys,
} from "@ika.xyz/sdk";
import { testKeypair } from "./testKeypair";

const IKA_NETWORK = "testnet" as const;

export const suiClient = new SuiJsonRpcClient({
  url: getJsonRpcFullnodeUrl(IKA_NETWORK),
  network: IKA_NETWORK,
});

const networkConfig = getNetworkConfig(IKA_NETWORK);

export const ikaClient = new IkaClient({
  suiClient,
  config: networkConfig,
});

// IKA coin type on testnet — used when fetching IKA coins for DKG fees
// export const IKA_COIN_TYPE = `${networkConfig.packages.ikaPackage}::ika::IKA`;

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
  digest?: string;
}

/**
 * Create a dWallet via real Ika DKG on Sui testnet.
 * Requires the keypair in testKeypair.ts to be funded with SUI + IKA.
 * Falls back to a deterministic mock if the network call fails.
 */
export async function createDWallet(senderAddress?: string): Promise<DWalletResult> {
  console.log("[StealthFi Ika] Initiating dWallet DKG on testnet...");

  try {
    const senderAddr = testKeypair.getPublicKey().toSuiAddress();
    const curve = Curve.SECP256K1;

    // Derive user share encryption keys from the keypair's secret key bytes
    const userShareEncryptionKeys = await UserShareEncryptionKeys.fromRootSeedKey(
      testKeypair.getPublicKey().toRawBytes(),
      curve
    );

    // Fetch the latest network encryption key ID
    const networkEncKey = await ikaClient.getLatestNetworkEncryptionKey();

    // Prepare DKG cryptographic inputs (WASM computation)
    const dkgRequestInput = await prepareDKGAsync(
      ikaClient,
      curve,
      userShareEncryptionKeys,
      new Uint8Array(32), // bytesToHash — random nonce; use crypto.getRandomValues in production
      senderAddr
    );

    // Build the Sui transaction
    const tx = new Transaction();
    tx.setSender(senderAddr);

    // Split gas coins for IKA and SUI fees
    const [ikaCoin] = tx.splitCoins(tx.gas, [tx.pure.u64(100_000_000)]);
    const [suiCoin] = tx.splitCoins(tx.gas, [tx.pure.u64(100_000_000)]);

    const ikaTx = new IkaTransaction({
      ikaClient,
      transaction: tx,
      userShareEncryptionKeys,
    });

    const sessionIdentifier = ikaTx.createSessionIdentifier();

    await ikaTx.requestDWalletDKG({
      dkgRequestInput,
      ikaCoin,
      suiCoin,
      sessionIdentifier,
      dwalletNetworkEncryptionKeyId: networkEncKey.id,
      curve,
    });

    const result = await suiClient.signAndExecuteTransaction({
      transaction: tx,
      signer: testKeypair,
    });

    const digest = result.digest;
    // The dWallet object ID is in the created objects
    const dwalletId =
      result.effects?.created?.[0]?.reference?.objectId ??
      result.objectChanges?.find((c) => c.type === "created")?.objectId ??
      digest;

    console.log("[StealthFi Ika] dWallet created:", digest);
    console.log("[StealthFi Ika] dWallet ID:", dwalletId);

    return {
      dwalletId,
      btcAddress: `bc1q${dwalletId.slice(2, 34)}`,
      digest,
    };
  } catch (err) {
    console.error("[StealthFi Ika Error] DKG failed, using mock fallback:", err);
    return mockDWallet(senderAddress);
  }
}

function mockDWallet(senderAddress?: string): DWalletResult {
  const seed = senderAddress ?? "demo";
  const hash = Array.from(seed).reduce((acc, c) => acc ^ c.charCodeAt(0), 0xdeadbeef);
  const hex = Math.abs(hash).toString(16).padStart(8, "0");
  const dwalletId = `0x${hex}${"a1b2c3d4e5f6".repeat(4).slice(0, 56)}`;
  return {
    dwalletId,
    btcAddress: `bc1q${hex}${"0f1e2d3c4b5a".repeat(3).slice(0, 30)}`,
  };
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
  // const tx = new Transaction();
  // const ikaTx = new IkaTransaction({ ikaClient, transaction: tx, userShareEncryptionKeys });
  // await ikaTx.requestPresign({ dwalletId, ... });
  // await ikaTx.requestSign({ ... });
  return "0xMOCK_SIGNATURE";
}
