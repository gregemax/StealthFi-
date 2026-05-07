"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, CheckCircle, Loader2, X, ArrowRight } from "lucide-react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { MOCK_ASSETS, ASSET_PRICES } from "@/lib/mockData";
import { createDWallet } from "@/lib/ikaClient";
import { encryptValue } from "@/lib/fheSimulator";
import { storage, type DepositRecord } from "@/lib/storage";
import EncryptedValue from "@/components/EncryptedValue";
import FHEStatus from "@/components/FHEStatus";

type StepState = "idle" | "running" | "done" | "error";
interface Step { label: string; state: StepState; href?: string; }

function trunc(id: string) { return `${id.slice(0, 6)}...${id.slice(-4)}`; }

export default function DepositPage() {
  const { publicKey, connected } = useWallet();
  const { setVisible } = useWalletModal();
  const [asset, setAsset] = useState(MOCK_ASSETS[0]);
  const [amount, setAmount] = useState("");
  const [steps, setSteps] = useState<Step[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [position, setPosition] = useState<DepositRecord | null>(null);

  useEffect(() => { setPosition(storage.getDeposit()); }, []);

  const usdValue = amount ? parseFloat(amount) * (ASSET_PRICES[asset.symbol] ?? 0) : 0;

  function patchStep(i: number, patch: Partial<Step>) {
    setSteps((p) => p.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));
  }

  async function handleDeposit() {
    if (!amount || !connected) return;
    setSteps([
      { label: "Creating dWallet via Ika...", state: "running" },
      { label: "Encrypting collateral via Encrypt FHE...", state: "idle" },
      { label: "Position created ✓", state: "idle" },
    ]);
    setShowModal(true);

    try {
      const { dwalletId, digest } = await createDWallet(publicKey?.toBase58());
      patchStep(0, {
        state: "done",
        label: `dWallet created ✓ (${trunc(digest ?? dwalletId)})`,
        href: digest ? `https://suiscan.xyz/testnet/tx/${digest}` : undefined,
      });
      patchStep(1, { state: "running" });

      const ciphertext = await encryptValue(parseFloat(amount));
      patchStep(1, { state: "done", label: `Encrypted: ${ciphertext.slice(0, 24)}... stored on-chain` });
      patchStep(2, { state: "running" });

      await new Promise((r) => setTimeout(r, 800));
      const record: DepositRecord = {
        asset: asset.symbol,
        amount: parseFloat(amount),
        usdValue,
        dWalletId: dwalletId,
        encryptedAmount: ciphertext,
        timestamp: Date.now(),
      };
      storage.setDeposit(record);
      setPosition(record);
      patchStep(2, {
        state: "done",
        label: `Position created ✓ — ${asset.symbol} · $${usdValue.toLocaleString(undefined, { maximumFractionDigits: 0 })} · 🔒 encrypted`,
      });
    } catch (err) {
      console.error("[StealthFi] Ika fallback:", err);
      setSteps((p) => p.map((s) => s.state === "running" ? { ...s, state: "error" } : s));
    }
  }

  const allDone = steps.length > 0 && steps.every((s) => s.state === "done");

  return (
    <div className="mx-auto max-w-lg space-y-8">
      <div>
        <h1 className="font-mono text-2xl font-bold text-text">Deposit Collateral</h1>
        <p className="mt-1 text-sm text-text-dim">Lock assets via Ika dWallet — encrypted on-chain</p>
      </div>

      {!connected ? (
        <div className="rounded-xl border border-border bg-surface p-10 text-center space-y-4">
          <Lock size={28} className="mx-auto text-muted" />
          <p className="font-mono text-sm text-text-dim">Connect wallet to deposit</p>
          <button
            onClick={() => setVisible(true)}
            className="mx-auto flex items-center gap-2 rounded-lg border border-accent bg-accent-dim px-5 py-2 font-mono text-sm text-accent hover:bg-accent hover:text-bg transition-colors"
          >
            Connect Wallet
          </button>
        </div>
      ) : (
        <>
          {/* Asset selector */}
          <div className="space-y-2">
            <label className="text-xs font-mono uppercase tracking-widest text-muted">Select Asset</label>
            <div className="grid grid-cols-2 gap-3">
              {MOCK_ASSETS.map((a) => (
                <button
                  key={a.symbol}
                  onClick={() => setAsset(a)}
                  className={`rounded-xl border p-4 text-left transition-colors ${
                    asset.symbol === a.symbol ? "border-accent bg-accent-dim" : "border-border bg-surface hover:border-accent/50"
                  }`}
                >
                  <div className="font-mono text-xl">{a.icon}</div>
                  <div className="mt-1 font-mono text-sm font-semibold text-text">{a.symbol}</div>
                  <div className="text-[10px] text-text-dim">{a.via}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Amount input */}
          <div className="space-y-2">
            <label className="text-xs font-mono uppercase tracking-widest text-muted">Amount</label>
            <div className="flex items-center rounded-xl border border-border bg-surface px-4 py-3 focus-within:border-accent">
              <input
                type="number"
                min="0.001"
                step="0.001"
                placeholder="0.000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="flex-1 bg-transparent font-mono text-lg text-text outline-none placeholder:text-muted"
              />
              <span className="font-mono text-sm text-text-dim">{asset.symbol}</span>
            </div>
            {usdValue > 0 && (
              <p className="font-mono text-xs text-text-dim">
                ≈ <span className="text-text">${usdValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span> USD
              </p>
            )}
          </div>

          <button
            onClick={handleDeposit}
            disabled={!amount || parseFloat(amount) <= 0}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-accent bg-accent-dim py-3 font-mono text-sm text-accent transition-colors hover:bg-accent hover:text-bg disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Lock size={14} />
            Lock Collateral
          </button>
        </>
      )}

      {/* Position card */}
      {position && (
        <div className="rounded-xl border border-accent/30 bg-surface p-5 space-y-3">
          <p className="text-[10px] font-mono uppercase tracking-widest text-accent">Your Position</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-mono text-lg">{position.asset === "BTC" ? "₿" : "Ξ"}</span>
              <span className="font-mono text-sm font-semibold text-text">{position.asset}</span>
            </div>
            <span className="font-mono text-sm text-text">${position.usdValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-muted">Balance</span>
            <EncryptedValue />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-muted">dWallet</span>
            <a
              href={`https://suiscan.xyz/testnet/object/${position.dWalletId}`}
              target="_blank" rel="noopener noreferrer"
              className="font-mono text-xs text-accent underline underline-offset-2"
            >
              {trunc(position.dWalletId)}
            </a>
          </div>
          <Link
            href="/borrow"
            className="flex items-center justify-center gap-2 rounded-lg border border-border py-2 font-mono text-xs text-text-dim hover:border-accent hover:text-accent transition-colors"
          >
            Ready to borrow <ArrowRight size={12} />
          </Link>
        </div>
      )}

      <FHEStatus />

      {/* Step modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md rounded-xl border border-border bg-surface p-8"
            >
              {allDone && (
                <button onClick={() => setShowModal(false)} className="absolute right-4 top-4 text-muted hover:text-text">
                  <X size={16} />
                </button>
              )}
              <h3 className="mb-6 text-sm font-mono uppercase tracking-widest text-accent">Transaction Progress</h3>
              <div className="space-y-4">
                {steps.map((step, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="mt-0.5 w-5 shrink-0">
                      {step.state === "done" ? <CheckCircle size={18} className="text-accent" />
                        : step.state === "running" ? <Loader2 size={18} className="animate-spin text-accent" />
                        : step.state === "error" ? <span className="text-red-400">✗</span>
                        : <div className="h-4 w-4 rounded-full border border-border" />}
                    </div>
                    <span className={`text-sm font-mono break-all ${
                      step.state === "done" ? "text-accent" : step.state === "running" ? "text-text"
                      : step.state === "error" ? "text-red-400" : "text-muted"
                    }`}>
                      {step.href
                        ? <a href={step.href} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">{step.label}</a>
                        : step.label}
                    </span>
                  </div>
                ))}
              </div>
              {allDone && (
                <motion.button initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  onClick={() => setShowModal(false)}
                  className="mt-8 w-full rounded border border-accent bg-accent-dim py-2 text-sm font-mono text-accent hover:bg-accent hover:text-bg transition-colors"
                >
                  Done
                </motion.button>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
