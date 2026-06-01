import { Form, useActionData, useNavigation } from "react-router";
import { useEffect, useRef, useState, useMemo } from "react";
import { Icon } from "@iconify/react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Input } from "~/components/ui/input";
import { SelectNative } from "~/components/ui/select-native";
import { SubmitButton } from "~/components/ui/submit-button";
import { SegmentedControl } from "~/components/ui/segmented-control";
import { formatMoney } from "~/lib/utils";
import type { CycleManagerProps } from "~/types";

export function CycleManager({ activeCycles, isSubmitting, shareDivisor = 1, categories = [], budgets = [], otherWallets = [], rates, currentCurrency = "EUR" }: CycleManagerProps) {
  const actionData = useActionData<any>();
  const navigation = useNavigation();
  const formRef = useRef<HTMLFormElement>(null);
  const [showNewCycle, setShowNewCycle] = useState(false);
  const [txType, setTxType] = useState("expense");
  const [amount, setAmount] = useState("");
  const [destWalletId, setDestWalletId] = useState("");
  const [importMode, setImportMode] = useState(false);

  useEffect(() => {
    if (navigation.state === "idle" && actionData?.success) {
      if (actionData?.intent === "add_transaction") {
        formRef.current?.reset();
        setTxType("expense");
        setAmount("");
        setDestWalletId("");
      }
      if (actionData?.intent === "import_file") {
        formRef.current?.reset();
        setImportMode(false);
      }
      if (actionData?.intent === "create_cycle") {
        setShowNewCycle(false);
      }
    }
  }, [navigation.state, actionData]);

  const hasActiveCycles = activeCycles && activeCycles.length > 0;

  // Encontramos la cuenta de destino y calculamos la conversión en vivo
  const destinationWallet = useMemo(() => otherWallets.find(w => w.id === destWalletId), [otherWallets, destWalletId]);
  const destCurrency = destinationWallet?.currency || "EUR";
  
  const { convertedAmount, exchangeRate, isDifferentCurrency } = useMemo(() => {
    const isDiff = txType === "transfer" && !!destinationWallet && currentCurrency !== destCurrency;
    
    if (!isDiff || !rates || !rates[destCurrency]) {
      return { convertedAmount: 0, exchangeRate: 0, isDifferentCurrency: isDiff };
    }
    
    const numAmount = Number(amount);
    const rate = rates[destCurrency];
    
    return { 
      convertedAmount: !isNaN(numAmount) ? numAmount * rate : 0, 
      exchangeRate: rate,
      isDifferentCurrency: isDiff
    };
  }, [txType, destinationWallet, currentCurrency, destCurrency, rates, amount]);

  return (
    <div className="space-y-6">
      {(!hasActiveCycles || showNewCycle) ? (
        <Card className="border-indigo-100 bg-indigo-50/50 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-base text-indigo-900">
                  <Icon icon="ph:calendar-plus-duotone" className="size-5 text-indigo-600" /> Abrir ciclo
                </CardTitle>
                <CardDescription className="text-indigo-700/70">Crea un periodo para registrar ingresos y gastos.</CardDescription>
              </div>
              {hasActiveCycles && (
                <Button variant="ghost" size="sm" onClick={() => setShowNewCycle(false)} className="h-8 w-8 p-0 rounded-full hover:bg-indigo-100 text-indigo-600">
                  <Icon icon="ph:x" className="size-4" />
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <Form method="post" className="space-y-4">
              <input type="hidden" name="_intent" value="create_cycle" />
              <Input type="text" name="name" placeholder="Ej. Junio 2026" required className="bg-white" />
              <Input type="date" name="start_date" required className="bg-white" />
              <SubmitButton isSubmitting={isSubmitting} loadingText="Iniciando..." className="bg-indigo-600 hover:bg-indigo-700">
                Iniciar ciclo
              </SubmitButton>
            </Form>
          </CardContent>
        </Card>
      ) : (
        <Button variant="outline" onClick={() => setShowNewCycle(true)} className="w-full border-dashed border-slate-300 text-slate-500 bg-slate-50/50 hover:bg-slate-100 hover:text-slate-900 transition-colors shadow-sm">
          <Icon icon="ph:plus-circle-duotone" className="mr-2 size-4" /> Abrir otro ciclo simultáneo
        </Button>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="text-base text-emerald-700">Registrar Movimientos</CardTitle>
            {hasActiveCycles && <Badge variant="success">En curso ({activeCycles.length})</Badge>}
          </div>
          <CardDescription>Sube un archivo o añade movimientos a tus periodos.</CardDescription>
          
          <SegmentedControl
            value={importMode ? "import" : "manual"}
            onChange={(val) => setImportMode(val === "import")}
            options={[
              { label: "Manual", value: "manual" },
              { label: "Importar CSV / Excel", value: "import" }
            ]}
            className="mt-4"
          />
        </CardHeader>
        <CardContent>
          {importMode ? (
            <Form ref={formRef} method="post" encType="multipart/form-data" className="space-y-4 pt-2">
              <input type="hidden" name="_intent" value="import_file" />
              
              <div className="space-y-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                <Icon icon="ph:file-arrow-up-duotone" className="mx-auto size-8 text-slate-400" />
                <div className="text-sm font-medium text-slate-700">Sube el extracto de tu banco</div>
                <p className="text-xs text-slate-500">Los periodos (meses) se crearán solos según la fecha de cada movimiento.</p>
                <Input type="file" name="file" accept=".csv, .xls, .xlsx, .ofx, .qif" required className="mx-auto mt-4 w-full max-w-62.5 text-xs file:bg-slate-100 file:text-slate-700 file:border-0 file:rounded-md file:px-2 file:py-1" />
              </div>
              
              <SubmitButton isSubmitting={isSubmitting} loadingText="Importando..." className="bg-emerald-600 hover:bg-emerald-700">
                Importar archivo
              </SubmitButton>
            </Form>
          ) : (
            hasActiveCycles ? (
              <Form ref={formRef} method="post" className="space-y-4 pt-2">
                <input type="hidden" name="_intent" value="add_transaction" />
                
                {activeCycles.length === 1 ? (
                  <input type="hidden" name="cycle_id" value={activeCycles[0].id} />
                ) : (
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-500">¿A qué ciclo pertenece?</label>
                    <SelectNative name="cycle_id" required>
                      {activeCycles.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </SelectNative>
                  </div>
                )}

                <Input type="text" name="concept" placeholder="Concepto (Ej. Nómina)" required />
                <Input type="number" step="0.01" name="amount" placeholder="Monto" required className="tabular-nums" value={amount} onChange={(e) => setAmount(e.target.value)} />
                <SelectNative name="type" value={txType} onChange={(e) => setTxType(e.target.value)}>
                  <option value="expense">Gasto / Cargo</option>
                  <option value="income">Ingreso / Abono</option>
                  <option value="transfer">Transferencia</option>
                </SelectNative>

                {txType === "transfer" && (
                  <div className="space-y-1 animate-in fade-in slide-in-from-top-1">
                    <label className="text-xs font-medium text-slate-500">¿A qué cuenta enviarás el dinero?</label>
                    <SelectNative name="destination_wallet_id" required value={destWalletId} onChange={(e) => setDestWalletId(e.target.value)}>
                      <option value="">Selecciona la cuenta destino...</option>
                      {otherWallets.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                    </SelectNative>
                    
                    {isDifferentCurrency && (
                      <div className="mt-2 flex items-center gap-3 rounded-xl bg-indigo-50/50 border border-indigo-100 px-3 py-2 text-sm text-indigo-700 animate-in fade-in">
                        <Icon icon="ph:currency-circle-dollar-duotone" className="size-5 shrink-0 text-indigo-500" />
                        <div>
                          <span className="font-semibold">
                            {Number(amount) > 0 ? formatMoney(convertedAmount, destCurrency) : "Conversión de moneda"}
                          </span>
                          <p className="text-[11px] font-medium opacity-80 uppercase tracking-wider mt-0.5">
                            1 {currentCurrency} = {exchangeRate.toFixed(4)} {destCurrency}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                  <SelectNative name="category_id">
                    <option value="">Sin categoría (Etiqueta)</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </SelectNative>
                  
                  <SelectNative name="budget_id">
                    <option value="">Sin presupuesto (Límite)</option>
                    {budgets.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </SelectNative>
                </div>

                <Input type="date" name="date" defaultValue={new Date().toISOString().split('T')[0]} required />
                
                {shareDivisor > 1 && (
                  <div className="flex items-center gap-2 px-1 py-1">
                    <input type="checkbox" id="apply_division" name="apply_division" value="true" defaultChecked className="size-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                    <label htmlFor="apply_division" className="text-sm font-medium text-slate-700">
                      Dividir automáticamente entre {shareDivisor} personas
                    </label>
                  </div>
                )}
                
                <SubmitButton isSubmitting={isSubmitting} loadingText="Registrando...">
                  Registrar movimiento
                </SubmitButton>
              </Form>
            ) : (
              <div className="py-6 text-center">
                <p className="text-sm font-medium text-slate-600 mb-2">No hay ciclos activos</p>
                <p className="text-xs text-slate-500 mb-4">Abre un ciclo para añadir movimientos manualmente, o simplemente sube un CSV.</p>
              </div>
            )
          )}
        </CardContent>
      </Card>
    </div>
  );
}