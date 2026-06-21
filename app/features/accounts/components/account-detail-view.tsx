import { useMemo } from "react";
import { Link } from "react-router";
import { ArrowLeft } from "lucide-react";
import { Icon } from "@iconify/react";
import { Button } from "~/components/ui/button";

import { DashboardLayout } from "~/components/layout/dashboard-layout";
import { AlertCenterPanel } from "~/components/ui/alert-center-panel";
import { AccountHeader } from "~/features/accounts/components/account-header";
import { CycleManager } from "~/features/cycles/components/cycle-manager";
import { CycleHistory } from "~/features/cycles/components/cycle-history";
import { useAccountActionFeedback } from "~/features/accounts/hooks/use-account-action-feedback";
import { usePersistentAlertCenter } from "~/hooks/use-persistent-alert-center";
import { FormError } from "~/components/ui/form-error";
import type { AccountDetailViewProps } from "~/types";
import { usePrivacy } from "~/hooks/use-privacy";
import { exportTransactionsToPDF } from "~/utils/pdf-export.client";

export function AccountDetailView({
  userEmail,
  wallet,
  cycles,
  categories,
  budgets,
  otherWallets,
  rates,
  actionData,
  actionError,
  isSubmitting,
}: AccountDetailViewProps) {
  const activeCycles = useMemo(
    () => cycles.filter((cycle) => !cycle.is_closed),
    [cycles],
  );

  const currentBalance = Number(wallet.current_balance || 0);

  const {
    alerts,
    unreadCount,
    isOpen,
    addAlert,
    clearAll,
    dismissAlert,
    toggleOpen,
  } = usePersistentAlertCenter(`account-alerts:${userEmail}`);
  const { isPrivate, togglePrivacy } = usePrivacy();

  const handleExportPDF = () => {
    // Juntamos todos los movimientos de todos los ciclos y les inyectamos los nombres de etiquetas
    const allTransactions = cycles.flatMap(c => c.transactions || []).map(tx => ({
      ...tx,
      categories: { name: categories?.find(cat => cat.id === tx.category_id)?.name },
      budgets: { name: budgets?.find(b => b.id === tx.budget_id)?.name }
    }));
    exportTransactionsToPDF(allTransactions, wallet.name, wallet.currency || "EUR");
  };

  useAccountActionFeedback({ actionData, actionError, isSubmitting, onFeedback: addAlert });

  return (
    <DashboardLayout userEmail={userEmail}>
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <FormError error={actionError} />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            to="/dashboard/cuentas"
            className="inline-flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Mis Cuentas
          </Link>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleExportPDF} className="rounded-xl border-border bg-background text-foreground hover:bg-muted h-10" title="Descargar todos los movimientos en PDF">
            <Icon icon="ph:file-pdf-duotone" className="size-4 sm:mr-2 text-red-500" />
            <span className="hidden sm:inline">Exportar PDF</span>
          </Button>
          <Button variant="outline" onClick={togglePrivacy} className="rounded-xl border-border bg-background text-foreground hover:bg-muted h-10">
            <Icon icon={isPrivate ? "ph:eye-slash-duotone" : "ph:eye-duotone"} className="size-4 sm:mr-2" />
            <span className="hidden sm:inline">{isPrivate ? "Mostrar" : "Ocultar"}</span>
          </Button>
          <AlertCenterPanel
            alerts={alerts}
            unreadCount={unreadCount}
            isOpen={isOpen}
            onToggle={toggleOpen}
            onClearAll={clearAll}
            onDismissAlert={dismissAlert}
          />
        </div>
        </div>

        <AccountHeader
          name={wallet.name}
          isLiability={wallet.is_liability}
          targetAmount={wallet.target_amount}
          currentBalance={currentBalance}
          currency={wallet.currency}
        />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-1">
            <CycleManager 
              activeCycles={activeCycles} 
              isSubmitting={isSubmitting} 
              shareDivisor={wallet.share_divisor} 
              categories={categories} 
              budgets={budgets}
              otherWallets={otherWallets}
              rates={rates}
              currentCurrency={wallet.currency}
            />
          </div>

          <div className="lg:col-span-2">
            <CycleHistory cycles={cycles} categories={categories} budgets={budgets} currency={wallet.currency} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}