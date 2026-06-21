import { data, redirect } from "react-router";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function handleCreateWallet(formData: FormData, userId: string, supabase: SupabaseClient, headers: Headers) {
  const name = formData.get("name") as string;
  const isLiability = formData.get("is_liability") === "true";
  const initialBalance = parseFloat(formData.get("initial_balance") as string) || 0;
  const targetAmount = parseFloat(formData.get("target_amount") as string) || 0;
  const shareDivisor = parseInt(formData.get("share_divisor") as string, 10) || 1;
  const type = isLiability ? "credit" : "cash";
  const currency = formData.get("currency") as string || "EUR";

  const payload = {
    user_id: userId,
    name,
    type,
    is_liability: isLiability,
    initial_balance: initialBalance,
    target_amount: targetAmount,
    share_divisor: shareDivisor,
    currency,
  };

  const { error } = await supabase.from('wallets').insert(payload);
  if (error) return data({ error: error.message }, { headers });

  return redirect("/dashboard/cuentas", { headers });
}

export async function handleDeleteWallets(formData: FormData, supabase: SupabaseClient, headers: Headers) {
  const walletIds = formData.getAll("wallet_ids") as string[];
  if (!walletIds.length) return data({ success: true }, { headers });
  
  const { error } = await supabase.from('wallets').delete().in('id', walletIds);
  if (error) return data({ error: error.message }, { headers });
  
  return data({ success: true }, { headers });
}