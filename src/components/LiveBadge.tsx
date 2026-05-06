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
      <span className="flex items-center gap-1.5 text-[10px] font-mono text-muted">
        <span className="h-1.5 w-1.5 rounded-full bg-muted animate-pulse" />
        connecting...
      </span>
    );
  }

  if (status === "error") {
    return (
      <span className="flex items-center gap-1.5 text-[10px] font-mono text-red-400">
        <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
        Ika offline
      </span>
    );
  }

  return (
    <span className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
      Ika testnet live
    </span>
  );
}
