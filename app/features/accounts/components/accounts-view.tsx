import { Form, Link, useNavigation, useActionData, useSubmit } from "react-router";
import { TrendingDown, PlusCircle } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { Icon } from "@iconify/react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from "recharts";

import { DashboardLayout } from "~/components/layout/dashboard-layout";
import { WalletCard } from "~/features/wallets/components/wallet-card";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { MultiSelectActions } from "~/components/ui/multi-select-actions";
import { PageHeader } from "~/components/ui/page-header";
import { FormError } from "~/components/ui/form-error";
import { EmptyState } from "~/components/ui/empty-state";
import { Input } from "~/components/ui/input";
import { SelectNative } from "~/components/ui/select-native";
import { CurrencySelect } from "~/components/ui/currency-select";
import { SelectionIndicator } from "~/components/ui/selection-indicator";
import { SubmitButton } from "~/components/ui/submit-button";
import { Collapsible } from "~/components/ui/collapsible";
import type { AccountsViewProps } from "~/types";
import { formatMoney } from "~/lib/utils";

export function AccountsView({ userEmail, wallets, currencyOptions = ["EUR", "USD", "GBP", "MXN"] }: AccountsViewProps & { currencyOptions?: string[] }) {
  const navigation = useNavigation();
  const submit = useSubmit();
  const actionData = useActionData<{ error?: string; success?: boolean }>();
  const isSubmitting = navigation.state === "submitting";
  const [showForm, setShowForm] = useState(false);
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [selectedWallets, setSelectedWallets] = useState<Set<string>>(new Set());

  // Escuchamos el estado de la petición. Solo cerramos el formulario si fue exitosa.
  useEffect(() => {
    if (navigation.state === "idle" && actionData?.success) {
      setShowForm(false);
      setIsDeleteMode(false);
      setSelectedWallets(new Set());
    }
  }, [navigation.state, actionData]);

  // Datos para el gráfico de resumen del portafolio con useMemo para evitar cálculos innecesarios en cada renderizado. Solo se recalcula cuando cambian las wallets.
  const portfolioChartData = useMemo(() => {
    const totalAssets = wallets.filter(w => !w.is_liability).reduce((sum, w) => sum + Number(w.current_balance), 0);
    const totalLiabilities = wallets.filter(w => w.is_liability).reduce((sum, w) => sum + Number(w.current_balance), 0);
    
    return [
      { name: "Activos (Ahorro)", value: totalAssets, color: "#10b981" },
      { name: "Pasivos (Deuda)", value: totalLiabilities, color: "#ef4444" }
    ].filter(d => d.value > 0);
  }, [wallets]);

  const formatChartMoney = (value: number) => formatMoney(value, currencyOptions[0] || "EUR");

  return (
    <DashboardLayout userEmail={userEmail}>
      <div className="mx-auto max-w-6xl space-y-8 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <header className="flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <PageHeader 
            supertitle="Portafolio" 
            title="Mis cuentas" 
            description="Selecciona una cuenta o añade una nueva." 
          />
          
          <div className="flex flex-wrap items-center gap-2">
            <MultiSelectActions
              isDeleteMode={isDeleteMode}
              selectedCount={selectedWallets.size}
              totalCount={wallets.length}
              onToggleMode={(mode) => { setIsDeleteMode(mode); setShowForm(false); }}
              onSelectAll={() => setSelectedWallets(new Set(wallets.map(w => w.id)))}
              onClearSelection={() => setSelectedWallets(new Set())}
              onDelete={() => {
                const fd = new FormData();
                fd.append("_intent", "delete_wallets");
                selectedWallets.forEach(id => fd.append("wallet_ids", id));
                submit(fd, { method: "post" });
              }}
              itemName="cuenta(s)"
            >
              <Button type="button" onClick={() => { setShowForm((current) => !current); setIsDeleteMode(false); }} variant="outline" className="rounded-xl border-slate-200 bg-white text-slate-700">
                <PlusCircle className="mr-2 size-4" />
                {showForm ? "Cancelar" : "Nueva Cuenta"}
              </Button>
            </MultiSelectActions>
          </div>
        </header>

        {showForm && (
          <Card className="max-w-2xl border-dashed border-slate-300">
            <CardHeader>
              <CardTitle>Registrar cuenta</CardTitle>
              <CardDescription>Configura una nueva cuenta o pasivo con su saldo inicial.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form method="post" action="/dashboard/cuentas" className="space-y-5">
                <input type="hidden" name="_intent" value="create_wallet" />

                <FormError error={actionData?.error} />

                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">Nombre</label>
                  <Input type="text" name="name" placeholder="Ej. Tarjeta Crédito" required />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">Moneda</label>
                  <CurrencySelect name="currency" defaultValue="EUR" options={currencyOptions} />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">Tipo</label>
                    <SelectNative name="is_liability" defaultValue="false">
                      <option value="false">Activo (Cuenta bancaria / Ahorro)</option>
                      <option value="true">Pasivo (Deuda real)</option>
                    </SelectNative>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">Saldo inicial</label>
                    <Input type="number" step="0.01" name="initial_balance" placeholder="0.00" required className="tabular-nums" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
                    Meta de Ahorro / Deuda Total (Opcional)
                  </label>
                  <Input type="number" step="0.01" name="target_amount" defaultValue={0} min={0} />
                  <p className="text-xs text-slate-500">¿Cuánto quieres ahorrar o de cuánto es tu deuda total?</p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
                    ¿Cuenta compartida? (Nº personas)
                  </label>
                  <Input type="number" name="share_divisor" defaultValue={1} min={1} required />
                  <p className="text-xs text-slate-500">Deja 1 si es personal.</p>
                </div>

                <SubmitButton isSubmitting={isSubmitting}>
                  Guardar cuenta
                </SubmitButton>
              </Form>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {wallets.length === 0 ? (
            <EmptyState message="No tienes cuentas configuradas." className="sm:col-span-2 xl:col-span-3" />
          ) : (
            wallets.map((wallet) => (
              <div key={wallet.id} className="group relative block h-full">
                <div className="relative h-full transition-transform duration-200 group-hover:-translate-y-0.5">
                  {wallet.is_liability && (
                    <div className="absolute -left-2 -top-2 z-10 rounded-full border border-red-200 bg-red-50 p-1.5 text-red-600 shadow-sm">
                      <TrendingDown className="size-4" />
                    </div>
                  )}
                  
                  {isDeleteMode ? (
                    <div 
                      onClick={() => {
                        const newSet = new Set(selectedWallets);
                        if (newSet.has(wallet.id)) newSet.delete(wallet.id);
                        else newSet.add(wallet.id);
                        setSelectedWallets(newSet);
                      }}
                      className={`block h-full cursor-pointer rounded-2xl ring-2 transition-all ${selectedWallets.has(wallet.id) ? "ring-red-500" : "ring-transparent"}`}
                    >
                      <div className="pointer-events-none">
                        <WalletCard name={wallet.name} type={wallet.type} balance={wallet.current_balance} initialBalance={wallet.initial_balance} isLiability={wallet.is_liability} />
                      </div>
                      <div className="absolute right-4 top-4 z-10">
                        <SelectionIndicator isSelected={selectedWallets.has(wallet.id)} />
                      </div>
                    </div>
                  ) : (
                    <Link to={`/dashboard/cuentas/${wallet.id}`} className="block h-full">
                      <WalletCard 
                        name={wallet.name} 
                        type={wallet.type} 
                        balance={wallet.current_balance} 
                        initialBalance={wallet.initial_balance} 
                        isLiability={wallet.is_liability}
                        currency={wallet.currency}
                      />
                    </Link>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Gráfica movida abajo en un plegable */}
        {wallets.length > 0 && (
          <div className="mt-6 sm:mt-8">
            <Collapsible title="Distribución de Patrimonio Real" defaultOpen={false} className="w-full">
              <p className="text-sm text-slate-500 mb-3">Haz clic para ver el análisis de cómo se divide tu dinero entre tus cuentas.</p>
              <Card className="overflow-hidden border-slate-200 shadow-sm">
                <CardContent className="p-6">
                  <div className="h-64 w-full min-w-0">
                    {portfolioChartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={portfolioChartData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                            {portfolioChartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                          </Pie>
                          <RechartsTooltip formatter={(value) => [formatChartMoney(Number(value ?? 0)), "Monto"]} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                          <Legend verticalAlign="bottom" height={36} iconType="circle" />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-slate-500">No hay saldos configurados para mostrar.</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Collapsible>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}