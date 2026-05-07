"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, Loader2, X } from "lucide-react";

export default function StepProgress({ steps, onClose }: { steps: string[]; onClose: () => void }) {
  const [current, setCurrent] = useState(0);
  const done = current >= steps.length;

  useEffect(() => {
    if (done) return;
    const t = setTimeout(() => setCurrent((p) => p + 1), 1500);
    return () => clearTimeout(t);
  }, [current, done]);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="relative w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl border border-border bg-surface p-8 shadow-card"
      >
        {done && (
          <button onClick={onClose} className="absolute right-5 top-5 text-tertiary hover:text-secondary transition-colors">
            <X size={16} />
          </button>
        )}
        <h3 className="mb-8 text-xs font-mono uppercase tracking-[0.1em] text-secondary">Transaction Progress</h3>
        <div className="space-y-6">
          {steps.map((step, i) => {
            const isActive = i === current;
            const isDone = i < current;
            return (
              <div key={i} className="flex items-start gap-4">
                <div className="shrink-0 mt-0.5">
                  {isDone ? (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 400 }}>
                      <CheckCircle size={20} className="text-green" />
                    </motion.div>
                  ) : isActive ? (
                    <div className="relative">
                      <div className="h-5 w-5 rounded-full border-2 border-blue flex items-center justify-center" style={{ boxShadow: "0 0 12px rgba(79,142,255,0.5)" }}>
                        <Loader2 size={11} className="animate-spin text-blue" />
                      </div>
                    </div>
                  ) : (
                    <div className="h-5 w-5 rounded-full border border-border flex items-center justify-center">
                      <span className="text-[9px] font-mono text-tertiary">{i + 1}</span>
                    </div>
                  )}
                </div>
                <div>
                  <p className={`text-sm font-medium transition-colors ${isDone ? "text-green" : isActive ? "text-primary" : "text-tertiary"}`}>
                    {step}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
        {done && (
          <AnimatePresence>
            <motion.button
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              onClick={onClose}
              className="btn-primary mt-8 w-full h-12"
            >
              Done
            </motion.button>
          </AnimatePresence>
        )}
      </motion.div>
    </div>
  );
}
