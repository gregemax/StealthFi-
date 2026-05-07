"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, CheckCircle, Loader2, X, ArrowRight, ArrowUpRight, Shield } from "lucide-react";
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
      patchStep(0, { state: "done", label: `dWallet created ✓ (${trunc(digest ?? dwalletId)})`, href: digest ? `https://suiscan.xyz/testnet/tx/${digest}` : undefined });
      patchStep(1, { state: "running" });
      const ciphertext = await encryptValue(parseFloat(amount));
      patchStep(1, { state: "done", label: `Encrypted: ${ciphertext.slice(0, 24)}... stored on-chain` });
      patchStep(2, { state: "running" });
      await new Promise((r) => setTimeout(r, 800));
      const record: DepositRecord = { asset: asset.symbol, amount: parseFloat(amount), usdValue, dWalletId: dwalletId, encryptedAmount: ciphertext, timestamp: Date.now() };
      storage.setDeposit(record);
      setPosition(record);
      patchStep(2, { state: "done", label: `Position created ✓ — ${asset.symbol} · $${usdValue.toLocaleString(undefined, { maximumFractionDigits: 0 })} · 🔒 encrypted` });
    } catch (err) {
      console.error("[StealthFi] Ika fallback:", err);
      setSteps((p) => p.map((s) => s.state === "running" ? { ...s, state: "error" } : s));
    }
  }

  const allDone = steps.length > 0 && steps.every((s) => s.state === "done");

  return (
    <div className="mx-auto max-w-xl space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <p className="label"><Link href="/" className="hover:text-secondary transition-colors">Dashboard</Link> / Deposit</p>
        <h1 className="text-4xl font-bold tracking-tight text-primary">Lock Collateral</h1>
        <p className="text-secondary">Your deposit is encrypted the moment it hits the network.</p>
      </div>

      {!connected ? (
        <div className="card p-12 text-center space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-dim border border-blue/20">
            <Shield size={22} className="text-blue" />
          </div>
          <p className="text-secondary">Connect your wallet to deposit collateral</p>
          <button onClick={() => setVisible(true)} className="btn-primary mx-auto h-11 px-6">
            Connect Wallet
          </button>
        </div>
      ) : (
        <>
          {/* Asset selector */}
          <div className="space-y-3">
            <p className="label">Select Asset</p>
            <div className="grid grid-cols-2 gap-3">
              {MOCK_ASSETS.map((a) => (
                <button key={a.symbol} onClick={() => setAsset(a)}
                  className={`rounded-xl border p-5 text-left transition-all duration-200 ${
                    asset.symbol === a.symbol
                      ? "border-blue/40 bg-blue-dim shadow-glow"
                      : "border-border bg-surface hover:border-border-active"
                  }`}
                  style={asset.symbol === a.symbol ? { background: "linear-gradient(135deg, rgba(79,142,255,0.08), rgba(139,92,246,0.08))" } : {}}>
                  <div className="text-2xl mb-2">{a.icon}</div>
                  <div className="font-semibold text-primary">{a.symbol}</div>
                  <div className="mt-1">
                    <span className="rounded-full border border-purple/20 bg-purple-dim px-2 py-0.5 text-[9px] font-mono text-purple">
                      via Ika dWallet
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Amount input */}
          <div className="space-y-2">
            <p className="label">Amount</p>
            <div className="relative">
              <div className="flex items-center rounded-xl border border-border bg-surface px-5 h-14 focus-within:border-blue/40 transition-colors">
                <input
                  type="number" min="0.001" step="0.001" placeholder="0.000"
                  value={amount} onChange={(e) => setAmount(e.target.value)}
                  className="flex-1 bg-transparent text-xl font-semibold text-primary outline-none placeholder:text-tertiary"
                  style={{ fontFamily: "var(--font-jetbrains)" }}
                />
                <span className="font-mono text-sm text-secondary">{asset.symbol}</span>
              </div>
            </div>
            {usdValue > 0 ? (
              <p className="text-sm text-secondary pl-1">
                ≈ <span className="text-primary font-medium">${usdValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span> USD
              </p>
            ) : (
              <p className="text-xs text-tertiary pl-1">Min: 0.001 {asset.symbol}</p>
            )}
          </div>

          {/* Terminal info box */}
          <div className="rounded-xl p-4 space-y-1.5" style={{ background: "#050510", borderLeft: "3px solid #00d4ff" }}>
            {[
              "// Collateral encrypted via REFHE protocol",
              "// FHE executor nodes: 3/3 online",
              "// Your balance is invisible to validators",
            ].map((line) => (
              <p key={line} className="text-xs text-secondary" style={{ fontFamily: "var(--font-jetbrains)" }}>
                🔒 {line}
              </p>
            ))}
          </div>

          <button onClick={handleDeposit} disabled={!amount || parseFloat(amount) <= 0}
            className="btn-primary w-full h-14 text-base gap-3">
            <Lock size={16} />
            Lock Collateral via Ika + Encrypt
          </button>
        </>
      )}

      {/* Position card */}
      {position && (
        <div className="card p-6 space-y-4" style={{ borderLeft: "3px solid #4f8eff" }}>
          <p className="label text-blue">Your Position</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{position.asset === "BTC" ? "₿" : "Ξ"}</span>
              <div>
                <p className="font-semibold text-primary">{position.asset}</p>
                <p className="text-xs text-tertiary">{position.amount} {position.asset}</p>
              </div>
            </div>
            <p className="text-xl font-semibold text-primary">${position.usdValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
          </div>
          <div className="flex items-center justify-between py-2 border-t border-border">
            <span className="text-xs text-tertiary">Balance</span>
            <EncryptedValue />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-tertiary">dWallet</span>
            <a href={`https://suiscan.xyz/testnet/object/${position.dWalletId}`} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1 font-mono text-xs text-blue hover:underline">
              {trunc(position.dWalletId)} <ArrowUpRight size={11} />
            </a>
          </div>
          <Link href="/borrow" className="btn-secondary w-full h-10 text-sm">
            Ready to borrow <ArrowRight size={14} />
          </Link>
        </div>
      )}

      <FHEStatus />

      {/* Step modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 16 }}
              className="relative w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl border border-border bg-surface p-8 shadow-card">
              {allDone && (
                <button onClick={() => setShowModal(false)} className="absolute right-5 top-5 text-tertiary hover:text-secondary transition-colors">
                  <X size={16} />
                </button>
              )}
              <h3 className="mb-8 label">Transaction Progress</h3>
              <div className="space-y-6">
                {steps.map((step, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="shrink-0 mt-0.5">
                      {step.state === "done" ? (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 400 }}>
                          <CheckCircle size={20} className="text-green" />
                        </motion.div>
                      ) : step.state === "running" ? (
                        <div className="h-5 w-5 rounded-full border-2 border-blue flex items-center justify-center" style={{ boxShadow: "0 0 12px rgba(79,142,255,0.4)" }}>
                          <Loader2 size={11} className="animate-spin text-blue" />
                        </div>
                      ) : step.state === "error" ? (
                        <div className="h-5 w-5 rounded-full bg-red-dim border border-red/30 flex items-center justify-center">
                          <span className="text-[9px] text-red">✗</span>
                        </div>
                      ) : (
                        <div className="h-5 w-5 rounded-full border border-border flex items-center justify-center">
                          <span className="text-[9px] font-mono text-tertiary">{i + 1}</span>
                        </div>
                      )}
                    </div>
                    <p className={`text-sm break-all ${step.state === "done" ? "text-green" : step.state === "running" ? "text-primary" : step.state === "error" ? "text-red" : "text-tertiary"}`}>
                      {step.href
                        ? <a href={step.href} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">{step.label}</a>
                        : step.label}
                    </p>
                  </div>
                ))}
              </div>
              {allDone && (
                <motion.button initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  onClick={() => setShowModal(false)} className="btn-primary mt-8 w-full h-12">
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
