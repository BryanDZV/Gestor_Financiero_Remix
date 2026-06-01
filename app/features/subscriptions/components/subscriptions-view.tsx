// Componente visual principal para el Gestor de Suscripciones
// (Forzando la actualización de caché de Vite)
import { Form, useNavigation, useSubmit, useActionData } from "react-router";
import { useEffect, useRef, useState, useMemo } from "react";
import { Icon } from "@iconify/react";
import { DashboardLayout } from "~/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { formatMoney, formatDate } from "~/lib/utils";
import { MultiSelectActions } from "~/components/ui/multi-select-actions";
import { PageHeader } from "~/components/ui/page-header";
import { FormError } from "~/components/ui/form-error";
import { EmptyState } from "~/components/ui/empty-state";
import { Input } from "~/components/ui/input";
import { SelectNative } from "~/components/ui/select-native";
import { SubmitButton } from "~/components/ui/submit-button";
import type { SubscriptionsViewProps } from "~/types";
import { SubscriptionCard } from "./subscription-card";

export function SubscriptionsView({ userEmail, subscriptions, wallets }: SubscriptionsViewProps) {
  const navigation = useNavigation();
  const submit = useSubmit();
  const actionData = useActionData<{ error?: string; success?: boolean }>();
  const isSubmitting = navigation.state !== "idle";
  const formRef = useRef<HTMLFormElement>(null);
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (navigation.state === "idle" && actionData?.success) {
      formRef.current?.reset();
      setIsDeleteMode(false);
      setSelectedIds(new Set());
    }
  }, [navigation.state, actionData]);

  const handleToggleSelection = (id: string) => {
    const newSet = new Set(selectedIds);
    newSet.has(id) ? newSet.delete(id) : newSet.add(id);
    setSelectedIds(newSet);
  };

  // Calculamos el costo mensual total separado por moneda use memo
  const monthlyCostsByCurrency = useMemo(() => {
    const totals: Record<string, number> = {};
    subscriptions
      .filter(s => s.active)
      .forEach(s => {
        const c = s.wallets?.currency || 'EUR';
        const monthlyAmount = s.billing_period === 'yearly' ? s.amount / 12 : s.amount;
        if (!totals[c]) totals[c] = 0;
        totals[c] += monthlyAmount;
      });
    const results = Object.entries(totals).map(([currency, total]) => ({ currency, total }));
    return results.length > 0 ? results : [{ currency: 'EUR', total: 0 }];
  }, [subscriptions]);

  return (
    <DashboardLayout userEmail={userEmail}>
      <div className="mx-auto max-w-6xl space-y-8 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <header className="flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <PageHeader 
            supertitle="Gastos Fijos" 
            title="Suscripciones" 
            description="Lleva el control de todos tus servicios recurrentes y detecta fugas de dinero." 
          />
          <div className="flex flex-wrap items-center gap-2">
            <MultiSelectActions
              isDeleteMode={isDeleteMode}
              selectedCount={selectedIds.size}
              totalCount={subscriptions.length}
              onToggleMode={setIsDeleteMode}
              onSelectAll={() => setSelectedIds(new Set(subscriptions.map(s => s.id)))}
              onClearSelection={() => setSelectedIds(new Set())}
              onDelete={() => {
                const fd = new FormData();
                fd.append("_intent", "delete_subscriptions");
                selectedIds.forEach(id => fd.append("subscription_ids", id));
                submit(fd, { method: "post" });
              }}
              itemName="suscripción(es)"
            />
          </div>
        </header>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-1">
            <Card className="bg-indigo-600 text-white shadow-md border-0">
              <CardContent className="p-6">
                <p className="text-sm font-medium text-indigo-100 uppercase tracking-widest">Costo Mensual Fijo</p>
              <div className="mt-2 space-y-4">
                {monthlyCostsByCurrency.map(({ currency, total }) => (
                  <div key={currency}>
                    <p className="text-4xl font-bold tracking-tight">{formatMoney(total, currency)}</p>
                    <p className="mt-1 text-xs text-indigo-200">Equivale a {formatMoney(total * 12, currency)} al año</p>
                  </div>
                ))}
              </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Nuevo servicio</CardTitle>
                <CardDescription>Añade un pago recurrente.</CardDescription>
              </CardHeader>
              <CardContent>
                <Form ref={formRef} method="post" className="space-y-4">
                  <FormError error={actionData?.error} />
                  <input type="hidden" name="_intent" value="create_subscription" />
                  
                  <Input type="text" name="name" placeholder="Ej. Netflix, Gimnasio..." required />
                  <Input type="number" step="0.01" name="amount" placeholder="Costo (Ej. 15.99)" required className="tabular-nums" />
                  
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-500">Frecuencia de cobro</label>
                    <SelectNative name="billing_period">
                      <option value="monthly">Mensual</option>
                      <option value="yearly">Anual</option>
                    </SelectNative>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-500">Fecha del primer cobro</label>
                    <Input type="date" name="start_date" defaultValue={new Date().toISOString().split('T')[0]} required />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-500">Cuenta de cobro (Opcional)</label>
                    <SelectNative name="wallet_id">
                      <option value="">Ninguna en específico</option>
                      {wallets.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                    </SelectNative>
                  </div>

                  <SubmitButton isSubmitting={isSubmitting}>
                    Guardar suscripción
                  </SubmitButton>
                </Form>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 auto-rows-max">
            {subscriptions.length === 0 ? (
              <EmptyState message="No tienes suscripciones registradas." className="sm:col-span-2" />
            ) : (
              subscriptions.map((sub) => (
                <SubscriptionCard
                  key={sub.id}
                  subscription={sub}
                  isDeleteMode={isDeleteMode}
                  isSelected={selectedIds.has(sub.id)}
                  onToggle={() => handleToggleSelection(sub.id)}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}