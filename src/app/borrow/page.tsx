"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, CheckCircle, X, ArrowRight, ArrowUpRight } from "lucide-react";
import { storage, type DepositRecord, type LoanRecord } from "@/lib/storage";
import { computeHealthFactor } from "@/lib/fheSimulator";
import EncryptedValue from "@/components/EncryptedValue";
import HealthMeter from "@/components/HealthMeter";
import FHEStatus from "@/components/FHEStatus";

function trunc(id: string) { return `${id.slice(0, 6)}...${id.slice(-4)}`; }

export default function BorrowPage() {
  const [deposit, setDeposit] = useState<DepositRecord | null>(null);
  const [loan, setLoan] = useState<LoanRecord | null>(null);
  const [loanAmount, setLoanAmount] = useState(0);
  const [fheState, setFheState] = useState<"idle" | "computing" | "done">("idle");
  const [encHF, setEncHF] = useState<string | null>(null);
  const [confirmedHF, setConfirmedHF] = useState<number | null>(null);
  const [showFheModal, setShowFheModal] = useState(false);

  useEffect(() => {
    const d = storage.getDeposit();
    const l = storage.getLoan();
    setDeposit(d);
    setLoan(l);
    if (d) setLoanAmount(Math.floor(d.usdValue * 0.5));
  }, []);

  const maxLoan = deposit ? Math.floor(deposit.usdValue * 0.75) : 0;
  const healthFactor = deposit && loanAmount > 0 ? deposit.usdValue / loanAmount : 0;

  async function handleBorrow() {
    if (!deposit || loanAmount <= 0) return;
    setFheState("computing"); setEncHF(null); setConfirmedHF(null); setShowFheModal(true);
    try {
      const enc = await computeHealthFactor(deposit.encryptedAmount, loanAmount);
      setEncHF(enc);
      await new Promise((r) => setTimeout(r, 600));
      const hf = parseFloat(healthFactor.toFixed(2));
      setConfirmedHF(hf);
      setFheState("done");
      const record: LoanRecord = { loanAmount, collateralUSD: deposit.usdValue, healthFactor: hf, asset: deposit.asset, timestamp: Date.now() };
      storage.setLoan(record);
      setLoan(record);
    } catch (err) {
      console.error("[StealthFi] Ika fallback:", err);
      setFheState("idle"); setShowFheModal(false);
    }
  }

  if (!deposit) {
    return (
      <div className="mx-auto max-w-xl space-y-8">
        <h1 className="text-4xl font-bold tracking-tight text-primary">Borrow USDC</h1>
        <div className="card p-12 text-center space-y-4">
          <p className="text-secondary">No collateral found — deposit first</p>
          <Link href="/deposit" className="btn-primary mx-auto h-11 px-6">
            Go to Deposit <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div className="space-y-1">
        <p className="label"><Link href="/" className="hover:text-secondary transition-colors">Dashboard</Link> / Borrow</p>
        <h1 className="text-4xl font-bold tracking-tight text-primary">Borrow USDC</h1>
        <p className="text-secondary">Borrow against your encrypted collateral.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left — Collateral */}
        <div className="card p-6 space-y-5">
          <p className="label">Your Collateral</p>
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-elevated border border-border text-2xl">
              {deposit.asset === "BTC" ? "₿" : "Ξ"}
            </div>
            <div>
              <p className="text-2xl font-bold text-primary">${deposit.usdValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
              <p className="text-sm text-secondary">{deposit.amount} {deposit.asset}</p>
            </div>
          </div>
          <div className="space-y-3 pt-2 border-t border-border">
            <div className="flex items-center justify-between">
              <span className="text-xs text-tertiary">Balance</span>
              <EncryptedValue />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-tertiary">dWallet</span>
              <a href={`https://suiscan.xyz/testnet/object/${deposit.dWalletId}`} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1 font-mono text-xs text-blue hover:underline">
                {trunc(deposit.dWalletId)} <ArrowUpRight size={11} />
              </a>
            </div>
          </div>
        </div>

        {/* Right — Borrow */}
        <div className="card p-6 space-y-5">
          <p className="label">Borrow USDC</p>
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-tertiary">Loan Amount</span>
              <span className="text-secondary">Max 75% LTV · <span className="text-primary font-medium">${maxLoan.toLocaleString()}</span> available</span>
            </div>
            <div className="flex items-center rounded-xl border border-border bg-elevated h-14 px-5 focus-within:border-blue/40 transition-colors">
              <input type="number" min={100} max={maxLoan} step={100} value={loanAmount}
                onChange={(e) => setLoanAmount(Math.min(Number(e.target.value), maxLoan))}
                className="flex-1 bg-transparent text-xl font-semibold text-primary outline-none"
                style={{ fontFamily: "var(--font-jetbrains)" }} />
              <span className="font-mono text-sm text-secondary">USDC</span>
            </div>
            <input type="range" min={100} max={maxLoan} step={100} value={loanAmount}
              onChange={(e) => setLoanAmount(Number(e.target.value))}
              className="w-full accent-blue" />
          </div>

          {/* Health factor */}
          <div className="space-y-3 pt-2 border-t border-border">
            {loanAmount > 0 ? (
              <>
                <HealthMeter value={confirmedHF ?? healthFactor} />
                <p className="text-2xs text-tertiary" style={{ fontFamily: "var(--font-jetbrains)" }}>
                  encrypted on-chain · computed via FHE
                </p>
              </>
            ) : (
              <p className="text-xs text-tertiary">Enter a loan amount to preview health factor</p>
            )}
          </div>

          <button onClick={handleBorrow} disabled={loanAmount <= 0 || loanAmount > maxLoan || fheState === "computing"}
            className="btn-primary w-full h-12 gap-2">
            {fheState === "computing" && <Loader2 size={14} className="animate-spin" />}
            Borrow {loanAmount.toLocaleString()} USDC
          </button>
        </div>
      </div>

      {/* Active loan card */}
      {loan && (
        <div className="card p-6 space-y-4" style={{ borderLeft: "3px solid #10b981" }}>
          <p className="label text-green">Active Loan</p>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-2xs text-tertiary mb-1">Borrowed</p>
              <p className="font-semibold text-primary">{loan.loanAmount.toLocaleString()} <span className="text-secondary text-sm">USDC</span></p>
            </div>
            <div>
              <p className="text-2xs text-tertiary mb-1">Collateral</p>
              <EncryptedValue />
            </div>
            <div>
              <p className="text-2xs text-tertiary mb-1">Health Factor</p>
              <p className={`font-semibold ${loan.healthFactor >= 2 ? "text-green" : loan.healthFactor >= 1.5 ? "text-yellow" : "text-red"}`}>
                {loan.healthFactor.toFixed(2)}
              </p>
            </div>
          </div>
          <Link href="/liquidations" className="btn-ghost text-xs border border-border rounded-lg px-4 py-2 w-fit">
            View liquidation risk <ArrowRight size={11} className="inline ml-1" />
          </Link>
        </div>
      )}

      <FHEStatus />

      {/* FHE modal */}
      <AnimatePresence>
        {showFheModal && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 16 }}
              className="relative w-full sm:max-w-sm rounded-t-2xl sm:rounded-2xl border border-border bg-surface p-8 shadow-card">
              {fheState === "done" && (
                <button onClick={() => setShowFheModal(false)} className="absolute right-5 top-5 text-tertiary hover:text-secondary transition-colors">
                  <X size={16} />
                </button>
              )}
              <h3 className="mb-6 label">FHE Computation</h3>
              <div className="space-y-5">
                {[
                  { label: "Computing health factor on encrypted state...", done: !!encHF, active: fheState === "computing" && !encHF },
                  { label: confirmedHF !== null ? `Health factor confirmed: ${confirmedHF.toFixed(2)} ✓` : "Threshold decryption...", done: fheState === "done", active: !!encHF && fheState === "computing" },
                ].map(({ label, done, active }, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="shrink-0 mt-0.5">
                      {done ? <CheckCircle size={18} className="text-green" />
                        : active ? <div className="h-5 w-5 rounded-full border-2 border-blue flex items-center justify-center" style={{ boxShadow: "0 0 12px rgba(79,142,255,0.4)" }}><Loader2 size={11} className="animate-spin text-blue" /></div>
                        : <div className="h-5 w-5 rounded-full border border-border" />}
                    </div>
                    <p className={`text-sm ${done ? "text-green" : active ? "text-primary" : "text-tertiary"}`}>{label}</p>
                  </div>
                ))}
              </div>
              {fheState === "done" && confirmedHF !== null && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-6 space-y-3">
                  <div className="rounded-xl bg-green-dim border border-green/20 p-4">
                    <p className="text-sm font-semibold text-green">Loan active — {loanAmount.toLocaleString()} USDC borrowed</p>
                    <p className="text-xs text-secondary mt-1">+{loanAmount.toLocaleString()} USDC added to your position</p>
                  </div>
                  <button onClick={() => setShowFheModal(false)} className="btn-primary w-full h-11">Done</button>
                </motion.div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
