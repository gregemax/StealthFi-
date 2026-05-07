"use client";
import { useEffect, useState } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { Wallet } from "lucide-react";
import ConnectModal from "./ConnectModal";

export default function WalletButton() {
  const { publicKey, disconnect, connected } = useWallet();
  const { connection } = useConnection();
  const [balance, setBalance] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!publicKey) { setBalance(null); return; }
    connection.getBalance(publicKey)
      .then((lamports) => setBalance(lamports / LAMPORTS_PER_SOL))
      .catch(() => setBalance(null));
  }, [publicKey, connection]);

  // Stage 4 — dismiss modal once connected
  useEffect(() => {
    if (connected) setShowModal(false);
  }, [connected]);

  if (!connected || !publicKey) {
    return (
      <>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 rounded border border-border bg-surface-2 px-3 py-1.5 text-sm font-mono text-text transition-colors hover:border-accent hover:text-accent"
        >
          <Wallet size={14} />
          Connect Wallet
        </button>
        {showModal && <ConnectModal onClose={() => setShowModal(false)} />}
      </>
    );
  }

  const short = `${publicKey.toBase58().slice(0, 4)}...${publicKey.toBase58().slice(-4)}`;

  return (
    <button
      onClick={() => disconnect()}
      className="flex items-center gap-2 rounded border border-accent/40 bg-accent-dim px-3 py-1.5 text-sm font-mono text-accent transition-colors hover:border-red-400/60 hover:text-red-400"
      title="Click to disconnect"
    >
      <Wallet size={14} />
      {short}
      {balance !== null && (
        <span className="text-[10px] text-text-dim">{balance.toFixed(2)} SOL</span>
      )}
    </button>
  );
}
