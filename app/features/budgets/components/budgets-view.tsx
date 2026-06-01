import { Form, useNavigation, useSubmit, useActionData } from "react-router";
import { useEffect, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import { DashboardLayout } from "~/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { formatMoney } from "~/lib/utils";
import { MultiSelectActions } from "~/components/ui/multi-select-actions";
import { PageHeader } from "~/components/ui/page-header";
import { FormError } from "~/components/ui/form-error";
import { EmptyState } from "~/components/ui/empty-state";
import { Input } from "~/components/ui/input";
import { SubmitButton } from "~/components/ui/submit-button";
import { SelectionIndicator } from "~/components/ui/selection-indicator";
import { BudgetOverviewChart } from "~/components/ui/budget-overview-chart";
import { Collapsible } from "~/components/ui/collapsible";
import { BudgetProgressCard } from "~/components/ui/budget-progress-card";
import { CurrencySelect } from "~/components/ui/currency-select";
import type { BudgetsViewProps, Budget } from "~/types";

export function BudgetsView({ userEmail, budgets, currencyOptions = ["EUR", "USD", "GBP", "MXN"] }: BudgetsViewProps) {
  const navigation = useNavigation();
  const submit = useSubmit();
  const actionData = useActionData<{ error?: string; success?: boolean }>();
  const isSubmitting = navigation.state !== "idle";
  const formRef = useRef<HTMLFormElement>(null);
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [selectedBudgets, setSelectedBudgets] = useState<Set<string>>(new Set());
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [formName, setFormName] = useState<string>("");
  const [formMonthlyLimit, setFormMonthlyLimit] = useState<string>("0");
  const [formCurrency, setFormCurrency] = useState<string>(currencyOptions[0]);

  useEffect(() => {
    if (navigation.state === "idle" && actionData?.success) {
      // Limpiar estado del formulario controlado después de una acción exitosa
      setIsDeleteMode(false);
      setSelectedBudgets(new Set());
      setEditingBudget(null);
      setFormName("");
      setFormMonthlyLimit("0");
      setFormCurrency(currencyOptions[0]);
    }
  }, [navigation.state, actionData, currencyOptions]);

  useEffect(() => {
    // Sincronizar valores del formulario controlado cuando cambia el presupuesto a editar
    if (editingBudget) {
      setFormName(editingBudget.name || "");
      setFormMonthlyLimit(String(editingBudget.monthly_limit ?? 0));
      setFormCurrency(editingBudget.currency || currencyOptions[0]);
    } else {
      setFormName("");
      setFormMonthlyLimit("0");
      setFormCurrency(currencyOptions[0]);
    }
  }, [editingBudget, currencyOptions]);

  return (
    <DashboardLayout userEmail={userEmail}>
      <div className="mx-auto max-w-6xl space-y-8 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <header className="flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <PageHeader 
            supertitle="Categorías" 
            title="Presupuestos" 
            description="Controla cuánto gastas al mes segmentando tus salidas de dinero." 
          />
          <div className="flex flex-wrap items-center gap-2">
            <MultiSelectActions
              isDeleteMode={isDeleteMode}
              selectedCount={selectedBudgets.size}
              totalCount={budgets.length}
              onToggleMode={setIsDeleteMode}
              onSelectAll={() => setSelectedBudgets(new Set(budgets.map(b => b.id)))}
              onClearSelection={() => setSelectedBudgets(new Set())}
              onDelete={() => {
                const fd = new FormData();
                fd.append("_intent", "delete_budgets");
                selectedBudgets.forEach(id => fd.append("budget_ids", id));
                submit(fd, { method: "post" });
              }}
              itemName="presupuesto(s)"
            />
          </div>
        </header>

        {/* La gráfica pasa a un panel desplegable al final para no competir con la creación/edición.
            Se muestra en versión compacta dentro del plegable. */}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="flex flex-row items-start justify-between gap-2">
                <div>
                  <CardTitle className="text-base">{editingBudget ? "Editar presupuesto" : "Nuevo presupuesto"}</CardTitle>
                  <CardDescription>{editingBudget ? "Modifica los valores de tu presupuesto." : "Crea un presupuesto mensual."}</CardDescription>
                </div>
                {editingBudget && (
                  <Button variant="ghost" size="icon" onClick={() => setEditingBudget(null)} className="h-8 w-8 rounded-full">
                    <Icon icon="ph:x" className="size-4 text-slate-500" />
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                <Form ref={formRef} method="post" className="space-y-4" key={editingBudget ? editingBudget.id : "new"}>
                  <FormError error={actionData?.error} />

                  <input type="hidden" name="_intent" value={editingBudget ? "edit_budget" : "create_budget"} />
                  {editingBudget && <input type="hidden" name="budget_id" value={editingBudget.id} />}
                  
                  <Input type="text" name="name" placeholder="Ej. Ocio, Restaurantes..." value={formName} onChange={(e) => setFormName(e.target.value)} required />

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-500">Límite mensual (0 = Sin límite)</label>
                    <Input type="number" step="0.01" name="monthly_limit" value={formMonthlyLimit} onChange={(e) => setFormMonthlyLimit(e.target.value)} min={0} required className="tabular-nums" />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-500">Moneda</label>
                    <CurrencySelect name="currency" value={formCurrency} onChange={(e) => setFormCurrency(e.target.value)} options={currencyOptions} />
                  </div>
                  <input type="hidden" name="name" value={formName} />
                  <input type="hidden" name="monthly_limit" value={formMonthlyLimit} />
                  <input type="hidden" name="currency" value={formCurrency} />
                  <SubmitButton isSubmitting={isSubmitting}>
                    {editingBudget ? "Guardar cambios" : "Crear presupuesto"}
                  </SubmitButton>
                </Form>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {budgets.length === 0 ? (
              <EmptyState message="Aún no tienes presupuestos." className="sm:col-span-2" />
            ) : (
              budgets.map((budget) => {
                const isSelected = selectedBudgets.has(budget.id);

                return (
                  <div key={budget.id} className="relative">
                    {isDeleteMode && (
                      <div className="absolute inset-0 z-20 cursor-pointer rounded-2xl bg-transparent" onClick={() => {
                        const newSet = new Set(selectedBudgets);
                        if (newSet.has(budget.id)) newSet.delete(budget.id);
                        else newSet.add(budget.id);
                        setSelectedBudgets(newSet);
                      }}>
                        <div className="absolute right-4 top-4">
                          <SelectionIndicator isSelected={isSelected} />
                        </div>
                      </div>
                    )}
                    <div className={isDeleteMode && isSelected ? 'ring-2 ring-red-500 rounded-2xl overflow-hidden transition-all' : 'transition-all'}>
                      <BudgetProgressCard 
                        budget={budget} 
                        currency={budget.currency || currencyOptions[0]} 
                        onEdit={() => { 
                          setEditingBudget(budget); 
                          setIsDeleteMode(false); 
                          window.scrollTo({ top: 0, behavior: 'smooth' }); 
                        }} 
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Gráfica movida abajo en un plegable para mejorar enfoque del usuario */}
        {budgets.filter(b => b.monthly_limit > 0).length > 0 && (
          <div className="mt-6 sm:mt-8">
            <Collapsible title="Análisis de Presupuestos" defaultOpen={false} className="w-full">
              <p className="text-sm text-slate-500 mb-3">Haz clic para ver el análisis Gastado vs Límite. Se muestra en formato compacto para no robar atención al flujo principal.</p>
              <BudgetOverviewChart budgets={budgets} currency={currencyOptions.includes("EUR") ? "EUR" : currencyOptions[0]} compact />
            </Collapsible>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}