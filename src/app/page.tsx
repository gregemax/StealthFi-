"use client";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useStealthFiState } from "@/hooks/useStealthFiState";
import HealthMeter from "@/components/HealthMeter";

function fmt(n: number) {
  return n.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

export default function DashboardPage() {
  const { deposit, loan, hasDWallet, isLoading } = useStealthFiState();

  const hfColor = !loan ? "text-text"
    : loan.healthFactor > 2.0 ? "text-accent"
    : loan.healthFactor >= 1.5 ? "text-amber-400"
    : "text-red-400";

  return (
    <div className="space-y-10">
      <div>
        <h1 className="mb-1 font-mono text-3xl font-bold tracking-tight text-text">Protocol Overview</h1>
        <p className="text-sm text-text-dim">Confidential cross-chain lending — powered by Ika dWallet &amp; Encrypt FHE</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Protocol stat */}
        <div className="rounded-xl border border-border bg-surface p-6">
          <p className="mb-3 text-xs font-mono uppercase tracking-widest text-muted">Total Value Locked</p>
          <p className="font-mono text-2xl font-semibold text-text">$2.4B</p>
        </div>

        {/* Your Collateral */}
        <div className="rounded-xl border border-border bg-surface p-6">
          <p className="mb-3 text-xs font-mono uppercase tracking-widest text-muted">Your Collateral</p>
          {isLoading ? (
            <p className="font-mono text-2xl text-muted">…</p>
          ) : deposit ? (
            <div>
              <p className="font-mono text-2xl font-semibold text-accent">${fmt(deposit.usdValue)}</p>
              <span className="mt-1 inline-block rounded border border-accent/30 bg-accent-dim px-1.5 py-0.5 text-[10px] font-mono text-accent">{deposit.asset}</span>
            </div>
          ) : (
            <p className="font-mono text-2xl font-semibold text-text">—</p>
          )}
        </div>

        {/* Your Health Factor */}
        <div className="rounded-xl border border-border bg-surface p-6">
          <p className="mb-3 text-xs font-mono uppercase tracking-widest text-muted">Your Health Factor</p>
          {isLoading ? (
            <p className="font-mono text-2xl text-muted">…</p>
          ) : loan ? (
            <p className={`font-mono text-2xl font-semibold ${hfColor}`}>{loan.healthFactor.toFixed(2)}</p>
          ) : (
            <p className="font-mono text-2xl font-semibold text-text">—</p>
          )}
        </div>

        {/* Active Loan */}
        <div className="rounded-xl border border-border bg-surface p-6">
          <p className="mb-3 text-xs font-mono uppercase tracking-widest text-muted">Active Loan</p>
          {isLoading ? (
            <p className="font-mono text-2xl text-muted">…</p>
          ) : loan ? (
            <p className="font-mono text-2xl font-semibold text-accent">{loan.loanAmount.toLocaleString()} <span className="text-base text-text-dim">USDC</span></p>
          ) : (
            <p className="font-mono text-2xl font-semibold text-text">—</p>
          )}
        </div>
      </div>

      {/* dWallet status */}
      <div className="rounded-xl border border-border bg-surface p-5">
        <p className="mb-3 text-xs font-mono uppercase tracking-widest text-muted">dWallet Status</p>
        {isLoading ? (
          <p className="font-mono text-sm text-muted">…</p>
        ) : hasDWallet && deposit ? (
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono text-sm text-emerald-400">Active</span>
            <span className="font-mono text-xs text-muted">— {deposit.dWalletId.slice(0, 6)}...{deposit.dWalletId.slice(-4)}</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-muted" />
            <span className="font-mono text-sm text-muted">Not created</span>
          </div>
        )}
      </div>

      {/* Portfolio section — only if data exists */}
      {(deposit || loan) && (
        <div className="rounded-xl border border-accent/20 bg-surface p-6 space-y-4">
          <p className="text-xs font-mono uppercase tracking-widest text-accent">Your Portfolio</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <p className="text-[10px] font-mono text-muted mb-1">Collateral</p>
              <p className="font-mono text-sm text-text">{deposit ? `$${fmt(deposit.usdValue)} ${deposit.asset}` : "—"}</p>
            </div>
            <div>
              <p className="text-[10px] font-mono text-muted mb-1">Loan</p>
              <p className="font-mono text-sm text-text">{loan ? `${loan.loanAmount.toLocaleString()} USDC` : "—"}</p>
            </div>
            <div>
              <p className="text-[10px] font-mono text-muted mb-1">Health Factor</p>
              {loan ? <HealthMeter value={loan.healthFactor} /> : <p className="font-mono text-sm text-text">—</p>}
            </div>
          </div>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link href="/borrow" className="flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 font-mono text-xs text-text-dim hover:border-accent hover:text-accent transition-colors">
              Manage Position <ArrowRight size={12} />
            </Link>
            <Link href="/liquidations" className="flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 font-mono text-xs text-text-dim hover:border-accent hover:text-accent transition-colors">
              View Liquidation Risk <ArrowRight size={12} />
            </Link>
          </div>
        </div>
      )}

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
