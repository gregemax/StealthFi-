"use client";
import { motion } from "framer-motion";

interface HealthMeterProps {
  value: number; // 1.0 = danger, 2.0+ = safe
}

export default function HealthMeter({ value }: HealthMeterProps) {
  const clamped = Math.min(Math.max(value, 1), 3);
  const pct = ((clamped - 1) / 2) * 100;

  const color =
    pct > 60 ? "#00d4ff" : pct > 30 ? "#f59e0b" : "#ef4444";

  const label =
    pct > 60 ? "Healthy" : pct > 30 ? "At Risk" : "Danger";

  return (
    <div className="w-full">
      <div className="mb-1.5 flex justify-between text-xs font-mono">
        <span className="text-muted">Health Factor</span>
        <span style={{ color }} className="font-semibold">
          {value.toFixed(2)} — {label}
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-surface-2">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
      <div className="mt-1 flex justify-between text-[10px] font-mono text-muted">
        <span>1.0 Liquidation</span>
        <span>3.0 Safe</span>
      </div>
    </div>
  );
}
