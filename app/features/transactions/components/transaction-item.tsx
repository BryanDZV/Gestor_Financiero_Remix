import { Form, useSubmit } from "react-router";
import { useState } from "react";
import { Icon } from "@iconify/react";
import { formatDate } from "~/lib/utils";
import { Input } from "~/components/ui/input";
import { SelectNative } from "~/components/ui/select-native";
import { SelectionIndicator } from "~/components/ui/selection-indicator";
import { TransactionAmount } from "~/components/ui/transaction-amount";
import type { CycleHistoryItem } from "~/types";

interface TransactionItemProps {
  tx: NonNullable<CycleHistoryItem['transactions']>[0];
  isCycleClosed: boolean;
  categories: { id: string; name: string }[];
  isDeleteMode: boolean;
  isSelected: boolean;
  onToggle: () => void;
  currency?: string;
}

export function TransactionItem({ tx, isCycleClosed, categories, isDeleteMode, isSelected, onToggle, currency = 'EUR' }: TransactionItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const submit = useSubmit();

  if (isEditing) {
    return (
      <li className="border-b border-slate-100 bg-slate-50 p-3 last:border-0">
        <Form method="post" className="flex w-full flex-col flex-wrap items-start gap-3 sm:flex-row sm:items-center" onSubmit={(e) => {
          e.preventDefault();
          submit(e.currentTarget, { method: "post" });
          setIsEditing(false);
        }}>
          <input type="hidden" name="_intent" value="edit_transaction" />
          <input type="hidden" name="transaction_id" value={tx.id} />
          
          <Input type="text" name="concept" defaultValue={tx.concept} required className="bg-white px-3 py-2 sm:flex-1" placeholder="Concepto" />
          
          <SelectNative name="type" defaultValue={tx.type} className="bg-white px-3 py-2 sm:w-auto">
            <option value="expense">Gasto</option>
            <option value="income">Ingreso</option>
            <option value="transfer">Transferencia</option>
          </SelectNative>

          <SelectNative name="category_id" defaultValue={tx.category_id || ""} className="bg-white px-3 py-2 sm:w-auto">
            <option value="">Sin categoría</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </SelectNative>

          <Input type="number" name="amount" defaultValue={tx.amount} step="0.01" required className="bg-white px-3 py-2 tabular-nums sm:w-28" placeholder="Monto" />
          
          <Input type="date" name="date" defaultValue={tx.date ? tx.date.split('T')[0] : ''} required className="bg-white px-3 py-2 tabular-nums sm:w-36" />
          
          <div className="mt-2 flex w-full items-center justify-end gap-2 sm:mt-0 sm:w-auto">
            <button type="submit" className="rounded-md p-1.5 text-emerald-600 hover:bg-emerald-50" title="Guardar">
              <Icon icon="ph:check" className="w-4 h-4" />
            </button>
            <button type="button" onClick={() => setIsEditing(false)} className="rounded-md p-1.5 text-slate-400 hover:bg-slate-200" title="Cancelar">
              <Icon icon="ph:x" className="w-4 h-4" />
            </button>
          </div>
        </Form>
      </li>
    );
  }

  if (isDeleteMode) {
    return (
      <li 
        onClick={() => !isCycleClosed && onToggle()}
        className={`flex flex-col gap-3 border-b border-slate-100 p-4 transition-colors sm:flex-row sm:items-center sm:justify-between sm:gap-2 sm:p-4 last:border-0 ${isCycleClosed ? 'opacity-50' : 'cursor-pointer hover:bg-red-50'} ${isSelected ? 'bg-red-50' : 'bg-white'}`}
      >
        <div className="flex flex-col w-full sm:w-auto">
          <span className="text-sm font-medium text-slate-700">{tx.concept}</span>
          {tx.date && <span className="mt-1 flex items-center text-xs tabular-nums text-slate-500"><Icon icon="ph:calendar-blank" className="mr-1 size-3" />{formatDate(tx.date)}</span>}
          {tx.category_id && categories.find(c => c.id === tx.category_id) && (
            <span className="mt-1 flex items-center text-[10px] font-medium uppercase tracking-wider text-slate-400">
              <Icon icon="ph:tag" className="mr-1 size-3" />{categories.find(c => c.id === tx.category_id)?.name}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4">
          <TransactionAmount amount={tx.amount} type={tx.type} currency={currency} className="text-sm" />
          {!isCycleClosed && <SelectionIndicator isSelected={isSelected} className="size-5" iconClassName="size-3.5" />}
        </div>
      </li>
    );
  }

  return (
    <li className="flex flex-col gap-3 border-b border-slate-100 bg-white p-4 transition-colors hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between sm:gap-2 sm:p-4 last:border-0">
      <div className="flex flex-col w-full sm:w-auto">
        <span className="text-sm font-medium text-slate-700">{tx.concept}</span>
        {tx.date && (
          <span className="mt-1 flex items-center text-xs tabular-nums text-slate-500">
            <Icon icon="ph:calendar-blank" className="mr-1 size-3" />
            {formatDate(tx.date)}
          </span>
        )}
        {tx.category_id && categories.find(c => c.id === tx.category_id) && (
          <span className="mt-1 flex items-center text-[10px] font-medium uppercase tracking-wider text-slate-400">
            <Icon icon="ph:tag" className="mr-1 size-3" />
            {categories.find(c => c.id === tx.category_id)?.name}
          </span>
        )}
      </div>
      <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4">
        <TransactionAmount amount={tx.amount} type={tx.type} currency={currency} className="text-sm" />
        
        {!isCycleClosed && (
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setIsEditing(true)} className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-blue-50 hover:text-blue-600" title="Editar">
              <Icon icon="ph:pencil-simple" className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </li>
  );
}