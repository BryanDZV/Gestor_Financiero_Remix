// app/types/models.ts
export type TransactionType = 'income' | 'expense' | 'transfer' | string;

export interface TransactionRow {
  id?: string;
  concept?: string;
  amount: number;
  type: TransactionType;
  date?: string;
  wallet_id?: string;
  destination_wallet_id?: string;
}

export interface RawWalletRow {
  id: string;
  user_id: string;
  name: string;
  type: string;
  is_liability: boolean;
  initial_balance: number;
  currency?: string;
  target_amount?: number;
  share_divisor?: number;
  created_at?: string;
  transactions?: TransactionRow[];
}

export interface WalletViewModel {
  id: string;
  user_id: string;
  name: string;
  type: string;
  is_liability: boolean;
  initial_balance: number;
  currency?: string;
  target_amount?: number;
  share_divisor?: number;
  created_at?: string;
  current_balance: number;
}

export interface CurrencyOption {
  code: string;
  name: string;
}

export interface ExchangeRatesSnapshot {
  base: string;
  date: string;
  rates: Record<string, number>;
}

export interface CurrencyConverterState {
  fromCurrency: string;
  toCurrency: string;
  amount: number;
}

export interface CurrencyFavoriteRow {
  id: string;
  user_id: string;
  currency_code: string;
  created_at?: string;
}
