import { Form, useActionData, useNavigation } from "react-router";
import { useEffect, useRef, useState, useMemo } from "react";
import { Icon } from "@iconify/react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Input } from "~/components/ui/input";
import { SelectNative } from "~/components/ui/select-native";
import { formatMoney } from "~/lib/utils";
import type { CycleManagerProps } from "~/types";

export function CycleManager({ activeCycles, isSubmitting, shareDivisor = 1, categories = [], otherWallets = [], rates, currentCurrency = "EUR" }: CycleManagerProps) {
  const actionData = useActionData<any>();
  const navigation = useNavigation();
  const formRef = useRef<HTMLFormElement>(null);
  const [showNewCycle, setShowNewCycle] = useState(false);
  const [txType, setTxType] = useState("expense");
  const [amount, setAmount] = useState("");
  const [destWalletId, setDestWalletId] = useState("");
  const [importMode, setImportMode] = useState(false);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);

  useEffect(() => {
    if (navigation.state === "idle" && actionData?.success) {
      if (actionData?.intent === "add_transaction") {
        formRef.current?.reset();
        setTxType("expense");
        setAmount("");
        setDestWalletId("");
      }
      if (actionData?.intent === "import_csv") {
        formRef.current?.reset();
        setCsvHeaders([]);
        setImportMode(false);
      }
      if (actionData?.intent === "create_cycle") {
        setShowNewCycle(false);
      }
    }
  }, [navigation.state, actionData]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setCsvHeaders([]);
      return;
    }
    try {
      const text = await file.text();
      const header = text.split(/\r?\n/)[0].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(h => h.trim().replace(/^"|"$/g, ''));
      setCsvHeaders(header);
    } catch (e) {
      console.error("Error al leer la cabecera del archivo:", e);
      setCsvHeaders([]);
    }
  };
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
      {hasActiveCycles && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="text-base text-emerald-700">Ciclos activos</CardTitle>
              <Badge variant="success">En curso ({activeCycles.length})</Badge>
            </div>
            <CardDescription>Añade movimientos a tus periodos abiertos.</CardDescription>
            <div className="mt-4 flex rounded-lg bg-slate-100 p-1">
              <button type="button" onClick={() => setImportMode(false)} className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${!importMode ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Manual</button>
              <button type="button" onClick={() => setImportMode(true)} className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${importMode ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Importar CSV</button>
            </div>
          </CardHeader>
          <CardContent>
            {importMode ? (
              <Form ref={formRef} method="post" encType="multipart/form-data" className="space-y-4 pt-2">
                <input type="hidden" name="_intent" value="import_csv" />
                
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
                
                <div className="space-y-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                  <Icon icon="ph:file-csv-duotone" className="mx-auto size-8 text-slate-400" />
                  <div className="text-sm font-medium text-slate-700">Sube tu archivo .csv</div>
                  <p className="text-xs text-slate-500">El sistema te pedirá que mapees las columnas.</p>
                  <Input type="file" name="csv_file" accept=".csv" required onChange={handleFileChange} className="mx-auto mt-4 w-full max-w-62.5 text-xs file:bg-slate-100 file:text-slate-700 file:border-0 file:rounded-md file:px-2 file:py-1" />
                </div>
                
                {csvHeaders.length > 0 && (
                  <div className="space-y-4 rounded-2xl border border-blue-200 bg-blue-50/50 p-4 animate-in fade-in">
                    <h4 className="text-sm font-semibold text-blue-800">Mapeo de Columnas</h4>
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-slate-600">Columna de Fecha</label>
                      <SelectNative name="date_idx" required>
                        {csvHeaders.map((h, i) => <option key={`date-${i}`} value={i}>{h}</option>)}
                      </SelectNative>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-slate-600">Columna de Concepto</label>
                      <SelectNative name="concept_idx" required>
                        {csvHeaders.map((h, i) => <option key={`concept-${i}`} value={i}>{h}</option>)}
                      </SelectNative>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-slate-600">Columna de Monto</label>
                      <SelectNative name="amount_idx" required>
                        {csvHeaders.map((h, i) => <option key={`amount-${i}`} value={i}>{h}</option>)}
                      </SelectNative>
                    </div>
                    <p className="text-xs text-blue-600">Asegúrate de que los gastos tengan un signo negativo (-) en la columna de monto.</p>
                  </div>
                )}

                <Button type="submit" disabled={isSubmitting} className="h-11 w-full rounded-xl bg-emerald-600 text-white shadow-sm hover:bg-emerald-700">
                  {isSubmitting ? "Importando..." : "Importar archivo"}
                </Button>
              </Form>
            ) : (
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

        <SelectNative name="category_id">
          <option value="">Sin categoría</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </SelectNative>
        <Input type="date" name="date" defaultValue={new Date().toISOString().split('T')[0]} required />
        
        {shareDivisor > 1 && (
          <div className="flex items-center gap-2 px-1 py-1">
            <input type="checkbox" id="apply_division" name="apply_division" value="true" defaultChecked className="size-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
            <label htmlFor="apply_division" className="text-sm font-medium text-slate-700">
              Dividir automáticamente entre {shareDivisor} personas
            </label>
          </div>
        )}
        
          <Button type="submit" disabled={isSubmitting} className="h-11 w-full rounded-xl bg-blue-600 text-white shadow-sm hover:bg-blue-700">
            Registrar movimiento
          </Button>
        </Form>
            )}
          </CardContent>
        </Card>
      )}

      {(!hasActiveCycles || showNewCycle) ? (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Icon icon="ph:plus-circle" className="size-5 text-blue-600" /> Abrir ciclo
                </CardTitle>
                <CardDescription>Crea un periodo para registrar ingresos y gastos.</CardDescription>
              </div>
              {hasActiveCycles && (
                <Button variant="ghost" size="sm" onClick={() => setShowNewCycle(false)} className="h-8 w-8 p-0 rounded-full">
                  <Icon icon="ph:x" className="size-4" />
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <Form method="post" className="space-y-4">
              <input type="hidden" name="_intent" value="create_cycle" />
              <Input type="text" name="name" placeholder="Ej. Junio 2026" required />
              <Input type="date" name="start_date" required />
              <Button type="submit" disabled={isSubmitting} className="h-11 w-full rounded-xl bg-blue-600 text-white shadow-sm hover:bg-blue-700">
                Iniciar ciclo
              </Button>
            </Form>
          </CardContent>
        </Card>
      ) : (
        <Button variant="outline" onClick={() => setShowNewCycle(true)} className="w-full border-dashed text-slate-500 bg-white hover:text-slate-900">
          <Icon icon="ph:plus" className="mr-2 size-4" /> Abrir otro ciclo simultáneo
        </Button>
      )}
    </div>
  );
}