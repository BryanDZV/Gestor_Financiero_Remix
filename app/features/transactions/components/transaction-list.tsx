import { formatDate } from "~/lib/utils";
import { TransactionAmount } from "~/components/ui/transaction-amount";

interface Transaction {
  id: string;
  concept: string;
  amount: number;
  type: "income" | "expense" | "transfer";
  date: string;
}

export function TransactionList({ transactions }: { transactions: Transaction[] }) {
  if (transactions.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="text-slate-500">No hay transacciones registradas aún.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            <th className="p-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Fecha</th>
            <th className="p-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Concepto</th>
            <th className="p-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 text-right">Monto</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {transactions.map((tx) => (
            <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
              <td className="p-4 text-sm tabular-nums text-slate-600">{formatDate(tx.date)}</td>
              <td className="p-4 text-sm font-medium text-slate-900">{tx.concept}</td>
              <td className="p-4 text-right">
                <TransactionAmount amount={tx.amount} type={tx.type} className="text-sm" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}