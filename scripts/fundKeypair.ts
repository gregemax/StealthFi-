/**
 * Run with: npx tsx scripts/fundKeypair.ts
 * Prints the Sui testnet address for your keypair and the faucet link.
 */
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";

const privKey = process.env.NEXT_PUBLIC_SUI_PRIVATE_KEY;

let keypair: Ed25519Keypair;
if (privKey) {
  keypair = Ed25519Keypair.fromSecretKey(privKey);
  console.log("Loaded keypair from NEXT_PUBLIC_SUI_PRIVATE_KEY");
} else {
  keypair = new Ed25519Keypair();
  console.log("No NEXT_PUBLIC_SUI_PRIVATE_KEY found — generated new keypair");
  console.log(`\nAdd this to .env.local:\nNEXT_PUBLIC_SUI_PRIVATE_KEY=${keypair.getSecretKey()}\n`);
}

const address = keypair.getPublicKey().toSuiAddress();
console.log(`Sui testnet address : ${address}`);
console.log(`Faucet              : https://faucet.sui.io/?address=${address}`);
console.log(`Explorer            : https://suiscan.xyz/testnet/account/${address}`);
