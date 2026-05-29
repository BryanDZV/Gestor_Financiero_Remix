import { useEffect } from "react";
import { useRevalidator } from "react-router";

import { DashboardLayout } from "~/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { EmptyState } from "~/components/ui/empty-state";
import { PageHeader } from "~/components/ui/page-header";
import { CurrencyConverter } from "~/features/currency/components/currency-converter";
import { CurrencyFavoritesPanel } from "./currency-favorites-panel";
import type { CurrencyOption, ExchangeRatesSnapshot } from "~/types/models";

interface CurrencyViewProps {
  userEmail: string;
  snapshot: ExchangeRatesSnapshot | null;
  options: CurrencyOption[];
  favorites: string[];
  error?: string;
  actionError?: string;
  fetchedAt?: string;
}

export function CurrencyView({ userEmail, snapshot, options, favorites, error, actionError, fetchedAt }: CurrencyViewProps) {
  const revalidator = useRevalidator();

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      revalidator.revalidate();
    }, 60_000);

    return () => window.clearInterval(intervalId);
  }, [revalidator]);

  const lastUpdatedLabel = fetchedAt
    ? new Intl.DateTimeFormat("es-ES", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(fetchedAt))
    : "hace un momento";

  return (
    <DashboardLayout userEmail={userEmail}>
      <div className="mx-auto max-w-6xl space-y-8 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <header className="space-y-4 border-b border-slate-200 pb-6">
          <PageHeader
            supertitle="Divisas"
            title="Conversor en vivo"
            description="Convierte entre monedas usando tasas reales de una API pública y actualízalas automáticamente en segundo plano."
          />
        </header>

        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-6 text-sm text-red-700">
              <p className="font-semibold">No se pudieron cargar las tasas.</p>
              <p className="mt-1">{error}</p>
            </CardContent>
          </Card>
        )}

        {actionError && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-6 text-sm text-red-700">
              <p className="font-semibold">No se pudo actualizar una favorita.</p>
              <p className="mt-1">{actionError}</p>
            </CardContent>
          </Card>
        )}

        {snapshot ? (
          <div className="space-y-6">
            <CurrencyConverter
              snapshot={snapshot}
              options={options}
              onRefresh={() => revalidator.revalidate()}
              lastUpdatedLabel={lastUpdatedLabel}
            />

            <CurrencyFavoritesPanel snapshot={snapshot} options={options} favorites={favorites} />
          </div>
        ) : (
          <EmptyState message="No hay tasas disponibles en este momento." />
        )}
      </div>
    </DashboardLayout>
  );
}
