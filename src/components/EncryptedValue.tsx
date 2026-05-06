"use client";
import { useState } from "react";
import { Lock } from "lucide-react";

export default function EncryptedValue({ className = "" }: { className?: string }) {
  const [showTip, setShowTip] = useState(false);

  return (
    <span
      className={`relative inline-flex items-center gap-1.5 cursor-default ${className}`}
      onMouseEnter={() => setShowTip(true)}
      onMouseLeave={() => setShowTip(false)}
    >
      <Lock size={13} className="text-accent" />
      <span className="font-mono text-text-dim tracking-widest select-none">████████</span>
      {showTip && (
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 whitespace-nowrap rounded border border-border bg-surface-2 px-2.5 py-1 text-xs text-accent z-50">
          Protected by Encrypt FHE
        </span>
      )}
    </span>
  );
}
