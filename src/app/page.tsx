import Link from "next/link";
import { TrendingUp, Activity, ArrowRight } from "lucide-react";
import EncryptedValue from "@/components/EncryptedValue";
import HealthMeter from "@/components/HealthMeter";
import { MOCK_STATS } from "@/lib/mockData";

function StatCard({
  label,
  value,
  icon: Icon,
  encrypted,
}: {
  label: string;
  value?: string;
  icon: React.ElementType;
  encrypted?: boolean;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface p-6">
      <div className="mb-3 flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-muted">
        <Icon size={12} />
        {label}
      </div>
      {encrypted ? (
        <EncryptedValue className="text-xl" />
      ) : (
        <p className="font-mono text-2xl font-semibold text-text">{value}</p>
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div className="space-y-10">
      {/* Hero */}
      <div>
        <h1 className="mb-1 font-mono text-3xl font-bold tracking-tight text-text">
          Protocol Overview
        </h1>
        <p className="text-sm text-text-dim">
          Confidential cross-chain lending — powered by Ika dWallet &amp; Encrypt FHE
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Locked Value" value={MOCK_STATS.totalLockedValue} icon={TrendingUp} />
        <StatCard label="Active Loans" value={MOCK_STATS.activeLoans} icon={Activity} />
        <StatCard label="Your Collateral" icon={TrendingUp} encrypted />
        <div className="rounded-xl border border-border bg-surface p-6">
          <div className="mb-4 text-xs font-mono uppercase tracking-widest text-muted">
            Your Health Factor
          </div>
          <HealthMeter value={MOCK_STATS.yourHealthFactor} />
        </div>
      </div>

      {/* CTAs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Link
          href="/deposit"
          className="group flex items-center justify-between rounded-xl border border-border bg-surface p-6 transition-colors hover:border-accent"
        >
          <div>
            <p className="font-mono text-sm font-semibold text-text group-hover:text-accent">
              Deposit Collateral
            </p>
            <p className="mt-1 text-xs text-text-dim">
              Lock BTC or ETH via Ika dWallet — encrypted on-chain
            </p>
          </div>
          <ArrowRight size={18} className="text-muted group-hover:text-accent transition-colors" />
        </Link>

        <Link
          href="/borrow"
          className="group flex items-center justify-between rounded-xl border border-border bg-surface p-6 transition-colors hover:border-accent"
        >
          <div>
            <p className="font-mono text-sm font-semibold text-text group-hover:text-accent">
              Borrow USDC
            </p>
            <p className="mt-1 text-xs text-text-dim">
              Borrow against encrypted collateral — position stays private
            </p>
          </div>
          <ArrowRight size={18} className="text-muted group-hover:text-accent transition-colors" />
        </Link>
      </div>
    </div>
  );
}
