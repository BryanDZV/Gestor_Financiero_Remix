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
import { SelectNative } from "~/components/ui/select-native";
import type { BudgetsViewProps } from "~/types";

export function BudgetsView({ userEmail, budgets, currencyOptions = ["EUR", "USD", "GBP", "MXN"] }: BudgetsViewProps) {
  const navigation = useNavigation();
  const submit = useSubmit();
  const actionData = useActionData<{ error?: string; success?: boolean }>();
  const isSubmitting = navigation.state !== "idle";
  const formRef = useRef<HTMLFormElement>(null);
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (navigation.state === "idle" && actionData?.success) {
      formRef.current?.reset();
      setIsDeleteMode(false);
      setSelectedCategories(new Set());
    }
  }, [navigation.state, actionData]);

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
              selectedCount={selectedCategories.size}
              totalCount={budgets.length}
              onToggleMode={setIsDeleteMode}
              onSelectAll={() => setSelectedCategories(new Set(budgets.map(b => b.id)))}
              onClearSelection={() => setSelectedCategories(new Set())}
              onDelete={() => {
                const fd = new FormData();
                fd.append("_intent", "delete_categories");
                selectedCategories.forEach(id => fd.append("category_ids", id));
                submit(fd, { method: "post" });
              }}
              itemName="categoría(s)"
            />
          </div>
        </header>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Nueva categoría</CardTitle>
                <CardDescription>Crea un presupuesto mensual.</CardDescription>
              </CardHeader>
              <CardContent>
                <Form ref={formRef} method="post" className="space-y-4">
                  <FormError error={actionData?.error} />

                  <input type="hidden" name="_intent" value="create_category" />
                  <Input type="text" name="name" placeholder="Ej. Ocio, Compras..." required />
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-500">Límite mensual (0 = Sin límite)</label>
                    <Input type="number" step="0.01" name="monthly_limit" defaultValue={0} min={0} required className="tabular-nums" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-500">Moneda</label>
                    <SelectNative name="currency" defaultValue="EUR">
                      {currencyOptions.map(code => {
                        let label = code;
                        try {
                          const name = new Intl.DisplayNames(['es-ES'], { type: 'currency' }).of(code);
                          if (name) label = `${code} - ${name.charAt(0).toUpperCase() + name.slice(1)}`;
                        } catch (e) {
                          // Ignorar si el navegador no lo soporta
                        }
                        return <option key={code} value={code}>{label}</option>;
                      })}
                    </SelectNative>
                  </div>
                  <Button type="submit" disabled={isSubmitting} className="h-11 w-full rounded-xl bg-blue-600 text-white shadow-sm hover:bg-blue-700">
                    {isSubmitting ? "Guardando..." : "Crear presupuesto"}
                  </Button>
                </Form>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {budgets.length === 0 ? (
              <EmptyState message="Aún no tienes categorías." className="sm:col-span-2" />
            ) : (
              budgets.map((budget) => {
                const hasLimit = budget.monthly_limit > 0;
                const progress = hasLimit ? Math.min(100, (budget.spent / budget.monthly_limit) * 100) : 0;
                const isWarning = progress >= 80 && progress < 100;
                const isDanger = progress >= 100;
                
                const barColor = isDanger ? "bg-red-500" : isWarning ? "bg-amber-500" : "bg-blue-500";
                const textColor = isDanger ? "text-red-600" : isWarning ? "text-amber-600" : "text-blue-600";
                const isSelected = selectedCategories.has(budget.id);

                return (
                  <Card key={budget.id} className={`relative overflow-hidden transition-all ${isDeleteMode && isSelected ? 'ring-2 ring-red-500' : ''}`}>
                    {isDeleteMode && (
                      <div className="absolute inset-0 z-20 cursor-pointer bg-transparent" onClick={() => {
                        const newSet = new Set(selectedCategories);
                        if (newSet.has(budget.id)) newSet.delete(budget.id);
                        else newSet.add(budget.id);
                        setSelectedCategories(newSet);
                      }}>
                        <div className="absolute right-4 top-4">
                          <div className={`flex size-6 items-center justify-center rounded-md border-2 transition-colors ${isSelected ? "border-red-500 bg-red-500 text-white" : "border-slate-300 bg-white"}`}>
                            {isSelected && <Icon icon="ph:check-bold" className="size-4" />}
                          </div>
                        </div>
                      </div>
                    )}
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base truncate pr-6">{budget.name}</CardTitle>
                      {hasLimit ? (
                        <div className="flex items-baseline gap-1 mt-1">
                          <span className={`text-xl font-bold tabular-nums tracking-tight ${textColor}`}>{formatMoney(budget.spent, budget.currency || "EUR")}</span>
                          <span className="text-sm font-medium text-slate-500 tabular-nums">/ {formatMoney(budget.monthly_limit, budget.currency || "EUR")}</span>
                        </div>
                      ) : (
                        <div className="flex flex-col mt-1">
                          <span className="text-xs font-medium uppercase tracking-wider text-slate-400 mb-1">Gastado este mes</span>
                          <span className="text-xl font-bold tabular-nums tracking-tight text-slate-700">{formatMoney(budget.spent, budget.currency || "EUR")}</span>
                        </div>
                      )}
                    </CardHeader>
                    {hasLimit && (
                      <CardContent>
                        <div className="mt-2 space-y-1.5">
                          <div className="flex justify-between text-xs font-medium">
                            <span className={textColor}>{isDanger ? "Límite excedido" : isWarning ? "Cerca del límite" : "Dentro del límite"}</span>
                            <span className={`tabular-nums ${textColor}`}>{progress.toFixed(1)}%</span>
                          </div>
                          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full transition-all duration-700 ${barColor}`} style={{ width: `${progress}%` }} /></div>
                        </div>
                      </CardContent>
                    )}
                  </Card>
                );
              })
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}