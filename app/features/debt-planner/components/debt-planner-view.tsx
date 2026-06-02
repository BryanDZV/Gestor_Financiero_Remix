import { useState, useMemo } from "react";
import { Icon } from "@iconify/react";
import { DashboardLayout } from "~/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { SelectNative } from "~/components/ui/select-native";
import { formatMoney } from "~/lib/utils";
import { PageHeader } from "~/components/ui/page-header";
import type { DebtPlannerViewProps } from "~/types";

export function DebtPlannerView({ userEmail, currencyOptions = ["EUR", "USD", "GBP", "MXN"] }: DebtPlannerViewProps) {
  const [debtAmount, setDebtAmount] = useState<number | "">("");
  const [monthlyPayment, setMonthlyPayment] = useState<number | "">("");
  const [interestRate, setInterestRate] = useState<number | "">("");
  const [monthlyFee, setMonthlyFee] = useState<number | "">("");
  const [currency, setCurrency] = useState("EUR");

  const balance = Number(debtAmount);
  const payment = Number(monthlyPayment);
  const rate = Number(interestRate);
  const fee = Number(monthlyFee);
  
  const hasValidBalance = balance > 0;
  const hasValidPayment = payment > 0;
  
  // Memoizamos el cálculo pesado de proyección de la deuda
  const { monthsToPay, isPaymentTooSmall, totalInterest, totalFees } = useMemo(() => {
    let mToPay = 0;
    let tooSmall = false;
    let tInterest = 0;
    let tFees = 0;

    if (hasValidBalance && hasValidPayment) {
      const monthlyRate = rate > 0 ? (rate / 100) / 12 : 0;
      const fixedFee = fee > 0 ? fee : 0;
        
      if (payment <= (balance * monthlyRate) + fixedFee) {
        tooSmall = true;
      } else {
        let currentBalance = balance;
        
        while (currentBalance > 0 && mToPay < 1200) {
          const interest = currentBalance * monthlyRate;
          tInterest += interest;
          tFees += fixedFee;
          
          const principal = payment - interest - fixedFee;
          
          if (currentBalance < principal) {
            currentBalance = 0;
          } else {
            currentBalance -= principal;
          }
          mToPay++;
        }
      }
    }
    return { monthsToPay: mToPay, isPaymentTooSmall: tooSmall, totalInterest: tInterest, totalFees: tFees };
  }, [balance, payment, rate, fee, hasValidBalance, hasValidPayment]);

  const projectedDate = new Date();
  if (hasValidPayment && !isPaymentTooSmall && monthsToPay > 0) {
    projectedDate.setMonth(projectedDate.getMonth() + monthsToPay);
  }
  const projectedMonth = projectedDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' });

  return (
    <DashboardLayout userEmail={userEmail}>
      <div className="mx-auto max-w-5xl space-y-8 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <header className="flex flex-col gap-4 border-b border-slate-200 pb-6">
          <PageHeader 
            supertitle="Herramientas" 
            title="Planificador de Deudas" 
            description="Simula distintos escenarios de pago y descubre exactamente cuánto tiempo y dinero te ahorrarás." 
          />
        </header>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <Card className="lg:col-span-5 h-fit shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Datos de la deuda</CardTitle>
              <CardDescription>Ingresa los datos para proyectar tu futuro financiero.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="debtAmount" className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">Saldo Total Deudor</label>
                <Input id="debtAmount" type="number" step="0.01" placeholder="Ej. 10000.00" value={debtAmount} onChange={(e) => setDebtAmount(e.target.value ? Number(e.target.value) : "")} className="tabular-nums font-medium text-lg border-slate-200 focus-visible:ring-indigo-500/20" />
              </div>
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label htmlFor="monthlyPayment" className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">Cuota mensual a pagar</label>
                <Input id="monthlyPayment" type="number" step="0.01" placeholder="Ej. 250.00" value={monthlyPayment} onChange={(e) => setMonthlyPayment(e.target.value ? Number(e.target.value) : "")} className="tabular-nums border-slate-200 focus-visible:ring-indigo-500/20" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="interestRate" className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">T.I.N. Anual (%)</label>
                  <Input id="interestRate" type="number" step="0.01" placeholder="Ej. 5.5" value={interestRate} onChange={(e) => setInterestRate(e.target.value ? Number(e.target.value) : "")} className="tabular-nums border-slate-200 focus-visible:ring-indigo-500/20" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="monthlyFee" className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-600" title="Seguros, mantenimiento, etc.">Comisiones / mes</label>
                  <Input id="monthlyFee" type="number" step="0.01" placeholder="Ej. 12.00" value={monthlyFee} onChange={(e) => setMonthlyFee(e.target.value ? Number(e.target.value) : "")} className="tabular-nums border-slate-200 focus-visible:ring-indigo-500/20" />
                </div>
              </div>
              <div className="space-y-2 pt-2 border-t border-slate-100 mt-2">
                 <label htmlFor="currency" className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">Moneda</label>
                 <SelectNative id="currency" value={currency} onChange={(e) => setCurrency(e.target.value)}>
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
            </CardContent>
          </Card>

          <div className="lg:col-span-7">
            {!hasValidBalance ? (
              <Card className="h-full flex flex-col items-center justify-center border-dashed p-8 text-center text-slate-500 bg-slate-50/50 min-h-75">
                <Icon icon="ph:calculator-duotone" className="size-12 text-slate-300 mb-4" />
                <p>Ingresa el saldo de tu deuda para comenzar a calcular.</p>
              </Card>
            ) : isPaymentTooSmall ? (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="p-6 flex items-start gap-4">
                  <Icon icon="ph:warning-circle-fill" className="size-8 text-red-500 shrink-0 mt-1" />
                  <div>
                    <h2 className="font-semibold text-red-900">Cuota insuficiente</h2>
                    <p className="mt-1 text-sm text-red-800">Tu cuota de <span className="font-semibold">{formatMoney(payment, currency)}</span> no alcanza para cubrir los intereses y comisiones generados este mes ({formatMoney((balance * (rate > 0 ? (rate / 100) / 12 : 0)) + fee, currency)}). La deuda seguirá creciendo mes a mes hacia el infinito.</p>
                  </div>
                </CardContent>
              </Card>
            ) : hasValidPayment ? (
              <Card className="border-indigo-100 bg-indigo-50/50 overflow-hidden relative h-full min-h-75 flex flex-col justify-center">
                <div className="absolute top-0 right-0 p-32 bg-indigo-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                <CardContent className="p-8 relative z-10 space-y-8">
                  <div>
                    <p className="text-sm font-medium text-indigo-900/80 uppercase tracking-widest">Resultado de proyección</p>
                    <h2 className="mt-2 text-5xl font-bold tracking-tight text-indigo-950">{monthsToPay} {monthsToPay === 1 ? 'mes' : 'meses'}</h2>
                    <p className="mt-3 flex items-center text-base font-medium text-indigo-700"><Icon icon="ph:calendar-check-duotone" className="mr-2 size-6" /> Serás libre de esta deuda en {projectedMonth}</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-indigo-200/60 pt-6">
                    <div className="bg-white/60 p-4 rounded-2xl"><p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Intereses</p><p className="text-xl font-bold text-slate-800">{formatMoney(totalInterest, currency)}</p></div>
                    <div className="bg-white/60 p-4 rounded-2xl"><p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Comisiones</p><p className="text-xl font-bold text-slate-800">{formatMoney(totalFees, currency)}</p></div>
                    <div className="bg-white/60 p-4 rounded-2xl border border-indigo-100"><p className="text-xs font-semibold text-indigo-500 uppercase tracking-wider mb-1">Coste Real</p><p className="text-xl font-bold text-indigo-700">{formatMoney(balance + totalInterest + totalFees, currency)}</p></div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="h-full flex flex-col items-center justify-center border-dashed p-8 text-center text-slate-500 bg-slate-50/50 min-h-75">
                <Icon icon="ph:coin-duotone" className="size-12 text-slate-300 mb-4" />
                <p>Ingresa una cuota mensual para ver en cuánto tiempo liquidarás la deuda.</p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}