"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, CheckCircle, X, ArrowRight } from "lucide-react";
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
    setFheState("computing");
    setEncHF(null);
    setConfirmedHF(null);
    setShowFheModal(true);

    try {
      const enc = await computeHealthFactor(deposit.encryptedAmount, loanAmount);
      setEncHF(enc);
      // Simulate threshold decryption reveal
      await new Promise((r) => setTimeout(r, 600));
      const hf = parseFloat(healthFactor.toFixed(2));
      setConfirmedHF(hf);
      setFheState("done");

      const record: LoanRecord = {
        loanAmount,
        collateralUSD: deposit.usdValue,
        healthFactor: hf,
        asset: deposit.asset,
        timestamp: Date.now(),
      };
      storage.setLoan(record);
      setLoan(record);
    } catch (err) {
      console.error("[StealthFi] Ika fallback:", err);
      setFheState("idle");
      setShowFheModal(false);
    }
  }

  if (!deposit) {
    return (
      <div className="mx-auto max-w-lg space-y-8">
        <div>
          <h1 className="font-mono text-2xl font-bold text-text">Borrow USDC</h1>
        </div>
        <div className="rounded-xl border border-border bg-surface p-10 text-center space-y-4">
          <p className="font-mono text-sm text-text-dim">No collateral found — deposit first</p>
          <Link href="/deposit" className="inline-flex items-center gap-2 rounded-lg border border-accent bg-accent-dim px-5 py-2 font-mono text-sm text-accent hover:bg-accent hover:text-bg transition-colors">
            Go to Deposit <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-8">
      <div>
        <h1 className="font-mono text-2xl font-bold text-text">Borrow USDC</h1>
        <p className="mt-1 text-sm text-text-dim">Borrow against your encrypted collateral</p>
      </div>

      {/* Collateral card */}
      <div className="rounded-xl border border-border bg-surface p-5 space-y-3">
        <p className="text-[10px] font-mono uppercase tracking-widest text-muted">Your Collateral</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-mono text-lg">{deposit.asset === "BTC" ? "₿" : "Ξ"}</span>
            <span className="font-mono text-sm font-semibold text-text">{deposit.asset}</span>
          </div>
          <span className="font-mono text-sm text-text">${deposit.usdValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-muted">Balance</span>
          <EncryptedValue />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-muted">dWallet</span>
          <span className="font-mono text-xs text-accent">{trunc(deposit.dWalletId)}</span>
        </div>
      </div>

      {/* Loan amount */}
      <div className="space-y-3">
        <div className="flex justify-between text-xs font-mono">
          <span className="uppercase tracking-widest text-muted">Loan Amount</span>
          <span className="text-text-dim">Max: <span className="text-text">${maxLoan.toLocaleString()}</span> USDC (75% LTV)</span>
        </div>
        <input
          type="range" min={100} max={maxLoan} step={100}
          value={loanAmount}
          onChange={(e) => setLoanAmount(Number(e.target.value))}
          className="w-full accent-accent"
        />
        <div className="flex items-center rounded-xl border border-border bg-surface px-4 py-2 focus-within:border-accent">
          <input
            type="number" min={100} max={maxLoan} step={100}
            value={loanAmount}
            onChange={(e) => setLoanAmount(Math.min(Number(e.target.value), maxLoan))}
            className="flex-1 bg-transparent font-mono text-base text-text outline-none"
          />
          <span className="font-mono text-sm text-text-dim">USDC</span>
        </div>
      </div>

      {/* Health factor */}
      <div className="rounded-xl border border-border bg-surface p-5 space-y-3">
        <p className="text-[10px] font-mono uppercase tracking-widest text-muted">Health Factor</p>
        {loanAmount > 0 ? (
          <>
            <HealthMeter value={confirmedHF ?? healthFactor} />
            <p className="text-[10px] font-mono text-muted">encrypted on-chain — computed via FHE</p>
          </>
        ) : (
          <p className="font-mono text-xs text-muted">Enter a loan amount to preview</p>
        )}
      </div>

      {/* Active loan card */}
      {loan && (
        <div className="rounded-xl border border-accent/30 bg-surface p-5 space-y-3">
          <p className="text-[10px] font-mono uppercase tracking-widest text-accent">Active Loan</p>
          <div className="flex justify-between font-mono text-sm">
            <span className="text-muted">Borrowed</span>
            <span className="text-text">{loan.loanAmount.toLocaleString()} USDC</span>
          </div>
          <div className="flex justify-between font-mono text-sm">
            <span className="text-muted">Collateral</span>
            <EncryptedValue />
          </div>
          <div className="flex justify-between font-mono text-sm">
            <span className="text-muted">Health Factor</span>
            <span className={loan.healthFactor >= 2 ? "text-accent" : loan.healthFactor >= 1.5 ? "text-amber-400" : "text-red-400"}>
              {loan.healthFactor.toFixed(2)}
            </span>
          </div>
          <Link href="/liquidations" className="flex items-center justify-center gap-2 rounded-lg border border-border py-2 font-mono text-xs text-text-dim hover:border-accent hover:text-accent transition-colors">
            View liquidation risk <ArrowRight size={12} />
          </Link>
        </div>
      )}

      <button
        onClick={handleBorrow}
        disabled={loanAmount <= 0 || fheState === "computing"}
        className="w-full flex items-center justify-center gap-2 rounded-xl border border-accent bg-accent-dim py-3 font-mono text-sm text-accent transition-colors hover:bg-accent hover:text-bg disabled:cursor-not-allowed disabled:opacity-50"
      >
        {fheState === "computing" && <Loader2 size={14} className="animate-spin" />}
        Borrow {loanAmount.toLocaleString()} USDC
      </button>

      <FHEStatus />

      {/* FHE mini modal */}
      <AnimatePresence>
        {showFheModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-sm rounded-xl border border-border bg-surface p-8"
            >
              {fheState === "done" && (
                <button onClick={() => setShowFheModal(false)} className="absolute right-4 top-4 text-muted hover:text-text">
                  <X size={16} />
                </button>
              )}
              <h3 className="mb-6 text-sm font-mono uppercase tracking-widest text-accent">FHE Computation</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 w-5 shrink-0">
                    {fheState === "computing" && !encHF
                      ? <Loader2 size={18} className="animate-spin text-accent" />
                      : <CheckCircle size={18} className="text-accent" />}
                  </div>
                  <span className={`text-sm font-mono ${encHF ? "text-accent" : "text-text"}`}>
                    Computing health factor on encrypted state...
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 w-5 shrink-0">
                    {!encHF ? <div className="h-4 w-4 rounded-full border border-border" />
                      : fheState === "computing" ? <Loader2 size={18} className="animate-spin text-accent" />
                      : <CheckCircle size={18} className="text-accent" />}
                  </div>
                  <span className={`text-sm font-mono ${fheState === "done" ? "text-accent" : encHF ? "text-text" : "text-muted"}`}>
                    {confirmedHF !== null
                      ? `Health factor confirmed: ${confirmedHF.toFixed(2)} ✓`
                      : "Health factor confirmed..."}
                  </span>
                </div>
              </div>
              {fheState === "done" && confirmedHF !== null && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-6 space-y-3">
                  <p className="font-mono text-xs text-accent">Loan active — {loanAmount.toLocaleString()} USDC borrowed</p>
                  <p className="font-mono text-xs text-text-dim">+{loanAmount.toLocaleString()} USDC added to your wallet</p>
                  <button
                    onClick={() => setShowFheModal(false)}
                    className="w-full rounded border border-accent bg-accent-dim py-2 text-sm font-mono text-accent hover:bg-accent hover:text-bg transition-colors"
                  >
                    Done
                  </button>
                </motion.div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
