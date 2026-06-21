import type { NormalizedTransaction } from "~/types/bank";

/**
 * MÓDULO 2.1: ESCÁNER INTELIGENTE
 * Elimina basura bancaria y detecta cabeceras.
 */
export function extractRawJsonFromRows(rows: any[][]): any[] {
  let headerRowIndex = 0;
  let maxCols = 0;
  for (let i = 0; i < Math.min(50, rows.length); i++) {
    if (!Array.isArray(rows[i])) continue;
    const nonEmptyCols = rows[i].filter(cell => cell !== undefined && cell !== null && String(cell).trim() !== "").length;
    if (nonEmptyCols > maxCols) { maxCols = nonEmptyCols; headerRowIndex = i; }
  }

  const headersArray = Array.isArray(rows[headerRowIndex]) ? rows[headerRowIndex] : [];
  const rawJson: any[] = [];
  
  for (let i = headerRowIndex + 1; i < rows.length; i++) {
    const rowArray = rows[i];
    if (!Array.isArray(rowArray) || rowArray.length === 0) continue;
    if (rowArray.filter(cell => cell !== undefined && cell !== null && String(cell).trim() !== "").length === 0) continue;

    const rowObj: Record<string, any> = {};
    for (let j = 0; j < headersArray.length; j++) {
      rowObj[String(headersArray[j] || `Col_${j}`).trim()] = rowArray[j];
    }
    rawJson.push(rowObj);
  }
  return rawJson;
}

/**
 * MÓDULO 2.2: NORMALIZADOR
 * Busca sinónimos y limpia números caóticos.
 */
export function normalizeBankData(rawJson: any[]): NormalizedTransaction[] {
  const normalized: NormalizedTransaction[] = [];

  for (const row of rawJson) {
    if (!row || typeof row !== 'object') continue;
    let date = new Date().toISOString();
    let concept = "";
    let amount = 0;

    for (const key of Object.keys(row)) {
      const lowerKey = key.toLowerCase();
      const value = row[key];
      
      if (value === undefined || value === null || String(value).trim() === '') continue;

      if (lowerKey.includes('fecha') || lowerKey.includes('date') || lowerKey.includes('operación') || lowerKey.includes('operacion') || lowerKey.includes('fech')) {
        try { date = new Date(value).toISOString(); } catch(e) {}
      }
      if (lowerKey.includes('concepto') || lowerKey.includes('descrip') || lowerKey.includes('detalle') || lowerKey.includes('movimiento') || lowerKey.includes('beneficiario') || lowerKey.includes('comercio') || lowerKey.includes('referencia')) {
        concept = String(value).trim();
      }
      if (lowerKey.includes('monto') || lowerKey.includes('importe') || lowerKey.includes('amount') || lowerKey.includes('cantidad') || lowerKey.includes('valor') || lowerKey.includes('cargo') || lowerKey.includes('abono') || lowerKey.includes('débito') || lowerKey.includes('crédito') || lowerKey.includes('debito') || lowerKey.includes('credito')) {
        let amountStr = String(value).replace(/[$€£\s]/g, '');
        if (amountStr.includes(',') && amountStr.includes('.')) {
          amountStr = amountStr.lastIndexOf(',') > amountStr.lastIndexOf('.') ? amountStr.replace(/\./g, '').replace(',', '.') : amountStr.replace(/,/g, '');
        } else if (amountStr.includes(',')) {
          amountStr = amountStr.replace(/\./g, '').replace(',', '.');
        }
        
        const parsedAmount = parseFloat(amountStr);
        if (!isNaN(parsedAmount) && parsedAmount !== 0) {
          if (lowerKey.includes('cargo') || lowerKey.includes('débito') || lowerKey.includes('debito')) amount = -Math.abs(parsedAmount);
          else if (lowerKey.includes('abono') || lowerKey.includes('crédito') || lowerKey.includes('credito')) amount = Math.abs(parsedAmount);
          else amount = parsedAmount;
        }
      }
    }
    if (concept && amount !== 0) normalized.push({ date, concept, amount });
  }
  return normalized;
}