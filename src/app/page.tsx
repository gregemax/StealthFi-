"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { storage, type DepositRecord, type LoanRecord } from "@/lib/storage";
import { MOCK_STATS } from "@/lib/mockData";
import HealthMeter from "@/components/HealthMeter";

function StatCard({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: boolean }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-6">
      <div className="mb-3 text-xs font-mono uppercase tracking-widest text-muted">{label}</div>
      <p className={`font-mono text-2xl font-semibold ${accent ? "text-accent" : "text-text"}`}>{value}</p>
      {sub && <p className="mt-1 text-[10px] font-mono text-muted">{sub}</p>}
    </div>
  );
}

export default function DashboardPage() {
  const [deposit, setDeposit] = useState<DepositRecord | null>(null);
  const [loan, setLoan] = useState<LoanRecord | null>(null);

  useEffect(() => {
    setDeposit(storage.getDeposit());
    setLoan(storage.getLoan());
  }, []);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="mb-1 font-mono text-3xl font-bold tracking-tight text-text">Protocol Overview</h1>
        <p className="text-sm text-text-dim">Confidential cross-chain lending — powered by Ika dWallet &amp; Encrypt FHE</p>
      </div>

      {/* Protocol stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Locked Value" value={MOCK_STATS.totalLockedValue} />
        <StatCard label="Active Loans" value={MOCK_STATS.activeLoans} />
        <StatCard
          label="Your Collateral"
          value={deposit ? `$${deposit.usdValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}` : "—"}
          sub={deposit ? `${deposit.asset} · encrypted` : "No deposit yet"}
          accent={!!deposit}
        />
        <StatCard
          label="Active Loan"
          value={loan ? `${loan.loanAmount.toLocaleString()} USDC` : "—"}
          sub={loan ? `Borrowed ${new Date(loan.timestamp).toLocaleDateString()}` : "No loan yet"}
          accent={!!loan}
        />
      </div>

      {/* Health factor + dWallet row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-surface p-6">
          <div className="mb-4 text-xs font-mono uppercase tracking-widest text-muted">Your Health Factor</div>
          {loan ? (
            <>
              <HealthMeter value={loan.healthFactor} />
              <p className="mt-2 text-[10px] font-mono text-muted">encrypted on-chain — computed via FHE</p>
            </>
          ) : (
            <p className="font-mono text-2xl font-semibold text-text">—</p>
          )}
        </div>
        <div className="rounded-xl border border-border bg-surface p-6">
          <div className="mb-4 text-xs font-mono uppercase tracking-widest text-muted">dWallet Status</div>
          {deposit ? (
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-mono text-sm text-emerald-400">Active</span>
              <span className="font-mono text-xs text-muted ml-2">
                {deposit.dWalletId.slice(0, 6)}...{deposit.dWalletId.slice(-4)}
              </span>
            </div>
          ) : (
            <p className="font-mono text-2xl font-semibold text-text">—</p>
          )}
        </div>
      </div>

      {/* CTAs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {[
          { href: "/deposit", title: "Deposit Collateral", desc: "Lock BTC or ETH via Ika dWallet — encrypted on-chain" },
          { href: "/borrow", title: "Borrow USDC", desc: "Borrow against encrypted collateral — position stays private" },
          { href: "/liquidations", title: "Liquidations", desc: "Sealed-bid dark pool — bid on at-risk positions" },
        ].map(({ href, title, desc }) => (
          <Link key={href} href={href}
            className="group flex items-center justify-between rounded-xl border border-border bg-surface p-6 transition-colors hover:border-accent">
            <div>
              <p className="font-mono text-sm font-semibold text-text group-hover:text-accent">{title}</p>
              <p className="mt-1 text-xs text-text-dim">{desc}</p>
            </div>
            <ArrowRight size={18} className="text-muted group-hover:text-accent transition-colors" />
          </Link>
        ))}
      </div>
    </div>
  );
}
