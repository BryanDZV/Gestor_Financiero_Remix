import { useEffect, useMemo, useState } from "react";
import { ArrowRightLeft, RefreshCw, TrendingUp } from "lucide-react";

import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { SelectNative } from "~/components/ui/select-native";
import { formatMoney } from "~/lib/utils";
import type { CurrencyOption, ExchangeRatesSnapshot } from "~/types/models";
import { convertAmount, orderCurrencyOptions } from "~/utils/currency";

interface CurrencyConverterProps {
  snapshot: ExchangeRatesSnapshot;
  options: CurrencyOption[];
  onRefresh: () => void;
  lastUpdatedLabel: string;
}

export function CurrencyConverter({ snapshot, options, onRefresh, lastUpdatedLabel }: CurrencyConverterProps) {
  const orderedOptions = useMemo(() => orderCurrencyOptions(options), [options]);

  const defaultFrom = snapshot.base || orderedOptions[0]?.code || "EUR";
  const defaultTo = orderedOptions.find((option) => option.code !== defaultFrom)?.code || defaultFrom;

  const [fromCurrency, setFromCurrency] = useState(defaultFrom);
  const [toCurrency, setToCurrency] = useState(defaultTo);
  const [amount, setAmount] = useState<number>(100);

  useEffect(() => {
    if (!orderedOptions.find((option) => option.code === fromCurrency)) {
      setFromCurrency(defaultFrom);
    }
  }, [defaultFrom, fromCurrency, orderedOptions]);

  useEffect(() => {
    if (!orderedOptions.find((option) => option.code === toCurrency)) {
      setToCurrency(defaultTo);
    }
  }, [defaultTo, orderedOptions, toCurrency]);

  const pairRate = useMemo(
    () => {
      const converted = convertAmount(snapshot, 1, fromCurrency, toCurrency);
      return converted === null ? null : converted;
    },
    [fromCurrency, snapshot, toCurrency],
  );

  const convertedAmount = useMemo(
    () => convertAmount(snapshot, amount, fromCurrency, toCurrency),
    [amount, fromCurrency, snapshot, toCurrency],
  );

  const swapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-xl">
            <TrendingUp className="size-5 text-blue-600" />
            Conversor en vivo
          </CardTitle>
          <Button variant="outline" type="button" onClick={onRefresh} className="rounded-xl border-border bg-background text-foreground hover:bg-muted">
            <RefreshCw className="mr-2 size-4" />
            Actualizar tasas
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Tasas obtenidas desde la API pública de Frankfurter. Última actualización: {lastUpdatedLabel}.
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid gap-4 lg:grid-cols-[1fr_auto_1fr] lg:items-end">
          <div className="space-y-2">
            <label htmlFor="amount" className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Monto</label>
            <Input
              id="amount"
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(event) => setAmount(event.target.value === "" ? 0 : Number(event.target.value))}
              className="tabular-nums"
            />
          </div>

          <div className="flex justify-center pb-1 lg:pb-0">
            <Button
              type="button"
              variant="outline"
              onClick={swapCurrencies}
              className="rounded-full border-border bg-background text-foreground hover:bg-muted"
              aria-label="Invertir monedas"
            >
              <ArrowRightLeft className="size-4" />
            </Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="from_currency" className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">De</label>
              <SelectNative id="from_currency" value={fromCurrency} onChange={(event) => setFromCurrency(event.target.value)}>
                {orderedOptions.map((option) => (
                  <option key={option.code} value={option.code}>
                    {option.code} - {option.name}
                  </option>
                ))}
              </SelectNative>
            </div>
            <div className="space-y-2">
              <label htmlFor="to_currency" className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">A</label>
              <SelectNative id="to_currency" value={toCurrency} onChange={(event) => setToCurrency(event.target.value)}>
                {orderedOptions.map((option) => (
                  <option key={option.code} value={option.code}>
                    {option.code} - {option.name}
                  </option>
                ))}
              </SelectNative>
            </div>
          </div>
        </div>

      <div className="rounded-3xl border border-border bg-muted/50 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Resultado</p>
          <p className="mt-3 text-4xl font-semibold tracking-tight text-foreground tabular-nums">
              {convertedAmount === null ? "--" : formatMoney(convertedAmount, toCurrency)}
            </p>
          <p className="mt-2 text-sm text-muted-foreground">
              {pairRate === null
                ? "No se pudo calcular la conversión con las tasas disponibles."
                : `1 ${fromCurrency} = ${pairRate.toFixed(6)} ${toCurrency}`}
            </p>
        </div>
      </CardContent>
    </Card>
  );
}
