"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { href: "/", label: "Dashboard" },
  { href: "/deposit", label: "Deposit" },
  { href: "/borrow", label: "Borrow" },
  { href: "/liquidations", label: "Liquidations" },
];

export default function NavLinks() {
  const pathname = usePathname();
  return (
    <div className="hidden items-center gap-6 md:flex">
      {NAV_LINKS.map(({ href, label }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={`text-xs font-mono uppercase tracking-widest transition-colors ${
              active ? "text-accent" : "text-text-dim hover:text-accent"
            }`}
          >
            {label}
          </Link>
        );
      })}
    </div>
  );
}
