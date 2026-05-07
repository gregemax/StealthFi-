export interface DepositRecord {
  asset: string;
  amount: number;
  usdValue: number;
  dWalletId: string;
  encryptedAmount: string;
  timestamp: number;
}

export interface LoanRecord {
  loanAmount: number;
  collateralUSD: number;
  healthFactor: number;
  asset: string;
  timestamp: number;
}

function get<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function set<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

const DEPOSIT_KEY = "stealthfi:deposit";
const LOAN_KEY = "stealthfi:loan";

export const storage = {
  getDeposit: () => get<DepositRecord>(DEPOSIT_KEY),
  setDeposit: (v: DepositRecord) => set(DEPOSIT_KEY, v),
  getLoan: () => get<LoanRecord>(LOAN_KEY),
  setLoan: (v: LoanRecord) => set(LOAN_KEY, v),
};
