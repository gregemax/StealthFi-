"use client";
import { useEffect, useState } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import ConnectModal from "./ConnectModal";

function pubkeyToGradient(pk: string) {
  const h1 = pk.charCodeAt(0) * 137 % 360;
  const h2 = pk.charCodeAt(pk.length - 1) * 97 % 360;
  return `linear-gradient(135deg, hsl(${h1},70%,55%), hsl(${h2},70%,45%))`;
}

export default function WalletButton() {
  const { publicKey, disconnect, connected } = useWallet();
  const { connection } = useConnection();
  const [balance, setBalance] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!publicKey) { setBalance(null); return; }
    connection.getBalance(publicKey)
      .then((l) => setBalance(l / LAMPORTS_PER_SOL))
      .catch(() => setBalance(null));
  }, [publicKey, connection]);

  useEffect(() => { if (connected) setShowModal(false); }, [connected]);

  if (!connected || !publicKey) {
    return (
      <>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary h-9 px-4 text-xs"
        >
          Connect Wallet
        </button>
        {showModal && <ConnectModal onClose={() => setShowModal(false)} />}
      </>
    );
  }

  const pk = publicKey.toBase58();
  const short = `${pk.slice(0, 4)}...${pk.slice(-4)}`;

  return (
    <button
      onClick={() => disconnect()}
      title="Click to disconnect"
      className="flex items-center gap-2 rounded-xl border border-border-active bg-elevated px-3 py-1.5 transition-all duration-150 hover:border-red/40 hover:bg-red-dim group"
    >
      <div className="h-5 w-5 rounded-full shrink-0" style={{ background: pubkeyToGradient(pk) }} />
      <span className="text-xs text-primary group-hover:text-red transition-colors" style={{ fontFamily: "var(--font-jetbrains)" }}>
        {short}
      </span>
      {balance !== null && (
        <span className="text-[10px] text-tertiary group-hover:text-red/60 transition-colors" style={{ fontFamily: "var(--font-jetbrains)" }}>
          {balance.toFixed(2)} SOL
        </span>
      )}
    </button>
  );
}
