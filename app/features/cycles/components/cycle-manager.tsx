import { Form, useActionData, useNavigation } from "react-router";
import { useEffect, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Input } from "~/components/ui/input";
import { SelectNative } from "~/components/ui/select-native";
import type { CycleManagerProps } from "~/types";

export function CycleManager({ activeCycles, isSubmitting, shareDivisor = 1, categories = [], otherWallets = [] }: CycleManagerProps) {
  const actionData = useActionData<any>();
  const navigation = useNavigation();
  const formRef = useRef<HTMLFormElement>(null);
  const [showNewCycle, setShowNewCycle] = useState(false);
  const [txType, setTxType] = useState("expense");

  useEffect(() => {
    if (navigation.state === "idle" && actionData?.success) {
      if (actionData?.intent === "add_transaction") {
        formRef.current?.reset();
        setTxType("expense");
      }
      if (actionData?.intent === "create_cycle") {
        setShowNewCycle(false);
      }
    }
  }, [navigation.state, actionData]);

  const hasActiveCycles = activeCycles && activeCycles.length > 0;

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
          </CardHeader>
          <CardContent>
            <Form ref={formRef} method="post" className="space-y-4 border-t border-slate-200 pt-5">
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
              <Input type="number" step="0.01" name="amount" placeholder="Monto" required className="tabular-nums" />
              <SelectNative name="type" value={txType} onChange={(e) => setTxType(e.target.value)}>
          <option value="expense">Gasto / Cargo</option>
          <option value="income">Ingreso / Abono</option>
          <option value="transfer">Transferencia</option>
        </SelectNative>

        {txType === "transfer" && (
          <div className="space-y-1 animate-in fade-in slide-in-from-top-1">
            <label className="text-xs font-medium text-slate-500">¿A qué cuenta enviarás el dinero?</label>
            <SelectNative name="destination_wallet_id" required>
              <option value="">Selecciona la cuenta destino...</option>
              {otherWallets.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
            </SelectNative>
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