import { formatDate } from "~/lib/utils";
import { TransactionAmount } from "~/components/ui/transaction-amount";
import type { TransactionListProps } from "~/types/components";

export function TransactionList({ transactions }: TransactionListProps) {
  if (transactions.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card text-card-foreground p-8 text-center shadow-sm">
        <p className="text-muted-foreground">No hay transacciones registradas aún.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            <th className="p-4 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Fecha</th>
            <th className="p-4 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Concepto</th>
            <th className="p-4 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground text-right">Monto</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {transactions.map((tx) => (
            <tr key={tx.id} className="hover:bg-muted/50 transition-colors">
              <td className="p-4 text-sm tabular-nums text-muted-foreground">{formatDate(tx.date)}</td>
              <td className="p-4 text-sm font-medium text-foreground">{tx.concept}</td>
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