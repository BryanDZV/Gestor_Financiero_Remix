// app/utils/exchange-rates.server.ts
import type { CurrencyOption, ExchangeRatesSnapshot } from "~/types/models";

const FRANKFURTER_BASE_URL = "https://api.frankfurter.app";

export async function fetchExchangeRatesSnapshot(base = "EUR"): Promise<ExchangeRatesSnapshot> {
  const response = await fetch(`${FRANKFURTER_BASE_URL}/latest?from=${encodeURIComponent(base)}`);

  if (!response.ok) {
    throw new Error(`No se pudieron cargar las tasas de cambio (${response.status})`);
  }

  const payload = await response.json() as { base: string; date: string; rates: Record<string, number> };

  return {
    base: payload.base,
    date: payload.date,
    rates: payload.rates,
  };
}

export async function fetchCurrencyOptions(): Promise<CurrencyOption[]> {
  const response = await fetch(`${FRANKFURTER_BASE_URL}/currencies`);

  if (!response.ok) {
    throw new Error(`No se pudo cargar el catálogo de monedas (${response.status})`);
  }

  const payload = await response.json() as Record<string, string>;

  return Object.entries(payload)
    .map(([code, name]) => ({ code, name }))
    .sort((a, b) => a.code.localeCompare(b.code));
}
