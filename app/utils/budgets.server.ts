import { data } from "react-router";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function getExpenseTotalsByBudget(userId: string, supabase: SupabaseClient) {
  const { data: transactions, error } = await supabase
    .from('transactions')
    .select('amount, budget_id')
    .eq('user_id', userId)
    .eq('type', 'expense')
    .not('budget_id', 'is', null);

  if (error) {
    console.error("Error consultando transacciones para presupuestos:", error);
    return new Map<string, number>();
  }

  const totals = new Map<string, number>();
  for (const tx of transactions || []) {
    const budgetId = tx.budget_id as string | null;
    if (!budgetId) continue;
    totals.set(budgetId, (totals.get(budgetId) || 0) + Number(tx.amount || 0));
  }

  return totals;
}

export async function getExpenseTotalForBudget(userId: string, budgetId: string, supabase: SupabaseClient) {
  const totals = await getExpenseTotalsByBudget(userId, supabase);
  return totals.get(budgetId) || 0;
}

export async function getBudgetsData(userId: string, supabase: SupabaseClient) {
  const [categoriesRes, totals] = await Promise.all([
    supabase.from('budgets').select('*').eq('user_id', userId).order('name'),
    getExpenseTotalsByBudget(userId, supabase),
  ]);

  const budgets = categoriesRes.data || [];

  return budgets.map(b => {
    const spent = totals.get(b.id) || 0;
    return { 
      ...b, 
      spent,
      monthly_limit: Number(b.monthly_limit || 0)
    };
  });
}

export async function handleCreateBudget(formData: FormData, userId: string, supabase: SupabaseClient, headers: Headers) {
  const { error } = await supabase.from('budgets').insert({
    user_id: userId,
    name: formData.get("name"),
    monthly_limit: parseFloat(formData.get("monthly_limit") as string) || 0,
    currency: formData.get("currency") as string || 'EUR'
  });
  if (error) return data({ error: error.message }, { headers });
  return data({ success: true }, { headers });
}

export async function handleEditBudget(formData: FormData, userId: string, supabase: SupabaseClient, headers: Headers) {
  const budgetId = formData.get("budget_id") as string;
  const name = formData.get("name") as string;
  const monthlyLimit = Number(formData.get("monthly_limit") || 0);
  const currency = formData.get("currency") as string || 'EUR';

  if (!budgetId || !name) {
    return data({ error: "El nombre y el ID del presupuesto son obligatorios." }, { headers, status: 400 });
  }
  if (isNaN(monthlyLimit) || monthlyLimit < 0) {
    return data({ error: "El límite mensual debe ser un número válido." }, { headers, status: 400 });
  }

  const { error } = await supabase.from("budgets").update({ name, monthly_limit: monthlyLimit, currency }).eq("id", budgetId).eq("user_id", userId);

  if (error) {
    return data({ error: "No se pudo actualizar el presupuesto." }, { headers, status: 500 });
  }
  return data({ success: true }, { headers });
}

export async function handleDeleteBudgets(formData: FormData, supabase: SupabaseClient, headers: Headers) {
  const budgetIds = formData.getAll("budget_ids") as string[];
  if (!budgetIds.length) return data({ success: true }, { headers });
  
  const { error } = await supabase.from('budgets').delete().in('id', budgetIds);
  if (error) return data({ error: error.message }, { headers });
  return data({ success: true }, { headers });
}

export async function handleCreateCategory(formData: FormData, userId: string, supabase: SupabaseClient, headers: Headers) {
  const name = String(formData.get("name") || "").trim();
  const icon = (formData.get("icon") as string) || 'ph:tag-duotone';

  // Validar entrada
  if (!name) return data({ error: "El nombre de la categoría es obligatorio." }, { headers, status: 400 });

  const { error } = await supabase.from('categories').insert({
    user_id: userId,
    name,
    icon
  });
  if (error) return data({ error: error.message }, { headers });
  return data({ success: true }, { headers });
}

export async function handleDeleteCategories(formData: FormData, supabase: SupabaseClient, headers: Headers) {
  const categoryIds = formData.getAll("category_ids") as string[];
  if (!categoryIds.length) return data({ success: true }, { headers });
  
  const { error } = await supabase.from('categories').delete().in('id', categoryIds);
  if (error) return data({ error: error.message }, { headers });
  return data({ success: true }, { headers });
}