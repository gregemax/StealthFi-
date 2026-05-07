"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, X, Copy, Check, ChevronDown, ChevronUp, Loader2, CheckCircle } from "lucide-react";
import { MOCK_LIQUIDATIONS, type LiquidationPosition } from "@/lib/mockData";
import { encryptValue } from "@/lib/fheSimulator";
import { storage } from "@/lib/storage";

// Countdown that ticks from a fixed end time (stable across re-renders)
function Countdown({ endsAt }: { endsAt: number }) {
  const [remaining, setRemaining] = useState(Math.max(0, Math.floor((endsAt - Date.now()) / 1000)));
  useEffect(() => {
    const t = setInterval(() => setRemaining(Math.max(0, Math.floor((endsAt - Date.now()) / 1000))), 1000);
    return () => clearInterval(t);
  }, [endsAt]);
  const h = Math.floor(remaining / 3600);
  const m = Math.floor((remaining % 3600) / 60);
  const s = remaining % 60;
  return <span className="font-mono text-sm tabular-nums text-text">{String(h).padStart(2,"0")}:{String(m).padStart(2,"0")}:{String(s).padStart(2,"0")}</span>;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
      className="ml-1 text-muted hover:text-accent transition-colors">
      {copied ? <Check size={11} className="text-accent" /> : <Copy size={11} />}
    </button>
  );
}

