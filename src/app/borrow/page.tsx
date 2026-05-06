"use client";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import HealthMeter from "@/components/HealthMeter";
import StepProgress from "@/components/StepProgress";
import { MOCK_BORROW_MAX_USDC, BORROW_STEPS } from "@/lib/mockData";
import { computeHealthFactor, triggerDecryption } from "@/lib/fheSimulator";

// Placeholder ciphertext shown when no real deposit session exists
const DEMO_CIPHERTEXT = "0xFHE:a3f9c2e1b8d047...";

export default function BorrowPage() {
  const [loanAmount, setLoanAmount] = useState(10000);
  const [showProgress, setShowProgress] = useState(false);
  const [fheStatus, setFheStatus] = useState<"idle" | "computing" | "decrypting" | "done">("idle");
  const [encryptedHF, setEncryptedHF] = useState<string | null>(null);
  const [healthFactor, setHealthFactor] = useState<number | null>(null);

  // Slider-driven preview (before FHE compute)
  const previewHF = Math.max(1.05, 2.5 - (loanAmount / MOCK_BORROW_MAX_USDC) * 1.4);

  async function handleBorrow() {
    setFheStatus("computing");
    setEncryptedHF(null);
    setHealthFactor(null);

    try {
      // TODO: integrate Ika SDK — verify dWallet collateral proof before borrowing
      const encHF = await computeHealthFactor(DEMO_CIPHERTEXT, loanAmount);
      setEncryptedHF(encHF);
      setFheStatus("decrypting");

      const hf = await triggerDecryption(encHF, "demo-pubkey");
      setHealthFactor(hf);
      setFheStatus("done");

      // Show the Solana confirmation modal after FHE resolves
      setShowProgress(true);
    } catch (err) {
      console.error("[StealthFi Ika Error] Borrow FHE flow failed:", err);
      setFheStatus("idle");
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-8">
      <div>
        <h1 className="font-mono text-2xl font-bold text-text">Borrow USDC</h1>
        <p className="mt-1 text-sm text-text-dim">Borrow against your encrypted collateral</p>
      </div>

      {/* Collateral summary */}
      <div className="rounded-xl border border-border bg-surface p-5">
        <div className="mb-1 text-xs font-mono uppercase tracking-widest text-muted">
          Your Collateral
        </div>
        <p className="font-mono text-sm text-text break-all">
          {DEMO_CIPHERTEXT}
        </p>
        <p className="mt-2 text-[11px] text-text-dim">
          Collateral value is encrypted. Loan eligibility is computed via FHE proof.
        </p>
      </div>

      {/* Loan slider */}
      <div className="space-y-3">
        <div className="flex justify-between text-xs font-mono">
          <span className="uppercase tracking-widest text-muted">Loan Amount</span>
          <span className="text-text">
            {loanAmount.toLocaleString()} <span className="text-text-dim">USDC</span>
          </span>
        </div>
        <input
          type="range"
          min={1000}
          max={MOCK_BORROW_MAX_USDC}
          step={500}
          value={loanAmount}
          onChange={(e) => setLoanAmount(Number(e.target.value))}
          className="w-full accent-accent"
        />
        <div className="flex justify-between text-[10px] font-mono text-muted">
          <span>1,000 USDC</span>
          <span>{MOCK_BORROW_MAX_USDC.toLocaleString()} USDC max</span>
        </div>
      </div>

      {/* Health factor — shows FHE result when available, preview otherwise */}
      <div className="rounded-xl border border-border bg-surface p-5 space-y-3">
        <div className="text-xs font-mono uppercase tracking-widest text-muted">Health Factor</div>

        {fheStatus === "computing" && (
          <div className="flex items-center gap-2 text-xs font-mono text-text-dim">
            <Loader2 size={13} className="animate-spin text-accent" />
            Running FHE circuit on encrypted collateral...
          </div>
        )}
        {fheStatus === "decrypting" && encryptedHF && (
          <div className="space-y-1">
            <p className="text-[10px] font-mono text-muted">Encrypted result:</p>
            <p className="font-mono text-xs text-text break-all">{encryptedHF.slice(0, 32)}...</p>
            <div className="flex items-center gap-2 text-xs font-mono text-text-dim mt-2">
              <Loader2 size={13} className="animate-spin text-accent" />
              Threshold decryption in progress...
            </div>
          </div>
        )}
        {fheStatus === "done" && healthFactor !== null ? (
          <HealthMeter value={healthFactor} />
        ) : fheStatus === "idle" ? (
          <HealthMeter value={previewHF} />
        ) : null}
      </div>

      {/* Borrow button */}
      <button
        onClick={handleBorrow}
        disabled={fheStatus === "computing" || fheStatus === "decrypting"}
        className="w-full flex items-center justify-center gap-2 rounded-xl border border-accent bg-accent-dim py-3 font-mono text-sm text-accent transition-colors hover:bg-accent hover:text-bg disabled:cursor-not-allowed disabled:opacity-50"
      >
        {(fheStatus === "computing" || fheStatus === "decrypting") && (
          <Loader2 size={14} className="animate-spin" />
        )}
        Borrow {loanAmount.toLocaleString()} USDC
      </button>

      {showProgress && (
        <StepProgress steps={BORROW_STEPS} onClose={() => setShowProgress(false)} />
      )}
    </div>
  );
}
