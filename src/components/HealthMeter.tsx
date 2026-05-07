"use client";
import { motion } from "framer-motion";

export default function HealthMeter({ value }: { value: number }) {
  const clamped = Math.min(Math.max(value, 1), 3);
  const pct = ((clamped - 1) / 2) * 100;

  // Spec: green >2.0, yellow 1.5–2.0, red <1.5
  const color = value > 2.0 ? "#10b981" : value >= 1.5 ? "#f59e0b" : "#ef4444";
  const label = value > 2.0 ? "SAFE" : value >= 1.5 ? "CAUTION" : "AT RISK";
  const labelColor = value > 2.0 ? "text-green" : value >= 1.5 ? "text-yellow" : "text-red";
  const labelBg = value > 2.0 ? "bg-green-dim border-green/20" : value >= 1.5 ? "bg-yellow-dim border-yellow/20" : "bg-red-dim border-red/20";

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between">
        <span className="label">Health Factor</span>
        <div className="flex items-center gap-2">
          <span className="font-mono text-lg font-semibold" style={{ color }}>{value.toFixed(2)}</span>
          <span className={`rounded-full border px-2 py-0.5 text-[9px] font-mono font-semibold ${labelColor} ${labelBg}`}>{label}</span>
        </div>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-elevated">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}60` }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
      <div className="flex justify-between text-2xs font-mono text-tertiary">
        <span>1.0 · Liquidation</span>
        <span>Liquidation threshold: 1.2×</span>
        <span>3.0 · Safe</span>
      </div>
    </div>
  );
}
