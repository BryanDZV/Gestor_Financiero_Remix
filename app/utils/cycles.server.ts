import { redirect } from "react-router";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function handleCreateCycle(formData: FormData, walletId: string, userId: string, supabase: SupabaseClient, headers: Headers) {
  const startDate = formData.get("start_date") as string;
  
  const { data: newCycle, error } = await supabase.from('cycles').insert({
    wallet_id: walletId,
    name: formData.get("name"),
    start_date: startDate
  }).select('id').single();
  
  if (error) {
    console.error("Error al crear ciclo:", error);
    return { error: error.message };
  }

  // Magia automática: Inyectamos suscripciones activas
  if (newCycle) {
    const { data: activeSubs } = await supabase.from('subscriptions').select('*').eq('wallet_id', walletId).eq('active', true);
    if (activeSubs && activeSubs.length > 0) {
      const transactionsToInsert = activeSubs.map(sub => ({
        wallet_id: walletId,
        cycle_id: newCycle.id,
        concept: `Suscripción: ${sub.name}`,
        amount: sub.amount,
        type: 'expense',
        date: startDate,
        user_id: userId
      }));
      await supabase.from('transactions').insert(transactionsToInsert);
    }
  }
  return redirect(`/dashboard/cuentas/${walletId}`, { headers });
}

export async function handleUpdateCycleStatus(cycleId: string, isClosed: boolean, walletId: string, supabase: SupabaseClient, headers: Headers) {
  const { error } = await supabase.from('cycles').update({ is_closed: isClosed }).eq('id', cycleId);
  if (error) {
    console.error(`Error al ${isClosed ? 'cerrar' : 'abrir'} ciclo:`, error);
    return { error: error.message };
  }
  return redirect(`/dashboard/cuentas/${walletId}`, { headers });
}

export async function handleDeleteCycle(cycleId: string, walletId: string, supabase: SupabaseClient, headers: Headers) {
  const { error } = await supabase.from('cycles').delete().eq('id', cycleId);
  if (error) {
    console.error("Error al eliminar ciclo:", error);
    return { error: error.message };
  }
  return redirect(`/dashboard/cuentas/${walletId}`, { headers });
}