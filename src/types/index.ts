export type Currency = 'NIM' | 'USDT';

export interface TabMember {
  address: string; // Nimiq address (e.g. NQ07 0000 0000 ...)
  name: string;
  avatarColor: string;
  joinedAt: string;
}

export interface Expense {
  id: string;
  tabId: string;
  title: string;
  amount: number; // Decimal (e.g. 150.5 NIM or 25.00 USDT)
  currency: Currency;
  category: 'food' | 'transport' | 'stay' | 'drinks' | 'groceries' | 'activities' | 'other';
  paidBy: string; // Nimiq address
  splitAmong: string[]; // Array of Nimiq addresses
  createdAt: string;
  notes?: string;
  receiptImage?: string;
}

export interface SettlementPayment {
  id: string;
  tabId: string;
  fromAddress: string;
  toAddress: string;
  fromName: string;
  toName: string;
  amount: number;
  currency: Currency;
  txHash?: string;
  settledAt: string;
  status: 'completed';
  note?: string;
}

export interface Tab {
  id: string; // Unique private ID (e.g. tab_8f1k9a...)
  code: string; // 6-character short code (e.g. 7K9MP2)
  name: string;
  description?: string;
  coverImage?: string; // High-resolution photo cover
  currency: Currency;
  createdAt: string;
  updatedAt: string;
  createdBy: string; // Creator address
  members: TabMember[];
  expenses: Expense[];
  settlements: SettlementPayment[];
}

export interface NetBalance {
  address: string;
  name: string;
  netUnits: number; // Integer (Luna for NIM, micro-units for USDT)
  netAmount: number; // Decimal formatted
  totalPaidUnits: number;
  totalPaidAmount: number;
  totalShareUnits: number;
  totalShareAmount: number;
}

export interface NettingTransfer {
  fromAddress: string;
  fromName: string;
  toAddress: string;
  toName: string;
  amount: number; // Decimal formatted
  units: number; // Integer (Luna or micro-units)
  currency: Currency;
}

export interface TabNettingResult {
  tabId: string;
  currency: Currency;
  netBalances: NetBalance[];
  minimalTransfers: NettingTransfer[];
  totalExpensesAmount: number;
  totalExpensesUnits: number;
  totalSettledAmount: number;
  isFullySettled: boolean;
  savingsCount: number; // Number of bilateral transactions eliminated
}

export interface WalletIdentity {
  address: string;
  formattedAddress: string;
  balanceNim: number;
  balanceUsdt: number;
  displayName: string;
  isConnected: boolean;
  isNimiqPay: boolean; // True if running natively inside Nimiq Pay
  network?: string;
  fiat?: string;
}
