import { useState, useMemo } from "react";
import { Icon } from "@iconify/react";
import { DashboardLayout } from "~/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { formatMoney, formatDate } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import { TransactionAmount } from "~/components/ui/transaction-amount";
import { usePrivacy } from "~/hooks/use-privacy";
import { PrivacyBlur } from "~/components/ui/privacy-blur";
import type { DashboardViewProps } from "~/types";

export function DashboardView({ userEmail, wallets, transactions }: DashboardViewProps) {
  const [showTransactions, setShowTransactions] = useState(false);
  const { isPrivate, togglePrivacy } = usePrivacy();

  // Calculamos el patrimonio separado por moneda USE MEMO
  const totalsByCurrency = useMemo(() => {
    const totals: Record<string, { assets: number, liabilities: number, netWorth: number }> = {};
    
    wallets.forEach(w => {
      const c = w.currency || 'EUR';
      if (!totals[c]) totals[c] = { assets: 0, liabilities: 0, netWorth: 0 };
      
      if (w.is_liability) totals[c].liabilities += w.current_balance;
      else totals[c].assets += w.current_balance;
      
      totals[c].netWorth = totals[c].assets - totals[c].liabilities;
    });
    
    const results = Object.entries(totals).map(([currency, data]) => ({ currency, ...data }));
    return results.length > 0 ? results : [{ currency: 'EUR', assets: 0, liabilities: 0, netWorth: 0 }];
  }, [wallets]);

  return (
    <DashboardLayout userEmail={userEmail}>
      <div className="mx-auto max-w-6xl space-y-8 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-6 gap-4">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Resumen General</h1>
          <Button variant="outline" onClick={togglePrivacy} className="w-full sm:w-auto rounded-xl bg-white text-slate-700">
            <Icon icon={isPrivate ? "ph:eye-slash-duotone" : "ph:eye-duotone"} className="size-5 mr-2" />
            {isPrivate ? "Mostrar saldos" : "Ocultar saldos"}
          </Button>
        </header>

        {/* TARJETAS DE PATRIMONIO POR MONEDA */}
        <div className="space-y-8">
          {totalsByCurrency.map(({ currency, assets, liabilities, netWorth }) => (
            <div key={currency} className="space-y-4">
              {totalsByCurrency.length > 1 && (
                <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-500 border-b border-slate-200 pb-2">
                  Patrimonio en {currency}
                </h2>
              )}

              <Card className="overflow-hidden border-slate-200 shadow-sm relative">
                {/* Elemento de diseño de fondo sutil */}
                <div className="absolute -right-12 -top-12 size-40 rounded-full bg-blue-500/5 blur-2xl pointer-events-none"></div>
                
                <CardContent className="p-6 sm:p-8">
                  <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between relative z-10">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500 mb-1.5 flex items-center gap-2">
                        Patrimonio Neto 
                        <span title="Liquidez Total - Deuda Total = Tu riqueza real" className="flex">
                          <Icon icon="ph:info" className="size-4 text-slate-400" />
                        </span>
                      </p>
                      <h2 className={`text-4xl sm:text-5xl font-bold tracking-tight ${netWorth < 0 ? 'text-red-600' : 'text-slate-900'}`}>
                        <PrivacyBlur>{formatMoney(netWorth, currency)}</PrivacyBlur>
                      </h2>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-6 gap-y-4 rounded-2xl bg-slate-50 p-4 border border-slate-100">
                      <div>
                        <p className="text-xs font-medium text-slate-500 flex items-center gap-1.5 uppercase tracking-wider mb-1"><Icon icon="ph:wallet-duotone" className="size-4 text-emerald-500" /> Liquidez Total</p>
                        <p className="text-xl font-semibold text-slate-800"><PrivacyBlur>{formatMoney(assets, currency)}</PrivacyBlur></p>
                      </div>
                      <div className="w-px h-8 bg-slate-200 hidden sm:block"></div>
                      <div>
                        <p className="text-xs font-medium text-slate-500 flex items-center gap-1.5 uppercase tracking-wider mb-1"><Icon icon="ph:credit-card-duotone" className="size-4 text-red-500" /> Deuda Total</p>
                        <p className="text-xl font-semibold text-slate-800"><PrivacyBlur>{formatMoney(liabilities, currency)}</PrivacyBlur></p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex h-2.5 w-full overflow-hidden rounded-full bg-slate-100 relative z-10" title="Proporción Activos vs Pasivos">
                    {(assets > 0 || liabilities > 0) && <div style={{ width: `${(assets / (assets + liabilities)) * 100}%` }} className="bg-emerald-500 transition-all duration-1000 ease-out"></div>}
                    {(assets > 0 || liabilities > 0) && <div style={{ width: `${(liabilities / (assets + liabilities)) * 100}%` }} className="bg-red-500 transition-all duration-1000 ease-out"></div>}
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        {/* LISTADO DE CUENTAS RAPIDO */}
        <div className="space-y-4 pt-4 border-t border-slate-200">
          <h2 className="text-lg font-semibold tracking-tight text-slate-900">Tus Cuentas</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {wallets.map(w => (
              <Card key={w.id} className="hover:border-slate-300 transition-colors">
                <CardContent className="p-5">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-slate-900 line-clamp-1">{w.name}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{w.is_liability ? 'Pasivo / Deuda' : 'Activo / Liquidez'}</p>
                    </div>
                    <Icon icon={w.is_liability ? "ph:credit-card-duotone" : "ph:wallet-duotone"} className={`size-6 shrink-0 ${w.is_liability ? 'text-red-500' : 'text-emerald-500'}`} />
                  </div>
                  <p className="mt-4 text-2xl font-bold tracking-tight text-slate-800">
                    <PrivacyBlur>{formatMoney(w.current_balance, w.currency)}</PrivacyBlur>
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* ACORDEÓN DE ÚLTIMOS MOVIMIENTOS */}
        <div className="pt-6 border-t border-slate-200">
          <Button 
            variant="outline" 
            onClick={() => setShowTransactions(!showTransactions)}
            className="w-full sm:w-auto flex items-center gap-2 rounded-xl text-slate-600 hover:text-slate-900 bg-white"
          >
            <Icon icon="ph:clock-counter-clockwise" className="size-4" />
            {showTransactions ? "Ocultar últimos movimientos" : "Ver últimos movimientos"}
            <Icon icon={showTransactions ? "ph:caret-up" : "ph:caret-down"} className="size-4 ml-1" />
          </Button>

          {showTransactions && (
            <Card className="mt-4 animate-in fade-in slide-in-from-top-2 border-slate-200">
              <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50">
                <CardTitle className="text-base flex items-center gap-2 text-slate-700">
                  <Icon icon="ph:list-dashes" className="size-5" /> Historial Reciente (Top 10)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {transactions.length === 0 ? (
                  <div className="p-6 text-center text-sm text-slate-500">No hay movimientos recientes registrados en ninguna de tus cuentas.</div>
                ) : (
                  <ul className="divide-y divide-slate-100">
                    {transactions.map(tx => (
                      <li key={tx.id} className="flex flex-col gap-2 p-4 hover:bg-slate-50 transition-colors sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-sm font-medium text-slate-900">{tx.concept}</p>
                          <div className="flex items-center flex-wrap gap-2 mt-1 text-xs text-slate-500">
                            <span className="flex items-center">
                              <Icon icon="ph:calendar-blank" className="mr-1 size-3.5" />
                              {formatDate(tx.date)}
                            </span>
                            {tx.wallets?.name && (
                              <>
                                <span className="w-1 h-1 rounded-full bg-slate-300 hidden sm:block"></span>
                                <span className="flex items-center font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                                  <Icon icon="ph:wallet" className="mr-1 size-3.5"/> 
                                  {tx.wallets.name}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                        <PrivacyBlur>
                          <TransactionAmount amount={tx.amount} type={tx.type} currency={tx.wallets?.currency} className="text-sm text-left sm:text-right" />
                        </PrivacyBlur>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}