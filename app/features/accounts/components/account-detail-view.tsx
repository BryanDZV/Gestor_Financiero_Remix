import { useMemo, useEffect } from "react";
import { Link } from "react-router";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import { DashboardLayout } from "~/components/layout/dashboard-layout";
import { AccountHeader } from "~/features/accounts/components/account-header";
import { CycleManager } from "~/features/cycles/components/cycle-manager";
import { CycleHistory } from "~/features/cycles/components/cycle-history";
import { FormError } from "~/components/ui/form-error";
import type { AccountDetailViewProps } from "~/types";

export function AccountDetailView({
  userEmail,
  wallet,
  cycles,
  categories,
  otherWallets,
  actionData,
  actionError,
  isSubmitting,
}: AccountDetailViewProps) {
  const activeCycles = useMemo(
    () => cycles.filter((cycle) => !cycle.is_closed),
    [cycles],
  );
//use memO
  const currentBalance = useMemo(() => {
    const allTransactions = cycles.flatMap((cycle) => cycle.transactions || []);

    const netChange = allTransactions.reduce((acc, transaction) => {
      const isIncome = transaction.type === "income";
      const amount = Number(transaction.amount);

      if (wallet.is_liability) {
        return isIncome ? acc - amount : acc + amount;
      }

      return isIncome ? acc + amount : acc - amount;
    }, 0);

    return Number(wallet.initial_balance) + netChange;
  }, [cycles, wallet.initial_balance, wallet.is_liability]);

  useEffect(() => {
    if (!isSubmitting && actionData?.success && actionData?.intent === "add_transaction") {
      if (actionData.warning) {
        toast.warning(actionData.warning, { duration: 8000 });
      } else {
        toast.success("Movimiento registrado correctamente");
      }
    }
  }, [isSubmitting, actionData]);

  return (
    <DashboardLayout userEmail={userEmail}>
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <FormError error={actionError} />

        <Link
          to="/dashboard/cuentas"
          className="inline-flex items-center text-sm font-medium text-slate-500 transition-colors hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Mis Cuentas
        </Link>

        <AccountHeader
          name={wallet.name}
          isLiability={wallet.is_liability}
          targetAmount={wallet.target_amount}
          currentBalance={currentBalance}
          currency={wallet.currency}
        />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-1">
            <CycleManager activeCycles={activeCycles} isSubmitting={isSubmitting} shareDivisor={wallet.share_divisor} categories={categories} otherWallets={otherWallets} />
          </div>

          <div className="lg:col-span-2">
            <CycleHistory cycles={cycles} categories={categories} currency={wallet.currency} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}