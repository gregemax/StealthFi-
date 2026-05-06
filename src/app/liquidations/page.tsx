"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, X, Info } from "lucide-react";
import { MOCK_LIQUIDATIONS } from "@/lib/mockData";

function Countdown({ seconds }: { seconds: number }) {
  const [remaining, setRemaining] = useState(seconds);

  useEffect(() => {
    const t = setInterval(() => setRemaining((p) => Math.max(0, p - 1)), 1000);
    return () => clearInterval(t);
  }, []);

  const h = Math.floor(remaining / 3600);
  const m = Math.floor((remaining % 3600) / 60);
  const s = remaining % 60;

  return (
    <span className="font-mono text-sm tabular-nums text-text">
      {String(h).padStart(2, "0")}:{String(m).padStart(2, "0")}:{String(s).padStart(2, "0")}
    </span>
  );
}

function BidModal({ positionId, onClose }: { positionId: string; onClose: () => void }) {
  const [bid, setBid] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit() {
    if (!bid) return;
    // TODO: integrate Encrypt SDK — encrypt bid via FHE before submitting
    setSubmitted(true);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-md rounded-xl border border-border bg-surface p-8"
      >
        <button onClick={onClose} className="absolute right-4 top-4 text-muted hover:text-text">
          <X size={16} />
        </button>

        <h3 className="mb-1 font-mono text-sm uppercase tracking-widest text-accent">
          Submit Sealed Bid
        </h3>
        <p className="mb-6 font-mono text-xs text-text-dim">{positionId}</p>

        {!submitted ? (
          <>
            <div className="mb-4 flex gap-3 rounded-xl border border-accent/20 bg-accent-dim p-3">
              <Info size={14} className="mt-0.5 shrink-0 text-accent" />
              <p className="text-xs text-text-dim leading-relaxed">
                Your bid is encrypted. Only the winning liquidator learns position details after
                auction close.
              </p>
            </div>

            <div className="mb-6 space-y-2">
              <label className="text-xs font-mono uppercase tracking-widest text-muted">
                Bid Amount (USDC)
              </label>
              <div className="flex items-center rounded-xl border border-border bg-surface-2 px-4 py-3 focus-within:border-accent">
                <input
                  type="number"
                  placeholder="0.00"
                  value={bid}
                  onChange={(e) => setBid(e.target.value)}
                  className="flex-1 bg-transparent font-mono text-lg text-text outline-none placeholder:text-muted"
                />
                <span className="font-mono text-sm text-text-dim">USDC</span>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={!bid}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-accent bg-accent-dim py-3 font-mono text-sm text-accent transition-colors hover:bg-accent hover:text-bg disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Lock size={14} />
              Submit Encrypted Bid
            </button>
          </>
        ) : (
          <div className="text-center">
            <div className="mb-3 text-3xl">🔒</div>
            <p className="font-mono text-sm text-accent">Bid submitted &amp; encrypted</p>
            <p className="mt-1 text-xs text-text-dim">
              You will be notified if you win the auction.
            </p>
            <button
              onClick={onClose}
              className="mt-6 w-full rounded-xl border border-border py-2 font-mono text-sm text-text-dim hover:border-accent hover:text-accent transition-colors"
            >
              Close
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default function LiquidationsPage() {
  const [activeBid, setActiveBid] = useState<string | null>(null);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-mono text-2xl font-bold text-text">Dark Pool Liquidation Auction</h1>
        <p className="mt-1 text-sm text-text-dim">
          At-risk positions available for sealed-bid liquidation. Position details remain encrypted
          until auction close.
        </p>
      </div>

      <div className="space-y-4">
        {MOCK_LIQUIDATIONS.map((pos) => (
          <div
            key={pos.id}
            className="rounded-xl border border-border bg-surface p-5 transition-colors hover:border-accent/40"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-3">
                {/* Position ID */}
                <div>
                  <div className="mb-0.5 text-[10px] font-mono uppercase tracking-widest text-muted">
                    Position ID
                  </div>
                  <span className="font-mono text-sm text-text">{pos.id}</span>
                </div>

                <div className="flex flex-wrap gap-6">
                  <div>
                    <div className="mb-0.5 text-[10px] font-mono uppercase tracking-widest text-muted">
                      Collateral
                    </div>
                    <span className="font-mono text-sm text-text">{pos.collateralType}</span>
                  </div>
                  <div>
                    <div className="mb-0.5 text-[10px] font-mono uppercase tracking-widest text-muted">
                      Est. LTV Range
                    </div>
                    <span className="font-mono text-sm text-amber-400">{pos.ltvRange}</span>
                  </div>
                  <div>
                    <div className="mb-0.5 text-[10px] font-mono uppercase tracking-widest text-muted">
                      Est. Size
                    </div>
                    <span className="font-mono text-sm text-text-dim">{pos.estimatedSize}</span>
                  </div>
                  <div>
                    <div className="mb-0.5 text-[10px] font-mono uppercase tracking-widest text-muted">
                      Auction Closes In
                    </div>
                    <Countdown seconds={pos.closesIn} />
                  </div>
                </div>
              </div>

              <button
                onClick={() => setActiveBid(pos.id)}
                className="shrink-0 flex items-center gap-2 rounded-lg border border-border bg-surface-2 px-4 py-2 font-mono text-xs text-text-dim transition-colors hover:border-accent hover:text-accent"
              >
                <Lock size={12} />
                Submit Sealed Bid
              </button>
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {activeBid && (
          <BidModal positionId={activeBid} onClose={() => setActiveBid(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
