// app/utils/currency.ts
import type { CurrencyOption, ExchangeRatesSnapshot } from "~/types/models";

export const COMMON_CURRENCY_CODES = ["EUR", "USD", "GBP", "MXN", "ARS", "COP", "CLP", "PEN", "CAD", "CHF"] as const;

export function orderCurrencyOptions(options: CurrencyOption[]) {
  const common = COMMON_CURRENCY_CODES
    .map((code) => options.find((option) => option.code === code))
    .filter((option): option is CurrencyOption => Boolean(option));

  const remaining = options.filter((option) => !COMMON_CURRENCY_CODES.includes(option.code as (typeof COMMON_CURRENCY_CODES)[number]));
  return [...common, ...remaining];
}

export function getCrossRate(snapshot: ExchangeRatesSnapshot, fromCurrency: string, toCurrency: string) {
  const fromRate = fromCurrency === snapshot.base ? 1 : snapshot.rates[fromCurrency];
  const toRate = toCurrency === snapshot.base ? 1 : snapshot.rates[toCurrency];

  if (!fromRate || !toRate) return null;

  return toRate / fromRate;
}

export function convertAmount(snapshot: ExchangeRatesSnapshot, amount: number, fromCurrency: string, toCurrency: string) {
  const rate = getCrossRate(snapshot, fromCurrency, toCurrency);
  return rate === null ? null : amount * rate;
}
