"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, Loader2, X } from "lucide-react";

interface StepProgressProps {
  steps: string[];
  onClose: () => void;
}

export default function StepProgress({ steps, onClose }: StepProgressProps) {
  const [current, setCurrent] = useState(0);
  const done = current >= steps.length;

  useEffect(() => {
    if (done) return;
    const t = setTimeout(() => setCurrent((p) => p + 1), 1500);
    return () => clearTimeout(t);
  }, [current, done]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-md rounded-xl border border-border bg-surface p-8"
      >
        {done && (
          <button onClick={onClose} className="absolute right-4 top-4 text-muted hover:text-text">
            <X size={16} />
          </button>
        )}
        <h3 className="mb-6 text-sm font-mono uppercase tracking-widest text-accent">
          Transaction Progress
        </h3>
        <div className="space-y-4">
          {steps.map((step, i) => {
            const isActive = i === current;
            const isDone = i < current;
            return (
              <div key={i} className="flex items-center gap-3">
                <div className="w-5 shrink-0">
                  {isDone ? (
                    <CheckCircle size={18} className="text-accent" />
                  ) : isActive ? (
                    <Loader2 size={18} className="animate-spin text-accent" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border border-border" />
                  )}
                </div>
                <span
                  className={`text-sm font-mono ${
                    isDone ? "text-accent" : isActive ? "text-text" : "text-muted"
                  }`}
                >
                  {step}
                </span>
              </div>
            );
          })}
        </div>
        {done && (
          <AnimatePresence>
            <motion.button
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={onClose}
              className="mt-8 w-full rounded border border-accent bg-accent-dim py-2 text-sm font-mono text-accent hover:bg-accent hover:text-bg transition-colors"
            >
              Done
            </motion.button>
          </AnimatePresence>
        )}
      </motion.div>
    </div>
  );
}
