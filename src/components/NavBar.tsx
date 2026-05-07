import Link from "next/link";
import { Shield } from "lucide-react";
import WalletButton from "./WalletButton";
import LiveBadge from "./LiveBadge";
import NavLinks from "./NavLinks";
import MobileMenu from "./MobileMenu";

export default function NavBar() {
  return (
    <nav className="sticky top-0 z-40 border-b border-border bg-bg/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-dim border border-blue/20 group-hover:border-blue/40 transition-colors">
            <Shield size={15} className="text-blue" />
          </div>
          <span className="text-sm font-semibold tracking-tight text-primary">
            StealthFi
            <sup className="ml-0.5 text-[9px] font-mono text-cyan align-super">BETA</sup>
          </span>
        </Link>

        {/* Desktop nav */}
        <NavLinks />

        {/* Right side */}
        <div className="flex items-center gap-3">
          <LiveBadge />
          <WalletButton />
          <MobileMenu />
        </div>
      </div>
    </nav>
  );
}
