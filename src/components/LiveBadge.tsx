"use client";
import { useEffect, useState } from "react";
import { checkIkaConnection } from "@/lib/ikaClient";

type Status = "connecting" | "live" | "error";

export default function LiveBadge() {
  const [status, setStatus] = useState<Status>("connecting");

  useEffect(() => {
    checkIkaConnection()
      .then((ok) => setStatus(ok ? "live" : "error"))
      .catch(() => setStatus("error"));
  }, []);

  if (status === "connecting") {
    return (
      <span className="hidden sm:flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1" style={{ fontFamily: "var(--font-jetbrains)" }}>
        <span className="h-1.5 w-1.5 rounded-full bg-tertiary animate-pulse" />
        <span className="text-[10px] text-tertiary">connecting</span>
      </span>
    );
  }

  if (status === "error") {
    return (
      <span className="hidden sm:flex items-center gap-1.5 rounded-full border border-red/20 bg-red-dim px-2.5 py-1" style={{ fontFamily: "var(--font-jetbrains)" }}>
        <span className="h-1.5 w-1.5 rounded-full bg-red" />
        <span className="text-[10px] text-red">Ika offline</span>
      </span>
    );
  }

  return (
    <span className="hidden sm:flex items-center gap-1.5 rounded-full border border-cyan/20 bg-cyan-dim px-2.5 py-1" style={{ fontFamily: "var(--font-jetbrains)" }}>
      <span className="h-1.5 w-1.5 rounded-full bg-cyan animate-pulse" />
      <span className="text-[10px] text-cyan">Ika Live</span>
    </span>
  );
}
