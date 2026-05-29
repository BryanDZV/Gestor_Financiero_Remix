import { formatMoney, getBalanceColor } from "~/lib/utils";
import { Badge } from "~/components/ui/badge";
import type { AccountHeaderProps } from "~/types";

export function AccountHeader({ name, isLiability, targetAmount, currentBalance, currency = 'EUR' }: AccountHeaderProps) {
  const balanceClass = getBalanceColor(currentBalance, isLiability);

  // Calculamos el progreso si el usuario estableció una meta
  const hasTarget = targetAmount > 0;
  let progress = 0;
  if (hasTarget) {
    if (isLiability) {
      // Para deudas, el progreso es cuánto hemos bajado desde la deuda original (target) hasta el saldo actual
      progress = Math.max(0, Math.min(100, ((targetAmount - currentBalance) / targetAmount) * 100));
    } else {
      // Para ahorros, el progreso es cuánto nos acercamos a la meta
      progress = Math.max(0, Math.min(100, (currentBalance / targetAmount) * 100));
    }
  }

  return (
    <header className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">{name}</h1>
            {isLiability && (
              <Badge variant="warning">
                Pasivo
              </Badge>
            )}
            {hasTarget && !isLiability && (
              <Badge variant="info">
                Meta de Ahorro
              </Badge>
            )}
          </div>
          <p className="mt-2 text-sm text-slate-500">
            {isLiability 
              ? hasTarget ? `Deuda original: ${formatMoney(targetAmount, currency)}` : "Cuenta de pasivo / deuda"
              : hasTarget ? `Meta a alcanzar: ${formatMoney(targetAmount, currency)}` : "Cuenta de ahorro / activo"}
          </p>
          
          {hasTarget && (
            <div className="mt-5 max-w-md">
              <div className="mb-1.5 flex justify-between text-xs font-medium text-slate-500">
                <span>Progreso {isLiability ? 'de liquidación' : 'de ahorro'}</span>
                <span className="tabular-nums">{progress.toFixed(1)}%</span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                <div 
                  className={`h-full rounded-full transition-all duration-700 ease-out ${isLiability ? 'bg-amber-500' : 'bg-emerald-500'}`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="shrink-0 rounded-2xl bg-slate-50 px-4 py-3 text-left lg:min-w-56 lg:text-right">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Saldo actual</p>
          <p className={`mt-2 text-3xl font-semibold tracking-tight tabular-nums sm:text-4xl ${balanceClass}`}>
            {formatMoney(currentBalance, currency)}
          </p>
        </div>
      </div>
    </header>
  );
}