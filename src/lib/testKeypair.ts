import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";

function loadKeypair(): Ed25519Keypair {
  const privKey = process.env.NEXT_PUBLIC_SUI_PRIVATE_KEY;

  if (privKey) {
    try {
      return Ed25519Keypair.fromSecretKey(privKey);
    } catch (err) {
      console.error("[StealthFi Ika Error] Invalid NEXT_PUBLIC_SUI_PRIVATE_KEY:", err);
    }
  }

  const keypair = new Ed25519Keypair();
  console.warn(
    "[StealthFi Ika] No NEXT_PUBLIC_SUI_PRIVATE_KEY set — generated ephemeral keypair.\n" +
    `  Address: ${keypair.getPublicKey().toSuiAddress()}\n` +
    "  Fund it at https://faucet.sui.io then set NEXT_PUBLIC_SUI_PRIVATE_KEY in .env.local\n" +
    `  Export key: ${keypair.getSecretKey()}`
  );
  return keypair;
}

// Module-level singleton — initialized once per server process, not per request.
export const testKeypair: Ed25519Keypair = loadKeypair();
