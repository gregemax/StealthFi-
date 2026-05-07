"use client";
import { useEffect, useState } from "react";
import { getClusterStatus, type ClusterStatus } from "@/lib/fheSimulator";

export default function FHEStatus() {
  const [status, setStatus] = useState<ClusterStatus | null>(null);

  useEffect(() => { getClusterStatus().then(setStatus).catch(() => {}); }, []);

  return (
    <div className="rounded-xl border border-cyan/15 p-4" style={{ background: "#050510" }}>
      <div className="mb-3 flex items-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full bg-cyan animate-pulse" />
        <span className="text-2xs font-mono uppercase tracking-[0.1em] text-cyan">Encrypt Network</span>
      </div>
      {status ? (
        <div className="space-y-2">
          {[
            ["Executor Nodes", `${status.executors}/3`],
            ["Decryptor Nodes", `${status.decryptors}/7`],
            ["Avg Latency", status.latency],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between">
              <span className="text-xs text-tertiary">{label}</span>
              <span className="font-mono text-xs text-cyan">{value}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-4 w-full rounded" />
          ))}
        </div>
      )}
    </div>
  );
}
