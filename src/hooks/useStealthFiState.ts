"use client";
import { useEffect, useState } from "react";
import { storage, type DepositRecord, type LoanRecord } from "@/lib/storage";

interface StealthFiState {
  deposit: DepositRecord | null;
  loan: LoanRecord | null;
  hasDWallet: boolean;
  isLoading: boolean;
}

export function useStealthFiState(): StealthFiState {
  const [state, setState] = useState<StealthFiState>({
    deposit: null,
    loan: null,
    hasDWallet: false,
    isLoading: true,
  });

  function read() {
    const deposit = storage.getDeposit();
    const loan = storage.getLoan();
    setState({
      deposit,
      loan,
      hasDWallet: !!deposit?.dWalletId,
      isLoading: false,
    });
  }

  useEffect(() => {
    read();
    window.addEventListener("focus", read);
    return () => window.removeEventListener("focus", read);
  }, []);

  return state;
}
