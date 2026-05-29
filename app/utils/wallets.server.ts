// app/utils/wallets.server.ts
import type { SupabaseClient } from '@supabase/supabase-js';
import type { RawWalletRow, WalletViewModel, TransactionRow } from '~/types/models';

export function mapRawWallets(rawWallets: RawWalletRow[] | null | undefined): WalletViewModel[] {
  if (!rawWallets) return [];

  return rawWallets.map((w) => {
    const txs: TransactionRow[] = w.transactions || [];

    const netChange = txs.reduce((acc: number, tx: TransactionRow) => {
      const isIncome = tx.type === 'income';
      const amount = Number(tx.amount || 0);
      if (w.is_liability) {
        return isIncome ? acc - amount : acc + amount;
      }
      return isIncome ? acc + amount : acc - amount;
    }, 0);

    const { transactions, ...walletData } = w;
    const current_balance = Number(w.initial_balance || 0) + netChange;

    return {
      ...walletData,
      current_balance,
    } as WalletViewModel;
  });
}

export async function fetchWalletsForUser(supabase: SupabaseClient, userId: string): Promise<WalletViewModel[]> {
  const { data } = await supabase
    .from('wallets')
    .select("*, transactions!transactions_wallet_id_fkey(amount, type)")
    .eq('user_id', userId)
    .order('created_at', { ascending: true }) as any;

  return mapRawWallets(data || []);
}
