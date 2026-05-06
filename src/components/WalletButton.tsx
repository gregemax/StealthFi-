"use client";
import { useState } from "react";
import { Wallet } from "lucide-react";

// TODO: integrate Ika SDK — replace mock with real wallet adapter
export default function WalletButton() {
  const [connected, setConnected] = useState(false);
  const mockAddress = "7xKp...3mFq";

  return (
    <button
      onClick={() => setConnected((p) => !p)}
      className="flex items-center gap-2 rounded border border-border bg-surface-2 px-3 py-1.5 text-sm font-mono text-text transition-colors hover:border-accent hover:text-accent"
    >
      <Wallet size={14} />
      {connected ? mockAddress : "Connect Wallet"}
    </button>
  );
}
