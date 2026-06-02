import { formatMoney, getBalanceColor } from "~/lib/utils";
import type { WalletCardProps } from "~/types";
import { PrivacyBlur } from "~/components/ui/privacy-blur";

export function WalletCard({ name, type, balance, initialBalance, isLiability = false, currency = 'EUR' }: WalletCardProps) {
  // Diccionario para traducir visualmente los tipos de cuenta
  const typeLabels: Record<string, string> = {
    bank: "Cuenta Bancaria",
    cash: "Efectivo",
    credit: "Tarjeta de Crédito",
    investment: "Inversión",
  };

  const balanceClass = getBalanceColor(balance, isLiability);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{typeLabels[type] || type}</p>
      <h2 className="mt-2 text-lg font-semibold tracking-tight text-slate-900">{name}</h2>
      <div className="mt-4 flex flex-col gap-1">
        {initialBalance !== undefined && (
          <p className="text-xs font-medium text-slate-500">
            {isLiability ? "Pasivo inicial:" : "Activo inicial:"} <span className="tabular-nums"><PrivacyBlur>{formatMoney(initialBalance, currency)}</PrivacyBlur></span>
          </p>
        )}
        <div className="flex items-baseline gap-2">
          {initialBalance !== undefined && <span className="text-sm font-medium text-slate-500">Saldo real:</span>}
          <p className={`text-2xl font-semibold tracking-tight tabular-nums ${balanceClass}`}>
            <PrivacyBlur>
              {formatMoney(balance, currency)}
            </PrivacyBlur>
          </p>
        </div>
      </div>
    </div>
  );
}