"use client";
import { useState, useRef, useCallback } from "react";
import { Lock } from "lucide-react";

const CHARS = "█▓▒░▪▫◆◇○●";
const LOCKED = "████████";

export default function EncryptedValue({ className = "" }: { className?: string }) {
  const [display, setDisplay] = useState(LOCKED);
  const [showTip, setShowTip] = useState(false);
  const frameRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countRef = useRef(0);

  const scramble = useCallback(() => {
    if (frameRef.current) return;
    countRef.current = 0;
    frameRef.current = setInterval(() => {
      countRef.current++;
      if (countRef.current > 12) {
        clearInterval(frameRef.current!);
        frameRef.current = null;
        setDisplay(LOCKED);
        return;
      }
      setDisplay(
        Array.from({ length: 8 }, () => CHARS[Math.floor(Math.random() * CHARS.length)]).join("")
      );
    }, 35);
  }, []);

  function handleEnter() { setShowTip(true); scramble(); }
  function handleLeave() { setShowTip(false); }

  return (
    <span
      className={`relative inline-flex items-center gap-2 cursor-default select-none ${className}`}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <Lock size={12} className="text-cyan shrink-0" />
      <span className="font-mono text-cyan tracking-widest text-sm">{display}</span>
      <span className="rounded-full border border-cyan/20 bg-cyan-dim px-1.5 py-0.5 text-[9px] font-mono text-cyan">FHE</span>
      {showTip && (
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 whitespace-nowrap rounded-lg border border-border bg-elevated px-3 py-1.5 text-xs text-secondary shadow-card z-50">
          Protected by Encrypt FHE
        </span>
      )}
    </span>
  );
}
