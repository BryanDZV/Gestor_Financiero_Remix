import { formatMoney } from "~/lib/utils";

interface TransactionAmountProps {
  amount: number;
  type: "income" | "expense" | "transfer" | string;
  currency?: string;
  className?: string;
}

export function TransactionAmount({ amount, type, currency = 'EUR', className = '' }: TransactionAmountProps) {
  const isIncome = type === 'income';
  const isTransfer = type === 'transfer';
  const isExpense = type === 'expense';

  const sign = isIncome ? '+' : '-'; 
  const colorClass = isExpense ? 'text-red-600' : isTransfer ? 'text-amber-600' : 'text-emerald-600';

  return (
    <span className={`tabular-nums font-semibold ${colorClass} ${className}`}>
      {sign}{formatMoney(amount, currency)}
    </span>
  );
}