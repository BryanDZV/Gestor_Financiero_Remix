import { Form, useSubmit } from "react-router";
import { useState, useMemo } from "react";
import { Icon } from "@iconify/react";
import { MultiSelectActions } from "~/components/ui/multi-select-actions";
import { TransactionItem } from "~/features/transactions/components/transaction-item";
import { SelectionIndicator } from "~/components/ui/selection-indicator";
import { Button } from "~/components/ui/button";
import { SegmentedControl } from "~/components/ui/segmented-control";
import type { CycleHistoryProps } from "~/types";

export function CycleHistory({ cycles, categories = [], budgets = [], currency = 'EUR' }: CycleHistoryProps) {
  const submit = useSubmit();
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [selectedTxs, setSelectedTxs] = useState<Set<string>>(new Set());
  const [isCycleDeleteMode, setIsCycleDeleteMode] = useState(false);
  const [selectedCycles, setSelectedCycles] = useState<Set<string>>(new Set());
  const [cycleToDelete, setCycleToDelete] = useState<string | null>(null);
  const [cycleSortOrder, setCycleSortOrder] = useState<"desc" | "asc">("desc");
  const [txSortOrder, setTxSortOrder] = useState<"desc" | "asc">("desc");
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [visibleCounts, setVisibleCounts] = useState<Record<string, number>>({});
  const DEFAULT_LIMIT = 20;

  // Memoizamos las transacciones válidas a borrar para no recalcular en cada render
  const validTxIds = useMemo(() => {
    return cycles.filter(c => !c.is_closed).flatMap(c => c.transactions || []).map(t => t.id);
  }, [cycles]);

  // SRP y SoC: Lógica de ordenamiento matemático de meses separada del render
  const sortedCycles = useMemo(() => {
    return [...cycles].sort((a, b) => {
      const timeA = new Date(a.start_date || 0).getTime();
      const timeB = new Date(b.start_date || 0).getTime();
      return cycleSortOrder === "desc" ? timeB - timeA : timeA - timeB;
    });
  }, [cycles, cycleSortOrder]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="flex items-center text-lg font-semibold tracking-tight text-slate-900">
          <Icon icon="ph:receipt" className="mr-2 size-5 text-slate-500" /> Historial de movimientos
        </h2>
        <div className="flex items-center justify-end relative">
          {isCycleDeleteMode ? (
              <MultiSelectActions
                isDeleteMode={isCycleDeleteMode}
                selectedCount={selectedCycles.size}
                totalCount={cycles.length}
                onToggleMode={setIsCycleDeleteMode}
                onSelectAll={() => setSelectedCycles(new Set(cycles.map(c => c.id)))}
                onClearSelection={() => setSelectedCycles(new Set())}
                onDelete={() => {
                  const fd = new FormData();
                  fd.append("_intent", "delete_cycles");
                  selectedCycles.forEach(id => fd.append("cycle_ids", id));
                  submit(fd, { method: "post" });
                  setIsCycleDeleteMode(false);
                  setSelectedCycles(new Set());
                }}
                itemName="ciclo(s)"
              />
          ) : isDeleteMode ? (
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
          ) : (
            cycles.length > 0 && (
              <div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOptionsOpen(!isOptionsOpen)}
                  className="flex items-center gap-2 rounded-xl border-slate-200 bg-white text-slate-700 shadow-sm transition-all hover:bg-slate-50"
                >
                  <Icon icon="ph:faders-duotone" className="size-4" />
                  <span className="hidden sm:inline">Filtros y Opciones</span>
                </Button>

                {isOptionsOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsOptionsOpen(false)} />
                    <div className="absolute right-0 top-full mt-2 w-[320px] rounded-2xl border border-slate-200 bg-white p-5 shadow-xl z-20 animate-in fade-in zoom-in-95">
                      
                      <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-4">Ordenación de datos</h4>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-sm font-medium text-slate-700 flex items-center shrink-0">
                            <Icon icon="ph:calendar-blank" className="mr-2 text-slate-400 size-4" /> Meses
                          </span>
                          <SegmentedControl 
                            value={cycleSortOrder} 
                            onChange={(v) => setCycleSortOrder(v as any)} 
                            options={[{label: "Nuevos", value: "desc"}, {label: "Antiguos", value: "asc"}]} 
                          />
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-sm font-medium text-slate-700 flex items-center shrink-0">
                            <Icon icon="ph:list-dashes" className="mr-2 text-slate-400 size-4" /> Movs.
                          </span>
                          <SegmentedControl 
                            value={txSortOrder} 
                            onChange={(v) => setTxSortOrder(v as any)} 
                            options={[{label: "Nuevos", value: "desc"}, {label: "Antiguos", value: "asc"}]} 
                          />
                        </div>
                      </div>

                      <div className="my-5 h-px w-full bg-slate-100" />

                      <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-3">Limpieza masiva</h4>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => { setIsCycleDeleteMode(true); setIsOptionsOpen(false); }}
                          className="flex items-center justify-center gap-2 rounded-xl border border-red-100 bg-red-50 py-2 text-xs font-medium text-red-600 transition-colors hover:bg-red-100 hover:text-red-700"
                        >
                          <Icon icon="ph:trash" className="size-3.5" /> Borrar Ciclos
                        </button>
                        <button
                          onClick={() => { setIsDeleteMode(true); setIsOptionsOpen(false); }}
                          className="flex items-center justify-center gap-2 rounded-xl border border-red-100 bg-red-50 py-2 text-xs font-medium text-red-600 transition-colors hover:bg-red-100 hover:text-red-700"
                        >
                          <Icon icon="ph:trash" className="size-3.5" /> Borrar Gastos
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )
          )}
        </div>
      </div>
      
      <div className="space-y-8">
        {sortedCycles.map((cycle) => (
          <div key={cycle.id} className={`relative rounded-xl transition-all ${isCycleDeleteMode && selectedCycles.has(cycle.id) ? 'ring-2 ring-red-500 ring-offset-4' : ''}`}>
            <div 
              className={`mb-3 flex items-center justify-between ${isCycleDeleteMode ? 'cursor-pointer' : ''}`}
              onClick={() => {
                if (!isCycleDeleteMode) return;
                const newSet = new Set(selectedCycles);
                newSet.has(cycle.id) ? newSet.delete(cycle.id) : newSet.add(cycle.id);
                setSelectedCycles(newSet);
              }}
            >
              <div className="flex items-center gap-2">
                {isCycleDeleteMode && <SelectionIndicator isSelected={selectedCycles.has(cycle.id)} />}
                <h3 className="flex items-center text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                  {cycle.name} {cycle.is_closed && <Icon icon="ph:lock" className="ml-2 size-3 text-slate-400" />}
                </h3>
              </div>
              {!isCycleDeleteMode && (
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
              )}
            </div>
            
            {cycle.transactions?.length === 0 ? (
              <p className="text-sm italic text-slate-400">Sin movimientos en este ciclo.</p>
              ) : (
              <ul className="overflow-hidden rounded-2xl border border-slate-100 divide-y divide-slate-100">
                {(() => {
                  const sortedTxs = [...(cycle.transactions ?? [])].sort((a, b) => {
                    const timeA = new Date(a.date || 0).getTime();
                    const timeB = new Date(b.date || 0).getTime();
                    return txSortOrder === "desc" ? timeB - timeA : timeA - timeB;
                  });

                  const visibleTxCount = visibleCounts[cycle.id] || DEFAULT_LIMIT;
                  const visibleTxs = sortedTxs.slice(0, visibleTxCount);
                  const hasMore = sortedTxs.length > visibleTxCount;

                  return (
                    <>
                      {visibleTxs.map((tx) => (
                        <TransactionItem 
                          key={tx.id} 
                          tx={tx} 
                          isCycleClosed={cycle.is_closed} 
                          categories={categories}
                          budgets={budgets}
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
                      {hasMore && (
                        <li className="bg-slate-50 p-4 text-center">
                          <button
                            type="button"
                            onClick={() => setVisibleCounts(prev => ({ ...prev, [cycle.id]: visibleTxCount + 50 }))}
                            className="inline-flex items-center rounded-full bg-white px-4 py-2 text-xs font-medium text-slate-600 shadow-sm border border-slate-200 transition-colors hover:bg-slate-100 hover:text-slate-900"
                          >
                            <Icon icon="ph:plus-circle" className="mr-2 size-4" />
                            Cargar más movimientos ({sortedTxs.length - visibleTxCount} restantes)
                          </button>
                        </li>
                      )}
                    </>
                  );
                })()}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}