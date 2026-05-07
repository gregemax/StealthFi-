"use client";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { useStealthFiState } from "@/hooks/useStealthFiState";
import HealthMeter from "@/components/HealthMeter";

function fmt(n: number) {
  return n.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

function StatCard({ label, value, sub, accent, loading }: {
  label: string; value: string; sub?: string; accent?: boolean; loading?: boolean;
}) {
  return (
    <div className="card card-hover p-6 flex flex-col gap-3">
      <p className="label">{label}</p>
      {loading ? (
        <div className="skeleton h-8 w-24 rounded" />
      ) : (
        <p className={`font-semibold text-3xl tracking-tight ${accent ? "text-blue" : "text-primary"}`}>{value}</p>
      )}
      {sub && !loading && <p className="text-xs text-tertiary">{sub}</p>}
    </div>
  );
}

export default function DashboardPage() {
  const { deposit, loan, hasDWallet, isLoading } = useStealthFiState();

  const hfColor = !loan ? "text-primary"
    : loan.healthFactor > 2.0 ? "text-green"
    : loan.healthFactor >= 1.5 ? "text-yellow"
    : "text-red";

  return (
    <div className="space-y-16">
      {/* Hero */}
      <div className="pt-8 space-y-6">
        <div className="space-y-3">
          <h1 className="text-5xl sm:text-6xl font-bold tracking-tighter text-primary leading-[1.05]">
            Institutional DeFi,<br />Finally Private.
          </h1>
          <p className="text-lg text-secondary max-w-xl">
            Cross-chain collateral via Ika. FHE-encrypted positions via Encrypt. Zero exposure.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/deposit" className="btn-primary h-12 px-6">
            Deposit Collateral
          </Link>
          <Link href="/liquidations" className="btn-secondary h-12 px-6">
            Learn How It Works
          </Link>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Value Locked" value="$2.4B" sub="Across all positions" />
        <StatCard
          label="Your Collateral"
          value={deposit ? `$${fmt(deposit.usdValue)}` : "—"}
          sub={deposit ? `${deposit.asset} · encrypted` : "No deposit yet"}
          accent={!!deposit}
          loading={isLoading}
        />
        <div className="card card-hover p-6 flex flex-col gap-3">
          <p className="label">Your Health Factor</p>
          {isLoading ? (
            <div className="skeleton h-8 w-16 rounded" />
          ) : loan ? (
            <p className={`font-semibold text-3xl tracking-tight ${hfColor}`}>{loan.healthFactor.toFixed(2)}</p>
          ) : (
            <p className="font-semibold text-3xl tracking-tight text-primary">—</p>
          )}
        </div>
        <StatCard
          label="Active Loan"
          value={loan ? `${loan.loanAmount.toLocaleString()}` : "—"}
          sub={loan ? "USDC borrowed" : "No loan yet"}
          accent={!!loan}
          loading={isLoading}
        />
      </div>

      {/* dWallet + Portfolio */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* dWallet status */}
        <div className="card p-6 space-y-3">
          <p className="label">dWallet Status</p>
          {isLoading ? (
            <div className="skeleton h-5 w-32 rounded" />
          ) : hasDWallet && deposit ? (
            <div className="flex items-center gap-2.5">
              <span className="h-2 w-2 rounded-full bg-green animate-pulse" />
              <span className="text-sm font-medium text-green">Active</span>
              <span className="font-mono text-xs text-tertiary">
                {deposit.dWalletId.slice(0, 6)}...{deposit.dWalletId.slice(-4)}
              </span>
              <a href={`https://suiscan.xyz/testnet/object/${deposit.dWalletId}`}
                target="_blank" rel="noopener noreferrer"
                className="text-tertiary hover:text-blue transition-colors">
                <ArrowUpRight size={12} />
              </a>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <span className="h-2 w-2 rounded-full bg-tertiary" />
              <span className="text-sm text-tertiary">Not created</span>
            </div>
          )}
        </div>

        {/* Portfolio summary */}
        {(deposit || loan) ? (
          <div className="card p-6 space-y-4" style={{ borderLeft: "3px solid #4f8eff" }}>
            <p className="label text-blue">Your Portfolio</p>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-2xs text-tertiary mb-1">Collateral</p>
                <p className="text-sm font-medium text-primary">{deposit ? `$${fmt(deposit.usdValue)}` : "—"}</p>
                {deposit && <p className="text-2xs text-tertiary">{deposit.asset}</p>}
              </div>
              <div>
                <p className="text-2xs text-tertiary mb-1">Loan</p>
                <p className="text-sm font-medium text-primary">{loan ? `${loan.loanAmount.toLocaleString()} USDC` : "—"}</p>
              </div>
              <div>
                <p className="text-2xs text-tertiary mb-1">Health</p>
                {loan ? (
                  <p className={`text-sm font-semibold ${hfColor}`}>{loan.healthFactor.toFixed(2)}</p>
                ) : <p className="text-sm text-primary">—</p>}
              </div>
            </div>
            {loan && <HealthMeter value={loan.healthFactor} />}
            <div className="flex gap-2 pt-1">
              <Link href="/borrow" className="btn-ghost text-xs px-3 py-1.5 border border-border rounded-lg">
                Manage Position <ArrowRight size={11} className="inline ml-1" />
              </Link>
              <Link href="/liquidations" className="btn-ghost text-xs px-3 py-1.5 border border-border rounded-lg">
                Liquidation Risk <ArrowRight size={11} className="inline ml-1" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="card p-6 flex flex-col items-start justify-center gap-3">
            <p className="label">Your Portfolio</p>
            <p className="text-sm text-tertiary">Connect wallet and deposit to see your portfolio.</p>
            <Link href="/deposit" className="btn-primary h-9 px-4 text-xs">Start Depositing</Link>
          </div>
        )}
      </div>

      {/* CTA cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { href: "/deposit", title: "Deposit Collateral", desc: "Lock BTC or ETH via Ika dWallet — encrypted on-chain" },
          { href: "/borrow", title: "Borrow USDC", desc: "Borrow against encrypted collateral — position stays private" },
          { href: "/liquidations", title: "Dark Pool Auctions", desc: "Sealed-bid liquidations — no MEV, no front-running" },
        ].map(({ href, title, desc }) => (
          <Link key={href} href={href}
            className="card card-hover p-6 flex flex-col gap-2 group">
            <p className="text-sm font-semibold text-primary group-hover:text-blue transition-colors">{title}</p>
            <p className="text-xs text-tertiary leading-relaxed">{desc}</p>
            <ArrowRight size={14} className="text-tertiary group-hover:text-blue transition-colors mt-auto" />
          </Link>
        ))}
      </div>
    </div>
  );
}
