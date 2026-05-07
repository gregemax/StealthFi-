import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import NavBar from "@/components/NavBar";
import SolanaWalletProvider from "@/context/WalletProvider";

export const metadata: Metadata = {
  title: "StealthFi — Confidential Cross-Chain Lending",
  description: "Privacy-preserving lending protocol powered by Ika dWallet and Encrypt FHE on Solana",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="bg-bg font-sans text-text antialiased">
        <SolanaWalletProvider>
          <div className="flex items-center justify-center gap-2 bg-accent-dim border-b border-accent/20 py-1.5 text-[11px] font-mono text-accent">
            <span className="animate-pulse">⚡</span>
            <span>Running on Solana Devnet — Ika + Encrypt pre-alpha</span>
          </div>
          <NavBar />
          <main className="mx-auto max-w-7xl px-6 py-10">{children}</main>
        </SolanaWalletProvider>
      </body>
    </html>
  );
}
