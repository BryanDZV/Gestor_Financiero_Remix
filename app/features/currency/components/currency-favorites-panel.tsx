import { useMemo, useState } from "react";
import { Form, useNavigation } from "react-router";
import { Plus, Star, X } from "lucide-react";

import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { SelectNative } from "~/components/ui/select-native";
import { formatMoney } from "~/lib/utils";
import type { CurrencyOption, ExchangeRatesSnapshot } from "~/types/models";
import { convertAmount, orderCurrencyOptions } from "~/utils/currency";

interface CurrencyFavoritesPanelProps {
  snapshot: ExchangeRatesSnapshot;
  options: CurrencyOption[];
  favorites: string[];
}

export function CurrencyFavoritesPanel({ snapshot, options, favorites }: CurrencyFavoritesPanelProps) {
  const navigation = useNavigation();
  const orderedOptions = useMemo(() => orderCurrencyOptions(options), [options]);
  const [selectedCode, setSelectedCode] = useState(orderedOptions[0]?.code || snapshot.base);

  const favoriteOptions = orderedOptions.filter((option) => favorites.includes(option.code));
  const isSubmitting = navigation.state !== "idle";

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Star className="size-5 text-amber-500" />
            Monedas favoritas
          </CardTitle>
          <p className="text-sm text-muted-foreground">Se guardan en Supabase por usuario y aparecen en cualquier dispositivo.</p>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <Form method="post" className="grid gap-3 sm:grid-cols-[1fr_auto]">
          <input type="hidden" name="_intent" value="add_favorite" />
          <div className="space-y-2">
            <label htmlFor="currency_code" className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Agregar moneda</label>
            <SelectNative id="currency_code" name="currency_code" value={selectedCode} onChange={(event) => setSelectedCode(event.target.value)}>
              {orderedOptions.map((option) => (
                <option key={option.code} value={option.code}>
                  {option.code} - {option.name}
                </option>
              ))}
            </SelectNative>
          </div>
          <div className="flex items-end">
            <Button type="submit" disabled={isSubmitting} className="h-11 w-full rounded-xl bg-blue-600 text-white shadow-sm hover:bg-blue-700 sm:w-auto">
              <Plus className="mr-2 size-4" />
              Añadir
            </Button>
          </div>
        </Form>

        {favorites.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {favoriteOptions.map((option) => (
              <Form key={option.code} method="post">
                <input type="hidden" name="_intent" value="remove_favorite" />
                <input type="hidden" name="currency_code" value={option.code} />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-sm font-medium text-amber-800 transition hover:bg-amber-100 disabled:opacity-50"
                >
                  <Star className="size-4 fill-current" />
                  {option.code}
                  <X className="size-3.5" />
                </button>
              </Form>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Aún no has guardado monedas favoritas. Usa el selector para empezar.</p>
        )}

        {favoriteOptions.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {favoriteOptions.map((option) => {
              const converted = convertAmount(snapshot, 100, snapshot.base, option.code);

              return (
                <div key={option.code} className="rounded-2xl border border-border bg-muted/50 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Favorita</p>
                      <h2 className="mt-1 text-lg font-semibold text-foreground">{option.code}</h2>
                    </div>
                    <Form method="post">
                      <input type="hidden" name="_intent" value="remove_favorite" />
                      <input type="hidden" name="currency_code" value={option.code} />
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="rounded-full border border-border bg-background p-2 text-muted-foreground transition hover:text-foreground hover:bg-muted disabled:opacity-50"
                        aria-label={`Eliminar ${option.code} de favoritas`}
                      >
                        <X className="size-4" />
                      </button>
                    </Form>
                  </div>
                  <p className="mt-4 text-sm text-muted-foreground">{option.name}</p>
                  <p className="mt-3 text-2xl font-semibold tabular-nums text-foreground">
                    {converted === null ? "--" : formatMoney(converted, option.code)}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">Equivalente a 100 {snapshot.base}</p>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
