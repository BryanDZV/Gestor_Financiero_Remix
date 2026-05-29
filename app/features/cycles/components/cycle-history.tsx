import { Form, useSubmit } from "react-router";
import { useState, useMemo } from "react";
import { Icon } from "@iconify/react";
import { MultiSelectActions } from "~/components/ui/multi-select-actions";
import { TransactionItem } from "~/features/transactions/components/transaction-item";
import type { CycleHistoryItem } from "~/types";

export function CycleHistory({ cycles, categories = [], currency = 'EUR' }: { cycles: CycleHistoryItem[], categories?: {id: string, name: string}[], currency?: string }) {
  const submit = useSubmit();
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [selectedTxs, setSelectedTxs] = useState<Set<string>>(new Set());
  const [cycleToDelete, setCycleToDelete] = useState<string | null>(null);

  // Memoizamos las transacciones válidas a borrar para no recalcular en cada render
  const validTxIds = useMemo(() => {
    return cycles.filter(c => !c.is_closed).flatMap(c => c.transactions || []).map(t => t.id);
  }, [cycles]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="flex items-center text-lg font-semibold tracking-tight text-slate-900">
          <Icon icon="ph:receipt" className="mr-2 size-5 text-slate-500" /> Historial de movimientos
        </h2>
        <div className="flex flex-wrap items-center gap-2">
          <MultiSelectActions
            isDeleteMode={isDeleteMode}
            selectedCount={selectedTxs.size}
            totalCount={validTxIds.length}
            onToggleMode={setIsDeleteMode}
            onSelectAll={() => setSelectedTxs(new Set(validTxIds))}
            onClearSelection={() => setSelectedTxs(new Set())}
            onDelete={() => {
              const fd = new FormData();
              fd.append("_intent", "delete_transactions");
              selectedTxs.forEach(id => fd.append("transaction_ids", id));
              submit(fd, { method: "post" });
              setIsDeleteMode(false);
              setSelectedTxs(new Set());
            }}
            itemName="movimiento(s)"
          />
        </div>
      </div>
      
      <div className="space-y-8">
        {cycles.map((cycle) => (
          <div key={cycle.id} className="relative">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="flex items-center text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                {cycle.name} {cycle.is_closed && <Icon icon="ph:lock" className="ml-2 size-3 text-slate-400" />}
              </h3>
              <div className="flex items-center gap-1">
                {cycle.is_closed ? (
                  <Form method="post">
                    <input type="hidden" name="_intent" value="open_cycle" />
                    <input type="hidden" name="cycle_id" value={cycle.id} />
                    <button type="submit" className="flex items-center rounded-md px-2 py-1.5 text-xs font-medium text-blue-600 transition-colors hover:bg-blue-50 hover:text-blue-700" title="Reabrir ciclo">
                      <Icon icon="ph:lock-open" className="mr-1 size-3.5" /> Reabrir
                    </button>
                  </Form>
                ) : (
                  <Form method="post">
                    <input type="hidden" name="_intent" value="close_cycle" />
                    <input type="hidden" name="cycle_id" value={cycle.id} />
                    <button type="submit" className="flex items-center rounded-md px-2 py-1.5 text-xs font-medium text-amber-600 transition-colors hover:bg-amber-50 hover:text-amber-700" title="Cerrar ciclo">
                      <Icon icon="ph:lock" className="mr-1 size-3.5" /> Cerrar ciclo
                    </button>
                  </Form>
                )}
                {cycleToDelete === cycle.id ? (
                  <div className="flex items-center gap-1 animate-in fade-in zoom-in duration-200">
                    <Form method="post" onSubmit={() => setCycleToDelete(null)}>
                      <input type="hidden" name="_intent" value="delete_cycle" />
                      <input type="hidden" name="cycle_id" value={cycle.id} />
                      <button type="submit" className="flex items-center rounded-md px-2 py-1 text-xs font-medium text-white bg-red-600 transition-colors hover:bg-red-700 shadow-sm" title="Confirmar">
                        Confirmar
                      </button>
                    </Form>
                    <button type="button" onClick={() => setCycleToDelete(null)} className="flex items-center rounded-md px-2 py-1 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100">
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <button type="button" onClick={() => setCycleToDelete(cycle.id)} className="flex items-center rounded-md px-2 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 hover:text-red-700" title="Eliminar ciclo">
                    <Icon icon="ph:trash" className="size-4" />
                  </button>
                )}
              </div>
            </div>
            
            {cycle.transactions?.length === 0 ? (
              <p className="text-sm italic text-slate-400">Sin movimientos en este ciclo.</p>
              ) : (
              <ul className="overflow-hidden rounded-2xl border border-slate-100 divide-y divide-slate-100">
                {(cycle.transactions ?? []).map((tx) => (
                  <TransactionItem 
                    key={tx.id} 
                    tx={tx} 
                    isCycleClosed={cycle.is_closed} 
                    categories={categories}
                    isDeleteMode={isDeleteMode}
                    isSelected={selectedTxs.has(tx.id)}
                    onToggle={() => {
                      const newSet = new Set(selectedTxs);
                      if (newSet.has(tx.id)) newSet.delete(tx.id);
                      else newSet.add(tx.id);
                      setSelectedTxs(newSet);
                    }}
                    currency={currency}
                  />
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}