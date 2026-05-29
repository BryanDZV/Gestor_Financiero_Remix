import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatMoney(value: number, currency: string = 'EUR') {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: currency,
  }).format(value);
}

export function formatDate(value: string | Date, locale = "es-ES") {
  const date = value instanceof Date ? value : new Date(value);
  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export function getBalanceColor(balance: number, isLiability: boolean = false) {
  if (isLiability) return "text-red-600";
  if (balance > 0) return "text-emerald-600";
  if (balance < 0) return "text-red-600";
  return "text-slate-900";
}
