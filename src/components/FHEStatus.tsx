"use client";
import { useEffect, useState } from "react";
import { getClusterStatus, type ClusterStatus } from "@/lib/fheSimulator";

export default function FHEStatus() {
  const [status, setStatus] = useState<ClusterStatus | null>(null);

  useEffect(() => {
    getClusterStatus().then(setStatus);
  }, []);

  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="mb-3 text-[10px] font-mono uppercase tracking-widest text-muted">
        Encrypt FHE Cluster
      </div>
      {status ? (
        <div className="grid grid-cols-2 gap-x-6 gap-y-2">
          {[
            ["Cluster", status.cluster],
            ["Latency", status.latency],
            ["Executors", `${status.executors}/3 online`],
            ["Decryptors", `${status.decryptors}/7 online`],
          ].map(([label, value]) => (
            <div key={label}>
              <p className="text-[10px] font-mono text-muted">{label}</p>
              <p className="font-mono text-xs text-accent">{value}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="font-mono text-xs text-muted animate-pulse">Connecting to cluster...</p>
      )}
    </div>
  );
}
