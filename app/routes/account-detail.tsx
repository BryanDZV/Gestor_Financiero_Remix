import { redirect, data, useActionData, useLoaderData, useNavigation } from "react-router";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";
import { getSupabase } from "~/utils/supabase.server";
import { AccountDetailView } from "~/features/accounts/components/account-detail-view";
import { handleFileImport } from "~/utils/file-import.server";
import { handleCreateCycle, handleDeleteCycle, handleUpdateCycleStatus } from "~/utils/cycles.server";
import { handleAddTransaction, handleDeleteTransactions, handleEditTransaction } from "~/utils/transactions.server";
import type { AccountActionData } from "~/types";
import { mapRawWallets } from "~/utils/wallets.server";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { supabase, headers } = getSupabase(request);
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) throw redirect("/login");

  const walletId = params.id;

  const { data: walletRow, error: walletError } = await supabase
    .from('wallets')
    .select('*, transactions!transactions_wallet_id_fkey(amount, type)')
    .eq('id', walletId)
    .single();

  if (walletError || !walletRow) throw redirect("/dashboard/cuentas");

  const mappedWallets = mapRawWallets([walletRow as any]);
  const wallet = mappedWallets[0];

  const { data: cycles } = await supabase
    .from('cycles')
    .select('*, transactions(*)')
    .eq('wallet_id', walletId)
    .order('start_date', { ascending: false, nullsFirst: true })
    .order('created_at', { ascending: false })
    .order('date', { foreignTable: 'transactions', ascending: false })
    .limit(100, { foreignTable: 'transactions' });

  const { data: categories } = await supabase.from('categories').select('id, name, icon').eq('user_id', user.id).order('name');
  const { data: budgets } = await supabase.from('budgets').select('id, name').eq('user_id', user.id).order('name');

  const { data: allWallets } = await supabase.from('wallets').select('id, name, currency, share_divisor').eq('user_id', user.id);
  const otherWallets = (allWallets || []).filter(w => w.id !== walletId);

  let rates: Record<string, number> = {};
  try {
    const res = await fetch(`https://open.er-api.com/v6/latest/${wallet.currency || 'EUR'}`);
    if (res.ok) {
      const apiData = await res.json();
      rates = apiData.rates || {};
    }
  } catch (e) {
    console.error("Error al obtener los tipos de cambio en el loader:", e);
  }

  return { user, wallet, cycles: cycles || [], categories: categories || [], budgets: budgets || [], otherWallets, rates, headers };
}

export async function action({ request, params }: ActionFunctionArgs) {
  const { supabase, headers } = getSupabase(request);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw redirect("/login", { headers });

  const formData = await request.formData();
  
  const intent = formData.get("_intent");
  const walletId = params.id as string;
  if (!walletId) throw redirect("/dashboard/cuentas", { headers });

  if (intent === "create_cycle") {
    return handleCreateCycle(formData, walletId, user.id, supabase, headers);
  }

  if (intent === "add_transaction") {
    return handleAddTransaction(formData, walletId, user.id, supabase, headers);
  }

  if (intent === "edit_transaction") {
    return handleEditTransaction(formData, walletId, user.id, supabase, headers);
  }

  if (intent === "split_transaction") {
    const txId = formData.get("transaction_id") as string;
    const destWalletId = formData.get("destination_wallet_id") as string;
    const amountToMove = parseFloat(formData.get("amount_to_move") as string);
    const date = formData.get("date") as string;
    const concept = formData.get("concept") as string;
    const type = formData.get("type") as string;
    
    if (!destWalletId || isNaN(amountToMove) || amountToMove <= 0) return data({ error: "Datos inválidos para dividir." }, { headers });

    const { data: originalTx } = await supabase.from('transactions').select('*').eq('id', txId).single();
    if (!originalTx) return data({ error: "Gasto no encontrado." }, { headers });

    const categoryId = formData.has("category_id") ? formData.get("category_id") as string || null : originalTx.category_id;
    const budgetId = formData.has("budget_id") ? formData.get("budget_id") as string || null : originalTx.budget_id;

    const monthKey = date.substring(0, 7);
    let destCycleId = null;

    const { data: existingCycles } = await supabase.from('cycles').select('id, start_date').eq('wallet_id', destWalletId);
    if (existingCycles) {
      const match = existingCycles.find(c => c.start_date && c.start_date.startsWith(monthKey));
      if (match) destCycleId = match.id;
    }

    const { data: destWallet } = await supabase.from('wallets').select('share_divisor').eq('id', destWalletId).single();
    const divisor = destWallet?.share_divisor || 1;
    const finalAmountInDest = amountToMove / divisor;

    if (!destCycleId) {
      const [yyyy, mm] = monthKey.split('-');
      const d = new Date(parseInt(yyyy, 10), parseInt(mm, 10) - 1, 1);
      const monthName = new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' }).format(d);
      const { data: newCycle } = await supabase.from('cycles').insert({ wallet_id: destWalletId, name: monthName.charAt(0).toUpperCase() + monthName.slice(1), start_date: `${yyyy}-${mm}-01` }).select('id').single();
      if (newCycle) destCycleId = newCycle.id;
    }

    if (amountToMove >= originalTx.amount) {
      if (destCycleId) await supabase.from('transactions').update({ wallet_id: destWalletId, cycle_id: destCycleId, concept, date, type, category_id: categoryId, budget_id: budgetId, amount: finalAmountInDest }).eq('id', txId);
    } else {
      await supabase.from('transactions').update({ amount: originalTx.amount - amountToMove, concept, date, type, category_id: categoryId, budget_id: budgetId }).eq('id', txId);
      if (destCycleId) {
        await supabase.from('transactions').insert({ wallet_id: destWalletId, cycle_id: destCycleId, user_id: user.id, concept: `${concept} (Compartido)`, amount: finalAmountInDest, type, category_id: categoryId, budget_id: budgetId, date });
      }
    }
    return data({ success: true, intent: "split_transaction", message: "Movimiento dividido correctamente." }, { headers });
  }

  if (intent === "delete_transactions") {
    return handleDeleteTransactions(formData, walletId, supabase, headers);
  }

  if (intent === "close_cycle") {
    return handleUpdateCycleStatus(formData.get("cycle_id") as string, true, walletId, supabase, headers);
  }

  if (intent === "open_cycle") {
    return handleUpdateCycleStatus(formData.get("cycle_id") as string, false, walletId, supabase, headers);
  }

  if (intent === "delete_cycle") {
    return handleDeleteCycle(formData.get("cycle_id") as string, walletId, supabase, headers);
  }

  if (intent === "delete_cycles") {
    const cycleIds = formData.getAll("cycle_ids") as string[];
    if (cycleIds.length) {
      await supabase.from('cycles').delete().in('id', cycleIds);
    }
    return data({ success: true, intent: "delete_cycles", message: "Ciclos eliminados correctamente." }, { headers });
  }

  if (intent === "import_file") {
    return handleFileImport(formData, walletId, user.id, supabase, headers);
  }

  return redirect(`/dashboard/cuentas/${walletId}`, { headers });
}

export default function AccountDetailRoute() {
  const { user, wallet, cycles, categories, budgets, otherWallets, rates } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state !== "idle";

  return (
    <AccountDetailView
      userEmail={user.email || ""}
      wallet={wallet}
      cycles={cycles}
      categories={categories}
      budgets={budgets}
      otherWallets={otherWallets}
      rates={rates}
      actionData={actionData as AccountActionData | undefined}
      actionError={actionData && "error" in actionData ? actionData.error : undefined}
      isSubmitting={isSubmitting}
    />
  );
}