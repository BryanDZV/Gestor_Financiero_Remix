import { data, redirect } from "react-router";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getExpenseTotalForBudget } from "~/utils/budgets.server";

export async function handleAddTransaction(formData: FormData, walletId: string, userId: string, supabase: SupabaseClient, headers: Headers) {
  const { data: walletConfig } = await supabase.from('wallets').select('share_divisor').eq('id', walletId).single();
  const divisor = walletConfig?.share_divisor || 1;

  const originalAmount = parseFloat(formData.get("amount") as string);
  const applyDivision = formData.get("apply_division") === "true";
  const finalAmount = applyDivision && divisor > 1 ? originalAmount / divisor : originalAmount;
  const concept = formData.get("concept") as string;
  const finalConcept = applyDivision && divisor > 1 ? `${concept} (Total: ${originalAmount} / ${divisor})` : concept;
  
  // Parseo super estricto para evitar que un presupuesto vacío se guarde mal
  let categoryId = formData.get("category_id") as string | null;
  if (!categoryId || categoryId === "undefined" || categoryId === "null") categoryId = null;
  
  let budgetId = formData.get("budget_id") as string | null;
  if (!budgetId || budgetId === "undefined" || budgetId === "null") budgetId = null;
  
  const txType = formData.get("type") as string;
  const date = formData.get("date") ? new Date(formData.get("date") as string).toISOString() : new Date().toISOString();
  const cycleId = formData.get("cycle_id") as string;

  let errorToReturn = null;
  let warning = undefined;

  if (txType === "transfer") {
    const destWalletId = formData.get("destination_wallet_id") as string;
    const [ { data: destW }, { data: srcW } ] = await Promise.all([
      supabase.from('wallets').select('name, currency').eq('id', destWalletId).single(),
      supabase.from('wallets').select('name, currency').eq('id', walletId).single()
    ]);

    const { error: err1 } = await supabase.from('transactions').insert({
      wallet_id: walletId, cycle_id: cycleId, concept: `A ${destW?.name || 'otra cuenta'}: ${finalConcept}`,
      amount: finalAmount, type: 'transfer', category_id: categoryId, budget_id: budgetId, date, user_id: userId, destination_wallet_id: destWalletId
    });
    errorToReturn = err1;

    if (!err1 && destWalletId) {
      let { data: destCycle } = await supabase.from('cycles').select('id').eq('wallet_id', destWalletId).eq('is_closed', false).order('created_at', { ascending: false }).limit(1).single();
      let targetCycleId = destCycle?.id;

      if (!targetCycleId) {
        const mName = new Date(date).toLocaleString('es-ES', { month: 'long', year: 'numeric' });
        const { data: newDestCycle } = await supabase.from('cycles').insert({
          wallet_id: destWalletId, name: `Auto: ${mName.charAt(0).toUpperCase() + mName.slice(1)}`, start_date: date.split('T')[0], is_closed: false
        }).select('id').single();
        targetCycleId = newDestCycle?.id || null;
      }

      let destAmount = finalAmount;
      if (srcW?.currency !== destW?.currency) {
        try {
          const res = await fetch(`https://open.er-api.com/v6/latest/${srcW?.currency || 'EUR'}`);
          if (res.ok) {
            const apiData = await res.json();
            if (apiData.rates[destW?.currency || 'EUR']) destAmount = Math.round((finalAmount * apiData.rates[destW?.currency || 'EUR']) * 100) / 100;
          }
        } catch (e) {}
      }

      await supabase.from('transactions').insert({
        wallet_id: destWalletId, cycle_id: targetCycleId, concept: `De ${srcW?.name || 'otra cuenta'}: ${finalConcept}`,
        amount: destAmount, type: 'income', date, user_id: userId
      });
    }
  } else {
    const { error } = await supabase.from('transactions').insert({
      wallet_id: walletId, cycle_id: cycleId, concept: finalConcept, amount: finalAmount, type: txType, category_id: categoryId, budget_id: budgetId, date, user_id: userId
    });
    errorToReturn = error;

    if (!error && budgetId && txType === "expense") {
      const { data: budget } = await supabase.from('budgets').select('name, monthly_limit, currency').eq('id', budgetId).single();
      const limit = Number(budget?.monthly_limit || 0);
      if (budget && limit > 0) {
        const spent = await getExpenseTotalForBudget(userId, budgetId, supabase);
        if (spent > limit) warning = `Excediste el límite de ${budget.name} por ${(spent - limit).toFixed(2)} ${budget.currency || 'EUR'}`;
        else if (spent >= limit * 0.8) warning = `Llevas ${((spent / limit) * 100).toFixed(0)}% consumido en ${budget.name}`;
      }
    }
  }

  if (errorToReturn) return data({ error: errorToReturn.message }, { headers });
  return data({ success: true, intent: "add_transaction", warning }, { headers });
}

export async function handleEditTransaction(formData: FormData, walletId: string, userId: string, supabase: SupabaseClient, headers: Headers) {
  const updates: any = {
    concept: formData.get("concept"),
    amount: parseFloat(formData.get("amount") as string),
    type: formData.get("type"),
    date: formData.get("date") ? new Date(formData.get("date") as string).toISOString() : new Date().toISOString()
  };

  if (formData.has("category_id")) {
    const cId = formData.get("category_id") as string | null;
    updates.category_id = (!cId || cId === "undefined" || cId === "null") ? null : cId;
  }
  if (formData.has("budget_id")) {
    const bId = formData.get("budget_id") as string | null;
    updates.budget_id = (!bId || bId === "undefined" || bId === "null") ? null : bId;
  }

  const { error } = await supabase.from('transactions').update(updates).eq('id', formData.get("transaction_id"));
  
  if (error) {
    console.error("Error al editar transacción:", error);
    return data({ error: error.message }, { headers, status: 500 });
  }
  
  let warning = undefined;
  if (updates.type === "expense" && updates.budget_id) {
    const { data: budget } = await supabase.from('budgets').select('name, monthly_limit, currency').eq('id', updates.budget_id).single();
    const limit = Number(budget?.monthly_limit || 0);
    if (budget && limit > 0) {
      const spent = await getExpenseTotalForBudget(userId, updates.budget_id, supabase);
      if (spent > limit) warning = `Excediste el límite de ${budget.name} por ${(spent - limit).toFixed(2)} ${budget.currency || 'EUR'}`;
      else if (spent >= limit * 0.8) warning = `Llevas ${((spent / limit) * 100).toFixed(0)}% consumido en ${budget.name}`;
    }
  }

  return data({ success: true, intent: "edit_transaction", message: "Movimiento actualizado correctamente.", warning }, { headers });
}

export async function handleDeleteTransactions(formData: FormData, walletId: string, supabase: SupabaseClient, headers: Headers) {
  const txIds = formData.getAll("transaction_ids") as string[];
  if (!txIds.length) return data({ success: true, intent: "delete_transactions" }, { headers });

  const { error } = await supabase.from('transactions').delete().in('id', txIds);
  if (error) {
    console.error("Error al eliminar transacción:", error);
    return data({ error: error.message }, { headers, status: 500 });
  }
  return data({ success: true, intent: "delete_transactions", message: "Movimientos eliminados correctamente." }, { headers });
}