"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const NAV_LINKS = [
  { href: "/", label: "Dashboard" },
  { href: "/deposit", label: "Deposit" },
  { href: "/borrow", label: "Borrow" },
  { href: "/liquidations", label: "Liquidations" },
];

export default function MobileMenu() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="md:hidden">
      <button onClick={() => setOpen(true)} className="p-1.5 text-secondary hover:text-primary transition-colors">
        <Menu size={20} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-bg flex flex-col"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <span className="text-sm font-semibold text-primary">StealthFi</span>
              <button onClick={() => setOpen(false)} className="p-1.5 text-secondary hover:text-primary">
                <X size={20} />
              </button>
            </div>
            <nav className="flex flex-col p-6 gap-1">
              {NAV_LINKS.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className={`px-4 py-3 rounded-xl text-base font-medium transition-colors ${
                    pathname === href
                      ? "bg-blue-dim text-blue border border-blue/20"
                      : "text-secondary hover:text-primary hover:bg-elevated"
                  }`}
                >
                  {label}
                </Link>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
