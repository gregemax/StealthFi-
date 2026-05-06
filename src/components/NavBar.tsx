import Link from "next/link";
import { Lock } from "lucide-react";
import WalletButton from "./WalletButton";
import LiveBadge from "./LiveBadge";

const NAV_LINKS = [
  { href: "/", label: "Dashboard" },
  { href: "/deposit", label: "Deposit" },
  { href: "/borrow", label: "Borrow" },
  { href: "/liquidations", label: "Liquidations" },
];

export default function NavBar() {
  return (
    <nav className="sticky top-0 z-40 border-b border-border bg-bg/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
        <Link href="/" className="flex items-center gap-2 text-text hover:text-accent transition-colors">
          <Lock size={16} className="text-accent" />
          <span className="font-mono text-sm font-semibold tracking-wider">STEALTHFI</span>
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-xs font-mono text-text-dim uppercase tracking-widest hover:text-accent transition-colors"
            >
              {label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <span className="rounded border border-accent/30 bg-accent-dim px-2 py-0.5 text-[10px] font-mono uppercase tracking-widest text-accent">
            Devnet
          </span>
          <LiveBadge />
          <WalletButton />
        </div>
      </div>
    </nav>
  );
}
