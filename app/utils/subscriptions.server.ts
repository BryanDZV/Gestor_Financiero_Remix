import { data } from "react-router";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function handleCreateSubscription(formData: FormData, userId: string, supabase: SupabaseClient, headers: Headers) {
  const walletId = formData.get("wallet_id") as string || null;
  const amount = parseFloat(formData.get("amount") as string) || 0;
  const name = formData.get("name") as string;
  const startDate = formData.get("start_date") as string || new Date().toISOString().split('T')[0];

  const { error } = await supabase.from('subscriptions').insert({
    user_id: userId,
    name,
    amount,
    billing_period: formData.get("billing_period"),
    active: true,
    wallet_id: walletId,
    start_date: startDate,
  });
  
  // Inyectamos primer pago automáticamente si hay cuenta
  if (!error && walletId) {
    const { data: cycle } = await supabase.from('cycles').select('id').eq('wallet_id', walletId).eq('is_closed', false).order('created_at', { ascending: false }).limit(1).single();
    if (cycle) {
      await supabase.from('transactions').insert({
        user_id: userId,
        wallet_id: walletId,
        cycle_id: cycle.id,
        concept: `Suscripción: ${name}`,
        amount: amount,
        type: 'expense',
        date: startDate,
      });
    }
  }
  
  if (error) return data({ error: error.message }, { headers });
  return data({ success: true }, { headers });
}

export async function handleToggleSubscription(formData: FormData, supabase: SupabaseClient, headers: Headers) {
  const id = formData.get("subscription_id");
  const active = formData.get("active") === "true";
  await supabase.from('subscriptions').update({ active: !active }).eq('id', id);
  return data({ success: true }, { headers });
}

export async function handleDeleteSubscriptions(formData: FormData, supabase: SupabaseClient, headers: Headers) {
  const ids = formData.getAll("subscription_ids") as string[];
  if (ids.length) await supabase.from('subscriptions').delete().in('id', ids);
  return data({ success: true }, { headers });
}