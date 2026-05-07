"use client";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, X } from "lucide-react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";

const FEATURES = [
  { icon: "🔒", text: "Collateral encrypted via FHE — invisible to everyone" },
  { icon: "⛓", text: "Cross-chain custody via Ika — no bridges" },
  { icon: "⚡", text: "Zero-trust liquidations — sealed bid only" },
];

interface ConnectModalProps {
  onClose: () => void;
}

export default function ConnectModal({ onClose }: ConnectModalProps) {
  const { wallets, select } = useWallet();
  const { setVisible } = useWalletModal();

  const phantom = wallets.find((w) => w.adapter.name === "Phantom");
  const phantomInstalled = phantom?.readyState === "Installed";

  function handleChooseWallet() {
    onClose();
    setVisible(true);
  }

  async function handlePhantomDirect() {
    if (!phantom) return;
    onClose();
    select(phantom.adapter.name);
    try {
      await phantom.adapter.connect();
    } catch {
      // user rejected — silently ignore
    }
  }

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
          style={{ background: "#0a0a0f", border: "1px solid #00d4ff22", borderRadius: 12, padding: 32 }}
          className="relative w-full max-w-sm"
        >
          {/* Close */}
          <button onClick={onClose} className="absolute right-4 top-4 text-muted hover:text-text">
            <X size={15} />
          </button>

          {/* Header */}
          <div className="mb-2 flex items-center gap-2">
            <Lock size={16} className="text-accent" />
            <span className="font-mono text-base font-semibold text-text">Connect to StealthFi</span>
          </div>
          <p className="mb-6 text-xs text-text-dim">
            Your positions are encrypted. Your keys stay yours.
          </p>

          {/* Feature bullets */}
          <ul className="mb-6 space-y-2">
            {FEATURES.map(({ icon, text }) => (
              <li key={text} className="flex items-start gap-2 text-xs text-text-dim">
                <span className="mt-px shrink-0">{icon}</span>
                <span>{text}</span>
              </li>
            ))}
          </ul>

          {/* Stage 3 — Phantom shortcut */}
          {phantomInstalled ? (
            <button
              onClick={handlePhantomDirect}
              className="mb-3 flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-mono font-semibold transition-opacity hover:opacity-90"
              style={{ background: "#ab9ff222", border: "1px solid #ab9ff2", color: "#ab9ff2" }}
            >
              <img src="https://phantom.app/img/phantom-logo.svg" alt="" className="h-4 w-4" onError={(e) => (e.currentTarget.style.display = "none")} /> {/* eslint-disable-line @next/next/no-img-element */}
              Connect Phantom
            </button>
          ) : (
            <a
              href="https://phantom.app"
              target="_blank"
              rel="noopener noreferrer"
              className="mb-3 flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-mono transition-opacity hover:opacity-90"
              style={{ background: "#ab9ff211", border: "1px solid #ab9ff244", color: "#ab9ff2" }}
            >
              Install Phantom ↗
            </a>
          )}

          {/* Stage 2 — wallet picker */}
          <button
            onClick={handleChooseWallet}
            className="w-full rounded-lg py-2.5 text-sm font-mono font-semibold transition-opacity hover:opacity-90"
            style={{ background: "#00d4ff", color: "#0a0a0f" }}
          >
            Choose Wallet
          </button>

          <button
            onClick={onClose}
            className="mt-3 w-full text-center text-xs text-muted hover:text-text transition-colors"
          >
            Cancel
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
