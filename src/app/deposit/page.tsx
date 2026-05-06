"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Info, Lock, CheckCircle, Loader2, X } from "lucide-react";
import { MOCK_ASSETS } from "@/lib/mockData";
import { createDWallet } from "@/lib/ikaClient";
import { encryptValue } from "@/lib/fheSimulator";

type StepState = "idle" | "running" | "done" | "error";

interface Step {
  label: string;
  state: StepState;
  detail?: string;
}

function truncate(id: string) {
  return `${id.slice(0, 6)}...${id.slice(-4)}`;
}

export default function DepositPage() {
  const [asset, setAsset] = useState(MOCK_ASSETS[0]);
  const [amount, setAmount] = useState("");
  const [steps, setSteps] = useState<Step[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [dwalletId, setDwalletId] = useState<string | null>(null);
  const [encryptedCollateral, setEncryptedCollateral] = useState<string | null>(null);

  function setStep(index: number, patch: Partial<Step>) {
    setSteps((prev) => prev.map((s, i) => (i === index ? { ...s, ...patch } : s)));
  }

  async function handleDeposit() {
    if (!amount) return;

    const initial: Step[] = [
      { label: "Creating dWallet via Ika...", state: "running" },
      { label: "Encrypting collateral via Encrypt FHE...", state: "idle" },
      { label: "Confirmed on Solana devnet", state: "idle" },
    ];
    setSteps(initial);
    setShowModal(true);

    try {
      // Step 1 — real Ika DKG (falls back to mock if no keypair)
      const { dwalletId: id } = await createDWallet();
      setDwalletId(id);
      setStep(0, { state: "done", label: `dWallet created: ${truncate(id)}` });
      setStep(1, { state: "running" });

      // Step 2 — FHE encryption simulation
      const ciphertext = await encryptValue(parseFloat(amount));
      setEncryptedCollateral(ciphertext);
      setStep(1, {
        state: "done",
        label: `Encrypted: ${ciphertext.slice(0, 20)}...`,
      });
      setStep(2, { state: "running" });

      // Step 3 — simulate Solana confirmation delay
      await new Promise((r) => setTimeout(r, 1000));
      setStep(2, {
        state: "done",
        label: `Confirmed on Solana devnet ✓ (${truncate(id)})`,
      });
    } catch (err) {
      console.error("[StealthFi Ika Error] Deposit flow failed:", err);
      setSteps((prev) =>
        prev.map((s) => (s.state === "running" ? { ...s, state: "error" } : s))
      );
    }
  }

  const allDone = steps.length > 0 && steps.every((s) => s.state === "done");

  return (
    <div className="mx-auto max-w-lg space-y-8">
      <div>
        <h1 className="font-mono text-2xl font-bold text-text">Deposit Collateral</h1>
        <p className="mt-1 text-sm text-text-dim">Lock assets via Ika dWallet — encrypted on-chain</p>
      </div>

      {/* Asset selector */}
      <div className="space-y-2">
        <label className="text-xs font-mono uppercase tracking-widest text-muted">Select Asset</label>
        <div className="grid grid-cols-2 gap-3">
          {MOCK_ASSETS.map((a) => (
            <button
              key={a.symbol}
              onClick={() => setAsset(a)}
              className={`rounded-xl border p-4 text-left transition-colors ${
                asset.symbol === a.symbol
                  ? "border-accent bg-accent-dim"
                  : "border-border bg-surface hover:border-accent/50"
              }`}
            >
              <div className="font-mono text-xl">{a.icon}</div>
              <div className="mt-1 font-mono text-sm font-semibold text-text">{a.symbol}</div>
              <div className="text-[10px] text-text-dim">via {a.via}</div>
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
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="flex-1 bg-transparent font-mono text-lg text-text outline-none placeholder:text-muted"
          />
          <span className="font-mono text-sm text-text-dim">{asset.symbol}</span>
        </div>
      </div>

      {/* Info box */}
      <div className="flex gap-3 rounded-xl border border-accent/20 bg-accent-dim p-4">
        <Info size={16} className="mt-0.5 shrink-0 text-accent" />
        <p className="text-xs text-text-dim leading-relaxed">
          Your collateral amount is encrypted via FHE. Only you can see your balance. The protocol
          operates on encrypted values — no one, including validators, can read your position size.
        </p>
      </div>

      {/* Stored result */}
      {dwalletId && encryptedCollateral && (
        <div className="rounded-xl border border-border bg-surface p-4 space-y-1">
          <p className="text-[10px] font-mono uppercase tracking-widest text-muted">Session</p>
          <p className="font-mono text-xs text-text-dim">
            dWallet: <span className="text-accent">{truncate(dwalletId)}</span>
          </p>
          <p className="font-mono text-xs text-text-dim break-all">
            Ciphertext: <span className="text-text">{encryptedCollateral.slice(0, 28)}...</span>
          </p>
        </div>
      )}

      {/* Submit */}
      <button
        onClick={handleDeposit}
        disabled={!amount}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-accent bg-accent-dim py-3 font-mono text-sm text-accent transition-colors hover:bg-accent hover:text-bg disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Lock size={14} />
        Lock Collateral
      </button>

      {/* Inline async step modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md rounded-xl border border-border bg-surface p-8"
            >
              {allDone && (
                <button
                  onClick={() => setShowModal(false)}
                  className="absolute right-4 top-4 text-muted hover:text-text"
                >
                  <X size={16} />
                </button>
              )}
              <h3 className="mb-6 text-sm font-mono uppercase tracking-widest text-accent">
                Transaction Progress
              </h3>
              <div className="space-y-4">
                {steps.map((step, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="mt-0.5 w-5 shrink-0">
                      {step.state === "done" ? (
                        <CheckCircle size={18} className="text-accent" />
                      ) : step.state === "running" ? (
                        <Loader2 size={18} className="animate-spin text-accent" />
                      ) : step.state === "error" ? (
                        <span className="text-red-400 text-sm">✗</span>
                      ) : (
                        <div className="h-4 w-4 rounded-full border border-border" />
                      )}
                    </div>
                    <span
                      className={`text-sm font-mono break-all ${
                        step.state === "done"
                          ? "text-accent"
                          : step.state === "running"
                          ? "text-text"
                          : step.state === "error"
                          ? "text-red-400"
                          : "text-muted"
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>
              {allDone && (
                <motion.button
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
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
