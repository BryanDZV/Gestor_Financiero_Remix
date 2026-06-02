import { formatMoney, getBalanceColor } from "~/lib/utils";
import { Badge } from "~/components/ui/badge";
import { Progress } from "~/components/ui/progress";
import type { AccountHeaderProps } from "~/types";
import { PrivacyBlur } from "~/components/ui/privacy-blur";

export function AccountHeader({ name, isLiability, targetAmount, currentBalance, currency = 'EUR' }: AccountHeaderProps) {
  const target = Number(targetAmount || 0);
  const balance = Number(currentBalance || 0);
  const balanceClass = getBalanceColor(balance, isLiability);

  // Calculamos el progreso si el usuario estableció una meta
  const hasTarget = target > 0;
  let progress = 0;
  if (hasTarget) {
    if (isLiability) {
      // Para deudas, el progreso es cuánto hemos bajado desde la deuda original (target) hasta el saldo actual
      progress = Math.max(0, Math.min(100, ((target - balance) / target) * 100));
    } else {
      // Para ahorros, el progreso es cuánto nos acercamos a la meta
      progress = Math.max(0, Math.min(100, (balance / target) * 100));
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
              ? hasTarget ? <span>Deuda original: <PrivacyBlur>{formatMoney(target, currency)}</PrivacyBlur></span> : "Cuenta de pasivo / deuda"
              : hasTarget ? <span>Meta a alcanzar: <PrivacyBlur>{formatMoney(target, currency)}</PrivacyBlur></span> : "Cuenta de ahorro / activo"}
          </p>
          
          {hasTarget && (
            <div className="mt-5 max-w-md">
              <div className="mb-1.5 flex justify-between text-xs font-medium text-slate-500">
                <span>Progreso {isLiability ? 'de liquidación' : 'de ahorro'}</span>
                <span className="tabular-nums">{progress.toFixed(1)}%</span>
              </div>
              <Progress 
                value={progress} 
                indicatorClassName={isLiability ? 'bg-amber-500' : 'bg-emerald-500'} 
                className="h-2.5" 
              />
            </div>
          )}
        </div>

        <div className="shrink-0 rounded-2xl bg-slate-50 px-4 py-3 text-left lg:min-w-56 lg:text-right">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Saldo actual</p>
          <p className={`mt-2 text-3xl font-semibold tracking-tight tabular-nums sm:text-4xl ${balanceClass}`}>
            <PrivacyBlur>
              {formatMoney(balance, currency)}
            </PrivacyBlur>
          </p>
        </div>
      </div>
    </header>
  );
}