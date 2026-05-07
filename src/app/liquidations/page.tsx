"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, X, Copy, Check, ChevronDown, ChevronUp, Loader2, CheckCircle, AlertTriangle } from "lucide-react";
import { MOCK_LIQUIDATIONS, type LiquidationPosition } from "@/lib/mockData";
import { encryptValue } from "@/lib/fheSimulator";
import { storage } from "@/lib/storage";

function Countdown({ endsAt }: { endsAt: number }) {
  const [remaining, setRemaining] = useState(Math.max(0, Math.floor((endsAt - Date.now()) / 1000)));
  useEffect(() => {
    const t = setInterval(() => setRemaining(Math.max(0, Math.floor((endsAt - Date.now()) / 1000))), 1000);
    return () => clearInterval(t);
  }, [endsAt]);
  const h = Math.floor(remaining / 3600);
  const m = Math.floor((remaining % 3600) / 60);
  const s = remaining % 60;
  const unit = (v: number, label: string) => (
    <div className="flex flex-col items-center rounded-lg border border-border bg-elevated px-2.5 py-1.5 min-w-[40px]">
      <span className="font-mono text-base font-semibold text-primary leading-none">{String(v).padStart(2, "0")}</span>
      <span className="text-[8px] text-tertiary mt-0.5">{label}</span>
    </div>
  );
  return <div className="flex items-center gap-1">{unit(h, "HRS")}{unit(m, "MIN")}{unit(s, "SEC")}</div>;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
      className="text-tertiary hover:text-secondary transition-colors">
      {copied ? <Check size={11} className="text-green" /> : <Copy size={11} />}
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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="relative w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl border border-border bg-surface p-8 shadow-card max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute right-5 top-5 text-tertiary hover:text-secondary transition-colors"><X size={16} /></button>
        <h3 className="mb-1 text-base font-semibold text-primary">Submit Encrypted Bid</h3>
        <div className="mb-5 flex items-center gap-1.5">
          <span className="font-mono text-xs text-tertiary">{pos.id}</span>
          <CopyButton text={pos.id} />
        </div>

        {fheState !== "done" ? (
          <>
            {/* Warning */}
            <div className="mb-5 rounded-xl border border-yellow/20 bg-yellow-dim p-4 flex gap-3">
              <AlertTriangle size={14} className="text-yellow shrink-0 mt-0.5" />
              <p className="text-xs text-secondary">This bid will be encrypted. Position details are revealed only to the winner.</p>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="space-y-1.5">
                <p className="label">Bid Amount</p>
                <div className="flex items-center rounded-xl border border-border bg-elevated h-12 px-4 focus-within:border-blue/40 transition-colors">
                  <input type="number" placeholder="0" value={bid} onChange={(e) => setBid(e.target.value)}
                    className="flex-1 bg-transparent font-mono text-base text-primary outline-none placeholder:text-tertiary" />
                  <span className="font-mono text-xs text-tertiary">USDC</span>
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <p className="label">Discount</p>
                  <span className="font-mono text-xs text-primary">{discount}%</span>
                </div>
                <div className="flex items-center h-12">
                  <input type="range" min={5} max={15} step={1} value={discount} onChange={(e) => setDiscount(Number(e.target.value))} className="w-full accent-blue" />
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center mb-5 rounded-xl border border-border bg-elevated px-4 py-3">
              <span className="text-xs text-tertiary">Est. profit</span>
              <span className="font-mono text-sm font-semibold text-green">{estProfit}</span>
            </div>

            <button onClick={handleSubmit} disabled={!bid || fheState === "encrypting"}
              className="btn-primary w-full h-12 gap-2">
              {fheState === "encrypting" ? <Loader2 size={14} className="animate-spin" /> : <Lock size={14} />}
              {fheState === "encrypting" ? "Encrypting..." : "Encrypt & Submit Bid"}
            </button>
          </>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2.5">
              {["Encrypting bid...", "Submitting to FHE cluster...", "Bid sealed ✓"].map((label, i) => (
                <div key={i} className="flex items-center gap-3">
                  <CheckCircle size={15} className="text-green shrink-0" />
                  <span className="text-sm text-green">{label}</span>
                </div>
              ))}
            </div>
            <div className="rounded-xl border border-border bg-elevated p-4">
              <p className="label mb-2">Encrypted bid hash</p>
              <p className="font-mono text-xs text-secondary break-all">{encBid?.slice(0, 32)}...</p>
            </div>
            <div className="rounded-xl border border-blue/20 bg-blue-dim p-4">
              <p className="text-sm text-secondary">Your bid is sealed in the FHE cluster. Position details revealed only if you win.</p>
            </div>
            <button onClick={onClose} className="btn-secondary w-full h-11">Close</button>
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default function LiquidationsPage() {
  const [activeBid, setActiveBid] = useState<LiquidationPosition | null>(null);
  const [howOpen, setHowOpen] = useState(false);
  const [loan, setLoan] = useState(storage.getLoan());
  const endTimes = useRef<number[]>(MOCK_LIQUIDATIONS.map((p) => Date.now() + p.closesInSeconds * 1000));

  useEffect(() => { setLoan(storage.getLoan()); }, []);

  return (
    <div className="space-y-10">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight text-primary">Dark Pool Auctions</h1>
        <p className="text-secondary">Sealed-bid liquidations. No MEV. No front-running.</p>
      </div>

      {/* User position warning */}
      {loan && (
        <div className={`rounded-xl border p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
          loan.healthFactor < 1.5 ? "border-red/30 bg-red-dim" : "border-yellow/20 bg-yellow-dim"
        }`}>
          <div className="flex items-start gap-3">
            <AlertTriangle size={16} className={loan.healthFactor < 1.5 ? "text-red shrink-0 mt-0.5" : "text-yellow shrink-0 mt-0.5"} />
            <div>
              <p className="text-sm font-medium text-primary">Your Position</p>
              <p className="text-xs text-secondary mt-0.5">
                Health Factor: <span className={loan.healthFactor < 1.5 ? "text-red font-semibold" : "text-yellow font-semibold"}>{loan.healthFactor.toFixed(2)}</span>
                {loan.healthFactor < 1.5 && " · Your position may be at risk of liquidation"}
              </p>
            </div>
          </div>
          <span className="font-mono text-xs text-tertiary shrink-0">{loan.loanAmount.toLocaleString()} USDC borrowed</span>
        </div>
      )}

      {/* Position cards */}
      <div className="space-y-4">
        {MOCK_LIQUIDATIONS.map((pos, idx) => {
          const borderColor = pos.ltv > 85 ? "#ef4444" : "#f59e0b";
          return (
            <div key={pos.id} className="card p-6 transition-all duration-200 hover:border-border-active hover:-translate-y-0.5"
              style={{ borderLeft: `3px solid ${borderColor}` }}>
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-4 flex-1">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm text-primary">{pos.id}</span>
                      <CopyButton text={pos.id} />
                      <span className="rounded-full border border-border bg-elevated px-2 py-0.5 text-[10px] font-mono text-secondary">{pos.asset}</span>
                    </div>
                    <span className={`rounded-full border px-2.5 py-1 text-[10px] font-mono font-semibold ${
                      pos.healthFactor < 1.2 ? "border-red/30 text-red bg-red-dim" : "border-yellow/30 text-yellow bg-yellow-dim"
                    }`}>
                      {pos.healthFactor < 1.2 ? "🔴 At Risk" : "🟡 Caution"}
                    </span>
                  </div>

                  {/* Data grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div>
                      <p className="label mb-1">Collateral</p>
                      <p className="text-sm text-secondary">{pos.collateralRange}</p>
                    </div>
                    <div>
                      <p className="label mb-1">Health</p>
                      <p className={`text-sm font-semibold ${pos.healthFactor < 1.2 ? "text-red" : "text-yellow"}`}>{pos.healthFactor.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="label mb-1">LTV</p>
                      <div className="space-y-1">
                        <p className="text-sm font-mono text-primary">{pos.ltv}%</p>
                        <div className="h-1.5 w-full rounded-full bg-elevated overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${pos.ltv}%`, backgroundColor: borderColor }} />
                        </div>
                      </div>
                    </div>
                    <div>
                      <p className="label mb-1">Closes In</p>
                      <Countdown endsAt={endTimes.current[idx]} />
                    </div>
                  </div>
                </div>

                <button onClick={() => setActiveBid(pos)}
                  className="btn-secondary shrink-0 h-10 px-4 text-xs gap-1.5 self-start sm:self-center">
                  <Lock size={12} /> Submit Sealed Bid
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* How it works */}
      <div className="card overflow-hidden">
        <button onClick={() => setHowOpen((p) => !p)}
          className="w-full flex items-center justify-between px-6 py-4 text-sm text-secondary hover:text-primary transition-colors">
          How liquidations work
          {howOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
        <AnimatePresence>
          {howOpen && (
            <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
              <div className="px-6 pb-6">
                {/* Timeline */}
                <div className="flex flex-col sm:flex-row gap-0 sm:gap-0">
                  {[
                    ["01", "Position identified", "Health factor drops below threshold. Position enters auction queue."],
                    ["02", "Sealed bids collected", "Liquidators submit encrypted bids via FHE. No one sees competing bids."],
                    ["03", "Winner revealed", "Threshold decryption reveals winning bid. Position details disclosed to winner only."],
                  ].map(([n, title, desc], i, arr) => (
                    <div key={n} className="flex sm:flex-col flex-1 gap-4 sm:gap-3 relative">
                      <div className="flex sm:flex-row items-start sm:items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-blue/30 bg-blue-dim">
                          <span className="font-mono text-xs text-blue">{n}</span>
                        </div>
                        {i < arr.length - 1 && (
                          <div className="hidden sm:block flex-1 border-t border-dashed border-border" />
                        )}
                      </div>
                      <div className="pb-4 sm:pb-0">
                        <p className="text-sm font-medium text-primary">{title}</p>
                        <p className="text-xs text-tertiary mt-1">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
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
