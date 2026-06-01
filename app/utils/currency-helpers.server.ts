import { fetchCurrencyOptions } from "~/utils/exchange-rates.server";

/**
 * Centraliza la obtención de la lista plana de monedas disponibles para los loaders.
 */
export async function getCurrencyOptionsList(): Promise<string[]> {
  let currencyOptions: string[] = ["EUR", "USD", "GBP", "MXN"];
  try {
    const options = await fetchCurrencyOptions();
    if (options && options.length > 0) currencyOptions = options.map(o => o.code);
  } catch (e) {
    console.error("Error al obtener opciones de moneda:", e);
  }
  return currencyOptions;
}