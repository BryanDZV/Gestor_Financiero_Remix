import { Form, useSubmit, useMatches } from "react-router";
import { useState } from "react";
import { Icon } from "@iconify/react";
import { formatDate, cn } from "~/lib/utils";
import { Input } from "~/components/ui/input";
import { SelectNative } from "~/components/ui/select-native";
import { SelectionIndicator } from "~/components/ui/selection-indicator";
import { TransactionAmount } from "~/components/ui/transaction-amount";
import type { TransactionItemProps } from "~/types/components";

export function TransactionItem({ tx, isCycleClosed, categories, budgets = [], isDeleteMode, isSelected, onToggle, currency = 'EUR' }: TransactionItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSplitting, setIsSplitting] = useState(false);
  const [destWalletId, setDestWalletId] = useState("");
  const [amountToMove, setAmountToMove] = useState(tx.amount.toString());
  const submit = useSubmit();
  const matches = useMatches();
  const accountMatch = matches.find(m => m.id.includes("account-detail"));
  const otherWallets = (accountMatch?.data as any)?.otherWallets || [];

  const selectedDestWallet = otherWallets.find((w: any) => w.id === destWalletId);
  const destDivisor = selectedDestWallet?.share_divisor || 1;
  const finalAmount = (Number(amountToMove || 0) / destDivisor).toFixed(2);

  if (isEditing) {
    return (
      <li className="border-b border-slate-100 bg-slate-50 p-3 last:border-0">
        <Form method="post" className="flex w-full flex-col flex-wrap items-start gap-3 sm:flex-row sm:items-center" onSubmit={(e) => {
          e.preventDefault();
          submit(e.currentTarget, { method: "post" });
          setIsEditing(false);
          setIsSplitting(false);
          setDestWalletId("");
          setAmountToMove(tx.amount.toString());
        }}>
          <input type="hidden" name="_intent" value={isSplitting ? "split_transaction" : "edit_transaction"} />
          <input type="hidden" name="transaction_id" value={tx.id} />
          
          <Input type="text" name="concept" defaultValue={tx.concept} required className="bg-white px-3 py-2 sm:flex-1" placeholder="Concepto" />
          
          <SelectNative name="type" defaultValue={tx.type} className="bg-white px-3 py-2 sm:w-auto">
            <option value="expense">Gasto</option>
            <option value="income">Ingreso</option>
            <option value="transfer">Transferencia</option>
          </SelectNative>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <SelectNative name="category_id" defaultValue={tx.category_id || ""} className="bg-white px-3 py-2 sm:w-auto text-sm">
              <option value="">Sin etiqueta</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </SelectNative>
            <SelectNative name="budget_id" defaultValue={tx.budget_id || ""} className="bg-white px-3 py-2 sm:w-auto text-sm">
              <option value="">Sin límite</option>
              {budgets.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </SelectNative>
          </div>

          {!isSplitting ? (
            <Input type="number" name="amount" defaultValue={tx.amount} step="0.01" required className="bg-white px-3 py-2 tabular-nums sm:w-28" placeholder="Monto" />
          ) : (
            <input type="hidden" name="amount" value={tx.amount} />
          )}
          
          <Input type="date" name="date" defaultValue={tx.date ? tx.date.split('T')[0] : ''} required className="bg-white px-3 py-2 tabular-nums sm:w-36" />
          
          <div className="mt-2 flex w-full items-center justify-end gap-2 sm:mt-0 sm:w-auto">
            {!isSplitting && otherWallets.length > 0 && (
              <button type="button" onClick={() => setIsSplitting(true)} className="rounded-md p-1.5 text-indigo-600 hover:bg-indigo-50" title="Dividir / Mover a otra cuenta">
                <Icon icon="ph:split-horizontal" className="w-4 h-4" />
              </button>
            )}
            <button type="submit" className="rounded-md p-1.5 text-emerald-600 hover:bg-emerald-50" title={isSplitting ? "Confirmar división" : "Guardar"}>
              <Icon icon="ph:check" className="w-4 h-4" />
            </button>
            <button type="button" onClick={() => { setIsEditing(false); setIsSplitting(false); setDestWalletId(""); }} className="rounded-md p-1.5 text-slate-400 hover:bg-slate-200" title="Cancelar">
              <Icon icon="ph:x" className="w-4 h-4" />
            </button>
          </div>

          {isSplitting && (
            <div className="mt-2 flex w-full flex-col gap-3 rounded-lg border border-indigo-100 bg-indigo-50/50 p-3 sm:flex-row sm:items-end animate-in fade-in">
              <div className="flex-1 space-y-1">
                <label className="text-xs font-medium text-indigo-700">Mover a la cuenta:</label>
                <SelectNative name="destination_wallet_id" value={destWalletId} onChange={(e) => setDestWalletId(e.target.value)} required className="bg-white">
                  <option value="">Selecciona cuenta destino...</option>
                  {otherWallets.map((w: any) => <option key={w.id} value={w.id}>{w.name} {w.share_divisor > 1 ? `(÷${w.share_divisor})` : ''}</option>)}
                </SelectNative>
              </div>
              <div className="w-full sm:w-40 space-y-1">
                <label className="text-xs font-medium text-indigo-700">Monto a mover:</label>
                <Input type="number" name="amount_to_move" value={amountToMove} onChange={(e) => setAmountToMove(e.target.value)} step="0.01" max={tx.amount} min={0.01} required className="bg-white tabular-nums" />
                {destDivisor > 1 && (
                  <p className="text-[10px] text-indigo-500 font-medium leading-tight pt-1">Se registrarán {finalAmount} {currency}</p>
                )}
              </div>
            </div>
          )}
        </Form>
      </li>
    );
  }

  if (isDeleteMode) {
    return (
      <li 
        onClick={() => !isCycleClosed && onToggle()}
        className={cn(
          "flex flex-col gap-3 border-b border-slate-100 p-4 transition-colors sm:flex-row sm:items-center sm:justify-between sm:gap-2 sm:p-4 last:border-0",
          isCycleClosed ? "opacity-50" : "cursor-pointer hover:bg-red-50",
          isSelected ? "bg-red-50" : "bg-white"
        )}
      >
        <div className="flex flex-col w-full sm:w-auto">
          <span className="text-sm font-medium text-slate-700">{tx.concept}</span>
          {tx.date && <span className="mt-1 flex items-center text-xs tabular-nums text-slate-500"><Icon icon="ph:calendar-blank" className="mr-1 size-3" />{formatDate(tx.date)}</span>}
          <div className="flex flex-wrap items-center gap-2 mt-1.5">
            {tx.category_id && categories.find(c => c.id === tx.category_id) && (
              <span className="flex w-max items-center rounded-md bg-slate-100 px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-slate-500">
                <Icon icon={categories.find(c => c.id === tx.category_id)?.icon || "ph:tag"} className="mr-1.5 size-3.5" />{categories.find(c => c.id === tx.category_id)?.name}
              </span>
            )}
            {tx.budget_id && budgets.find(b => b.id === tx.budget_id) && (
              <span className="flex w-max items-center rounded-md bg-indigo-50 px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-indigo-600">
                <Icon icon="ph:target-duotone" className="mr-1.5 size-3.5" />{budgets.find(b => b.id === tx.budget_id)?.name}
              </span>
            )}
          </div>
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
        <div className="flex flex-wrap items-center gap-2 mt-1.5">
          {!isCycleClosed ? (
            <Form method="post" className="relative inline-flex w-max items-center text-[10px] font-medium uppercase tracking-wider text-slate-500 transition-colors hover:text-blue-600" onChange={(e) => submit(e.currentTarget, { method: "post" })}>
              <input type="hidden" name="_intent" value="edit_transaction" />
              <input type="hidden" name="transaction_id" value={tx.id} />
              <input type="hidden" name="concept" value={tx.concept} />
              <input type="hidden" name="type" value={tx.type} />
              <input type="hidden" name="amount" value={tx.amount} />
              <input type="hidden" name="date" value={tx.date ? tx.date.split('T')[0] : ''} />
              
              <div className="flex items-center cursor-pointer rounded-md bg-slate-100 px-2 py-1 transition-colors hover:bg-blue-50">
                <Icon icon={tx.category_id ? categories.find(c => c.id === tx.category_id)?.icon || "ph:tag" : "ph:tag-dashed"} className="mr-1.5 size-3.5" />
                <span>{tx.category_id ? categories.find(c => c.id === tx.category_id)?.name : "Asignar etiqueta"}</span>
              </div>
              
              <select name="category_id" defaultValue={tx.category_id || ""} className="absolute inset-0 w-full cursor-pointer opacity-0">
                <option value="">Sin etiqueta</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </Form>
          ) : (
            tx.category_id && categories.find(c => c.id === tx.category_id) && (
              <span className="flex w-max items-center rounded-md bg-slate-100 px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-slate-500">
                <Icon icon={categories.find(c => c.id === tx.category_id)?.icon || "ph:tag"} className="mr-1.5 size-3.5" />
                {categories.find(c => c.id === tx.category_id)?.name}
              </span>
            )
          )}

          {tx.budget_id && budgets.find(b => b.id === tx.budget_id) && (
            <span className="flex w-max items-center rounded-md bg-indigo-50 px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-indigo-600">
              <Icon icon="ph:target-duotone" className="mr-1.5 size-3.5" />
              {budgets.find(b => b.id === tx.budget_id)?.name}
            </span>
          )}
        </div>
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