function BidModal({ pos, onClose }: { pos: LiquidationPosition; onClose: () => void }) {
  const [bid, setBid] = useState("");
  const [discount, setDiscount] = useState(8);
  const [fheState, setFheState] = useState<"idle" | "encrypting" | "done">("idle");
  const [encBid, setEncBid] = useState<string | null>(null);

  const bidNum = parseFloat(bid) || 0;
  const estProfit = bidNum > 0 ? `$${Math.floor(bidNum * (discount / 100) * 0.8).toLocaleString()} – $${Math.floor(bidNum * (discount / 100) * 1.2).toLocaleString()}` : "—";

  async function handleSubmit() {
    if (!bid) return;
    setFheState("encrypting");
    try {
      const enc = await encryptValue(bidNum);
      setEncBid(enc);
      setFheState("done");
    } catch (err) {
      console.error("[StealthFi] Ika fallback:", err);
      setFheState("idle");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-md rounded-xl border border-border bg-surface p-8 max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute right-4 top-4 text-muted hover:text-text"><X size={16} /></button>
        <h3 className="mb-1 font-mono text-sm uppercase tracking-widest text-accent">Submit Sealed Bid</h3>
        <div className="mb-5 flex items-center gap-1 font-mono text-xs text-text-dim">
          {pos.id}<CopyButton text={pos.id} />
        </div>

        {fheState !== "done" ? (
          <>
            <div className="space-y-4 mb-5">
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase tracking-widest text-muted">Bid Amount (USDC)</label>
                <div className="flex items-center rounded-xl border border-border bg-surface-2 px-4 py-3 focus-within:border-accent">
                  <input type="number" placeholder="0.00" value={bid} onChange={(e) => setBid(e.target.value)}
                    className="flex-1 bg-transparent font-mono text-base text-text outline-none placeholder:text-muted" />
                  <span className="font-mono text-sm text-text-dim">USDC</span>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <label className="text-[10px] font-mono uppercase tracking-widest text-muted">Discount</label>
                  <span className="font-mono text-xs text-text">{discount}%</span>
                </div>
                <input type="range" min={5} max={15} step={1} value={discount} onChange={(e) => setDiscount(Number(e.target.value))} className="w-full accent-accent" />
              </div>
              <div className="flex justify-between text-xs font-mono">
                <span className="text-muted">Est. profit range</span>
                <span className="text-accent">{estProfit}</span>
              </div>
            </div>
            <button onClick={handleSubmit} disabled={!bid || fheState === "encrypting"}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-accent bg-accent-dim py-3 font-mono text-sm text-accent hover:bg-accent hover:text-bg transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
              {fheState === "encrypting" ? <Loader2 size={14} className="animate-spin" /> : <Lock size={14} />}
              {fheState === "encrypting" ? "Encrypting..." : "Encrypt & Submit Bid"}
            </button>
          </>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              {["Encrypting bid...", "Submitting to FHE cluster...", "Bid sealed ✓"].map((label, i) => (
                <div key={i} className="flex items-center gap-2">
                  <CheckCircle size={14} className="text-accent shrink-0" />
                  <span className="font-mono text-xs text-accent">{label}</span>
                </div>
              ))}
            </div>
            <div className="rounded-lg border border-border bg-surface-2 p-3">
              <p className="text-[10px] font-mono text-muted mb-1">Encrypted bid hash</p>
              <p className="font-mono text-xs text-text break-all">{encBid?.slice(0, 20)}...</p>
            </div>
            <p className="text-xs text-text-dim font-mono">Your bid is sealed. Position details revealed only if you win.</p>
            <button onClick={onClose} className="w-full rounded-xl border border-border py-2 font-mono text-sm text-text-dim hover:border-accent hover:text-accent transition-colors">
              Close
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default function LiquidationsPage() {
  const [activeBid, setActiveBid] = useState<LiquidationPosition | null>(null);
  const [howOpen, setHowOpen] = useState(false);
  const loan = storage.getLoan();
  // Stable end times — computed once on mount
  const endTimes = useRef<number[]>(MOCK_LIQUIDATIONS.map((p) => Date.now() + p.closesInSeconds * 1000));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-mono text-2xl font-bold text-text">Dark Pool Liquidation Auction</h1>
        <p className="mt-1 text-sm text-text-dim">At-risk positions — sealed-bid auction. Position details encrypted until close.</p>
      </div>

      {/* User position warning */}
      {loan && (
        <div className={`rounded-xl border p-4 flex items-center justify-between ${loan.healthFactor < 1.5 ? "border-red-400/40 bg-red-400/5" : "border-amber-400/30 bg-amber-400/5"}`}>
          <div>
            <p className="font-mono text-xs text-muted uppercase tracking-widest mb-1">Your Position</p>
            <p className="font-mono text-sm text-text">
              Health Factor: <span className={loan.healthFactor < 1.5 ? "text-red-400" : "text-amber-400"}>{loan.healthFactor.toFixed(2)}</span>
              {loan.healthFactor < 1.5 && <span className="ml-2 text-red-400">⚠ At risk of liquidation</span>}
            </p>
          </div>
          <span className="font-mono text-xs text-text-dim">{loan.loanAmount.toLocaleString()} USDC borrowed</span>
        </div>
      )}

      {/* Position cards */}
      <div className="space-y-4">
        {MOCK_LIQUIDATIONS.map((pos, idx) => (
          <div key={pos.id} className="rounded-xl border border-border bg-surface p-5 hover:border-accent/40 transition-colors">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-3 flex-1">
                {/* Header row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 font-mono text-sm text-text">
                    {pos.id}<CopyButton text={pos.id} />
                  </div>
                  <span className={`text-xs font-mono px-2 py-0.5 rounded-full border ${pos.healthFactor < 1.2 ? "border-red-400/40 text-red-400 bg-red-400/10" : "border-amber-400/40 text-amber-400 bg-amber-400/10"}`}>
                    {pos.healthFactor < 1.2 ? "🔴 At Risk" : "🟡 Caution"}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-4">
                  <div>
                    <p className="text-[10px] font-mono uppercase tracking-widest text-muted">Asset</p>
                    <p className="font-mono text-sm text-text">{pos.asset}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-mono uppercase tracking-widest text-muted">Collateral</p>
                    <p className="font-mono text-sm text-text-dim">{pos.collateralRange}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-mono uppercase tracking-widest text-muted">Health</p>
                    <p className={`font-mono text-sm ${pos.healthFactor < 1.2 ? "text-red-400" : "text-amber-400"}`}>{pos.healthFactor.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-mono uppercase tracking-widest text-muted">Closes In</p>
                    <Countdown endsAt={endTimes.current[idx]} />
                  </div>
                </div>

                {/* LTV bar */}
                <div>
                  <div className="flex justify-between text-[10px] font-mono text-muted mb-1">
                    <span>LTV</span><span>{pos.ltv}%</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-surface-2 overflow-hidden">
                    <div className="h-full rounded-full bg-red-400" style={{ width: `${pos.ltv}%` }} />
                  </div>
                </div>
              </div>

              <button onClick={() => setActiveBid(pos)}
                className="shrink-0 flex items-center gap-2 rounded-lg border border-border bg-surface-2 px-4 py-2 font-mono text-xs text-text-dim hover:border-accent hover:text-accent transition-colors">
                <Lock size={12} />Submit Sealed Bid
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* How it works */}
      <div className="rounded-xl border border-border bg-surface overflow-hidden">
        <button onClick={() => setHowOpen((p) => !p)}
          className="w-full flex items-center justify-between px-5 py-4 font-mono text-xs uppercase tracking-widest text-muted hover:text-text transition-colors">
          How liquidations work
          {howOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
        <AnimatePresence>
          {howOpen && (
            <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
              <div className="px-5 pb-5 space-y-3">
                {[
                  ["01", "Position identified", "Health factor drops below threshold. Position enters auction queue."],
                  ["02", "Sealed bids collected", "Liquidators submit encrypted bids via FHE. No one sees competing bids."],
                  ["03", "Winner revealed", "Threshold decryption reveals winning bid. Position details disclosed to winner only."],
                ].map(([n, title, desc]) => (
                  <div key={n} className="flex gap-3">
                    <span className="font-mono text-xs text-accent shrink-0 mt-0.5">{n}</span>
                    <div>
                      <p className="font-mono text-xs text-text">{title}</p>
                      <p className="text-[11px] text-text-dim mt-0.5">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {activeBid && <BidModal pos={activeBid} onClose={() => setActiveBid(null)} />}
      </AnimatePresence>
    </div>
  );
}
