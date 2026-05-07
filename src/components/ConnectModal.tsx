"use client";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, X } from "lucide-react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";

const FEATURES = [
  { icon: "🔒", text: "Collateral encrypted via FHE — invisible to everyone" },
  { icon: "⛓", text: "Cross-chain custody via Ika — no bridges" },
  { icon: "⚡", text: "Zero-trust liquidations — sealed bid only" },
];

export default function ConnectModal({ onClose }: { onClose: () => void }) {
  const { wallets, select } = useWallet();
  const { setVisible } = useWalletModal();

  const phantom = wallets.find((w) => w.adapter.name === "Phantom");
  const phantomInstalled = phantom?.readyState === "Installed";

  function handleChooseWallet() { onClose(); setVisible(true); }

  async function handlePhantomDirect() {
    if (!phantom) return;
    onClose();
    select(phantom.adapter.name);
    try { await phantom.adapter.connect(); } catch {}
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm" onClick={onClose}>
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 16 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full sm:max-w-sm rounded-t-2xl sm:rounded-2xl border border-border bg-surface p-8 shadow-card"
        >
          <button onClick={onClose} className="absolute right-5 top-5 text-tertiary hover:text-secondary transition-colors">
            <X size={16} />
          </button>

          {/* Header */}
          <div className="mb-2 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-dim border border-blue/20">
              <Shield size={16} className="text-blue" />
            </div>
            <div>
              <p className="text-sm font-semibold text-primary">Connect to StealthFi</p>
              <p className="text-xs text-secondary">Your keys stay yours.</p>
            </div>
          </div>

          {/* Features */}
          <ul className="my-5 space-y-2.5 rounded-xl border border-border bg-elevated p-4">
            {FEATURES.map(({ icon, text }) => (
              <li key={text} className="flex items-start gap-2.5 text-xs text-secondary">
                <span className="shrink-0 mt-px">{icon}</span>
                <span>{text}</span>
              </li>
            ))}
          </ul>

          {/* Phantom shortcut */}
          {phantomInstalled ? (
            <button onClick={handlePhantomDirect}
              className="mb-3 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all duration-150 hover:brightness-110 active:scale-[0.98]"
              style={{ background: "rgba(171,159,242,0.15)", border: "1px solid rgba(171,159,242,0.3)", color: "#ab9ff2" }}>
              <img src="https://phantom.app/img/phantom-logo.svg" alt="" className="h-4 w-4" onError={(e) => (e.currentTarget.style.display = "none")} /> {/* eslint-disable-line @next/next/no-img-element */}
              Connect Phantom
            </button>
          ) : (
            <a href="https://phantom.app" target="_blank" rel="noopener noreferrer"
              className="mb-3 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium transition-all hover:brightness-110"
              style={{ background: "rgba(171,159,242,0.08)", border: "1px solid rgba(171,159,242,0.2)", color: "#ab9ff2" }}>
              Install Phantom ↗
            </a>
          )}

          <button onClick={handleChooseWallet} className="btn-primary w-full h-12">
            Choose Wallet
          </button>

          <button onClick={onClose} className="mt-3 w-full text-center text-xs text-tertiary hover:text-secondary transition-colors">
            Cancel
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
