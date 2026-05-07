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
    <div className="hidden items-center gap-1 md:flex">
      {NAV_LINKS.map(({ href, label }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={`relative px-3 py-1.5 text-sm transition-colors duration-150 ${
              active ? "text-primary" : "text-secondary hover:text-primary"
            }`}
          >
            {label}
            {active && (
              <span className="absolute bottom-0 left-3 right-3 h-px bg-blue rounded-full" />
            )}
          </Link>
        );
      })}
    </div>
  );
}
