import { data } from "react-router";
import type { SupabaseClient } from "@supabase/supabase-js";
import { parseBankFile } from "~/utils/file-parser.server";
import { extractRawJsonFromRows, normalizeBankData } from "~/utils/bank-normalizer.server";

export async function handleFileImport(
  formData: FormData,
  walletId: string,
  userId: string,
  supabase: SupabaseClient,
  headers: Headers
) {
  const file = formData.get("file") as File;
  if (!file) return data({ error: "Falta el archivo." }, { headers });

  try {
    const ext = file.name.split('.').pop()?.toLowerCase();

    if (ext === 'ofx' || ext === 'qif') {
      return data({ error: "El soporte para formato OFX/QIF estará disponible próximamente." }, { headers });
    }

    // 1. Extraer los datos crudos del archivo (Módulo Parser)
    const rows = await parseBankFile(file, ext || '');
    if (!rows) {
      return data({ error: "Formato de archivo no soportado." }, { headers });
    }
    
    // 2. Extraer cabeceras y limpiar metadatos basura (Módulo Normalizer)
    const rawJson = extractRawJsonFromRows(rows);

    // 3. Normalizar columnas caóticas a nuestra estructura (Módulo Normalizer)
    const normalizedData = normalizeBankData(rawJson);

    if (normalizedData.length === 0) {
      return data({ error: "No se encontraron transacciones válidas o la cabecera no fue reconocida." }, { headers });
    }

    // 4. Transformar a la estructura de la base de datos y auto-asignar ciclos
    // Obtenemos los ciclos existentes de esta cuenta
    const { data: existingCycles } = await supabase
      .from('cycles')
      .select('id, name, start_date')
      .eq('wallet_id', walletId);

    const cyclesMap = new Map<string, string>();
    const monthNames = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

    if (existingCycles) {
      for (const c of existingCycles) {
        if (c.start_date) {
          const dObj = new Date(c.start_date);
          if (!isNaN(dObj.getTime())) {
            const yyyy = dObj.getFullYear();
            const mm = String(dObj.getMonth() + 1).padStart(2, '0');
            cyclesMap.set(`${yyyy}-${mm}`, c.id);
          }
        } else if (c.name) {
          // Intento de adivinar el mes por el nombre (ej. "Abril 2026") si no tiene fecha
          const lowerName = c.name.toLowerCase();
          for (let i = 0; i < monthNames.length; i++) {
            if (lowerName.includes(monthNames[i])) {
              const yearMatch = lowerName.match(/\d{4}/);
              if (yearMatch) {
                const mm = String(i + 1).padStart(2, '0');
                const yyyy = yearMatch[0];
                cyclesMap.set(`${yyyy}-${mm}`, c.id);
              }
              break;
            }
          }
        }
      }
    }

    const transactionsToInsert = [];

    for (const tx of normalizedData) {
      const dObj = new Date(tx.date);
      if (isNaN(dObj.getTime())) continue; // Evitar fechas inválidas

      const yyyy = dObj.getFullYear();
      const mm = String(dObj.getMonth() + 1).padStart(2, '0');
      const monthKey = `${yyyy}-${mm}`; // 'YYYY-MM' infalible

      let currentCycleId = cyclesMap.get(monthKey);

      if (!currentCycleId) {
        // Crear nuevo ciclo automáticamente para ese mes
        const [yyyy, mm] = monthKey.split('-');
        const d = new Date(parseInt(yyyy, 10), parseInt(mm, 10) - 1, 1);
        const monthName = new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' }).format(d);
        const capitalizedName = monthName.charAt(0).toUpperCase() + monthName.slice(1);
        const firstDay = `${yyyy}-${mm}-01`;

        const { data: newCycle, error: cycleError } = await supabase
          .from('cycles')
          .insert({ wallet_id: walletId, name: capitalizedName, start_date: firstDay })
          .select('id')
          .single();

        if (cycleError || !newCycle) throw new Error("No se pudo crear el ciclo automático.");
        currentCycleId = newCycle.id;
        cyclesMap.set(monthKey, currentCycleId as string);
      }

      transactionsToInsert.push({
        wallet_id: walletId,
        cycle_id: currentCycleId,
        user_id: userId,
        concept: tx.concept,
        amount: Math.abs(tx.amount),
        type: tx.amount < 0 ? 'expense' : 'income',
        date: tx.date
      });
    }

    if (transactionsToInsert.length > 0) {
      const { error } = await supabase.from('transactions').insert(transactionsToInsert);
      if (error) throw error;
      return data({ success: true, intent: "import_file", count: transactionsToInsert.length }, { headers });
    }
  } catch (e) {
    console.error("Error al procesar archivo:", e);
    return data({ error: "Hubo un error al procesar el archivo." }, { headers });
  }
}