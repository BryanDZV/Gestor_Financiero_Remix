import * as XLSX from "xlsx";
import Papa from "papaparse";

/**
 * MÓDULO 1: LECTOR DE ARCHIVOS (File Parser)
 * Solo se encarga de abrir el archivo, identificar si es binario o texto,
 * y devolver una matriz de filas crudas.
 */
export async function parseBankFile(file: File, ext: string): Promise<any[][] | null> {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer.slice(0, 4));
  
  const isBinaryExcel = (bytes[0] === 0xD0 && bytes[1] === 0xCF) || (bytes[0] === 0x50 && bytes[1] === 0x4B);
  const isHTML = bytes[0] === 0x3C;

  if (ext === 'csv' || ((ext === 'xls' || ext === 'xlsx') && !isBinaryExcel && !isHTML)) {
    let text = new TextDecoder('utf-8').decode(buffer);
    // Si fallan los caracteres especiales, asumimos que viene en formato occidental (Windows/ISO)
    if (text.includes('')) { 
      text = new TextDecoder('iso-8859-1').decode(buffer);
    }
    
    const delimiter = (text.match(/;/g) || []).length > (text.match(/,/g) || []).length ? ';' : ',';
    const parsed = Papa.parse(text, { skipEmptyLines: true, delimiter });
    return parsed.data as any[][];
  } else if (ext === 'xls' || ext === 'xlsx') {
    const workbook = XLSX.read(buffer, { type: 'array', cellDates: true });
    return XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { header: 1, raw: false });
  } 
  return null;
}