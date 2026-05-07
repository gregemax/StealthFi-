import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import NavBar from "@/components/NavBar";
import SolanaWalletProvider from "@/context/WalletProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "StealthFi — Confidential Cross-Chain Lending",
  description: "Privacy-preserving lending protocol powered by Ika dWallet and Encrypt FHE on Solana",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-bg font-sans text-primary antialiased">
        <SolanaWalletProvider>
          {/* Devnet banner */}
          <div
            className="flex items-center justify-center border-b border-border py-2 text-[11px] text-secondary"
            style={{ background: "linear-gradient(90deg, rgba(79,142,255,0.07), rgba(139,92,246,0.07))", fontFamily: "var(--font-jetbrains)" }}
          >
            ⚡ StealthFi is running on Solana Devnet · Ika testnet · Encrypt pre-alpha
          </div>
          <NavBar />
          <main className="mx-auto max-w-7xl px-6 py-12 animate-fade-in">
            {children}
          </main>
        </SolanaWalletProvider>
      </body>
    </html>
  );
}
