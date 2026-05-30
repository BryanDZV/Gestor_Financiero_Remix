import { redirect, data, useActionData, useLoaderData, useNavigation } from "react-router";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";
import { getSupabase } from "~/utils/supabase.server";
import { AccountDetailView } from "~/features/accounts/components/account-detail-view";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { supabase, headers } = getSupabase(request);
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) throw redirect("/login");

  const walletId = params.id;

  const { data: wallet, error: walletError } = await supabase
    .from('wallets')
    .select('*')
    .eq('id', walletId)
    .single();

  if (walletError || !wallet) throw redirect("/dashboard/cuentas");

  const { data: cycles } = await supabase
    .from('cycles')
    .select('*, transactions(*)')
    .eq('wallet_id', walletId)
    .order('created_at', { ascending: false });

  const { data: categories } = await supabase.from('categories').select('id, name').eq('user_id', user.id).order('name');

  const { data: allWallets } = await supabase.from('wallets').select('id, name, currency').eq('user_id', user.id);
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

  return { user, wallet, cycles: cycles || [], categories: categories || [], otherWallets, rates, headers };
}

export async function action({ request, params }: ActionFunctionArgs) {
  const { supabase, headers } = getSupabase(request);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw redirect("/login", { headers });

  const formData = await request.formData();
  
  const intent = formData.get("_intent");
  const walletId = params.id;

  if (intent === "create_cycle") {
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

    // Magia automática: Si el ciclo se creó, inyectamos todas las suscripciones activas de esta cuenta
    if (newCycle) {
      const { data: activeSubs } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('wallet_id', walletId)
        .eq('active', true);

      if (activeSubs && activeSubs.length > 0) {
        const transactionsToInsert = activeSubs.map(sub => ({
          wallet_id: walletId,
          cycle_id: newCycle.id,
          concept: `Suscripción: ${sub.name}`,
          amount: sub.amount,
          type: 'expense',
          date: startDate,
          user_id: user.id
        }));
        await supabase.from('transactions').insert(transactionsToInsert);
      }
    }

    return redirect(`/dashboard/cuentas/${walletId}`, { headers });
  }

  if (intent === "add_transaction") {
    // 1. Obtenemos el divisor configurado en la cuenta de forma segura en el backend
    const { data: walletConfig } = await supabase.from('wallets').select('share_divisor').eq('id', walletId).single();
    const divisor = walletConfig?.share_divisor || 1;

    // 2. Realizamos el cálculo si es necesario y modificamos el concepto para dar contexto
    const originalAmount = parseFloat(formData.get("amount") as string);
    const applyDivision = formData.get("apply_division") === "true";
    const finalAmount = applyDivision && divisor > 1 ? originalAmount / divisor : originalAmount;
    const concept = formData.get("concept") as string;
    const finalConcept = applyDivision && divisor > 1 ? `${concept} (Total: ${originalAmount} / ${divisor})` : concept;
    const categoryId = formData.get("category_id") as string;
    const txType = formData.get("type") as string;
    const date = formData.get("date") ? new Date(formData.get("date") as string).toISOString() : new Date().toISOString();

    let errorToReturn = null;

    if (txType === "transfer") {
      const destWalletId = formData.get("destination_wallet_id") as string;
      const { data: destWallet } = await supabase.from('wallets').select('name, currency').eq('id', destWalletId).single();
      const { data: sourceWallet } = await supabase.from('wallets').select('name, currency').eq('id', walletId).single();

      const { error: err1 } = await supabase.from('transactions').insert({
        wallet_id: walletId,
        cycle_id: formData.get("cycle_id"),
        concept: `A ${destWallet?.name || 'otra cuenta'}: ${finalConcept}`,
        amount: finalAmount,
        type: 'transfer',
        category_id: categoryId || null,
        date,
        user_id: user.id,
        destination_wallet_id: destWalletId
      });
      errorToReturn = err1;

      if (!err1 && destWalletId) {
        // 1. Resolver el ciclo de destino (y crearlo si no existe)
        let { data: destCycle } = await supabase.from('cycles').select('id').eq('wallet_id', destWalletId).eq('is_closed', false).order('created_at', { ascending: false }).limit(1).single();
        let targetCycleId = destCycle?.id;

        if (!targetCycleId) {
          const txDate = new Date(date);
          const monthName = txDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' });
          const { data: newDestCycle } = await supabase.from('cycles').insert({
            wallet_id: destWalletId,
            name: `Auto: ${monthName.charAt(0).toUpperCase() + monthName.slice(1)}`,
            start_date: txDate.toISOString().split('T')[0],
            is_closed: false
          }).select('id').single();
          targetCycleId = newDestCycle?.id || null;
        }

        // 2. Calcular la conversión de divisa si son diferentes
        const sourceCurrency = sourceWallet?.currency || 'EUR';
        const destCurrency = destWallet?.currency || 'EUR';
        let destAmount = finalAmount;

        if (sourceCurrency !== destCurrency) {
          try {
            const res = await fetch(`https://open.er-api.com/v6/latest/${sourceCurrency}`);
            if (res.ok) {
              const apiData = await res.json();
              const rate = apiData.rates[destCurrency];
              if (rate) destAmount = Math.round((finalAmount * rate) * 100) / 100;
            }
          } catch (e) {
            console.error("Error al convertir divisa en transferencia:", e);
          }
        }

        await supabase.from('transactions').insert({
          wallet_id: destWalletId,
          cycle_id: targetCycleId,
          concept: `De ${sourceWallet?.name || 'otra cuenta'}: ${finalConcept}`,
          amount: destAmount,
          type: 'income',
          date,
          user_id: user.id
        });
      }
    } else {
      const { error } = await supabase.from('transactions').insert({
        wallet_id: walletId,
        cycle_id: formData.get("cycle_id"),
        concept: finalConcept,
        amount: finalAmount,
        type: txType,
        category_id: categoryId || null,
        date,
        user_id: user.id
      });
      errorToReturn = error;
    }

    if (errorToReturn) {
      console.error("Error al insertar transacción:", errorToReturn);
      return { error: errorToReturn.message };
    }

    let warning = undefined;
    if (categoryId && formData.get("type") === "expense") {
      const { data: category } = await supabase.from('categories').select('name, monthly_limit').eq('id', categoryId).single();
      
      if (category && category.monthly_limit > 0) {
        const txDate = new Date(formData.get("date") as string || new Date());
        const firstDay = new Date(txDate.getFullYear(), txDate.getMonth(), 1).toISOString();
        const lastDay = new Date(txDate.getFullYear(), txDate.getMonth() + 1, 0, 23, 59, 59).toISOString();

        const { data: monthTx } = await supabase.from('transactions')
          .select('amount')
          .eq('category_id', categoryId)
          .eq('type', 'expense')
          .gte('date', firstDay)
          .lte('date', lastDay);

        const totalSpent = (monthTx || []).reduce((sum, tx) => sum + Number(tx.amount), 0);

        if (totalSpent > category.monthly_limit) {
          warning = `Has excedido el límite mensual de ${category.name} por €${(totalSpent - category.monthly_limit).toFixed(2)}`;
        } else if (totalSpent >= category.monthly_limit * 0.8) {
          warning = `Cuidado: Llevas el ${((totalSpent / category.monthly_limit) * 100).toFixed(0)}% consumido en ${category.name}`;
        }
      }
    }

    return data({ success: true, intent: "add_transaction", warning }, { headers });
  }

  if (intent === "edit_transaction") {
    const { error } = await supabase.from('transactions').update({
      concept: formData.get("concept"),
      amount: parseFloat(formData.get("amount") as string),
      type: formData.get("type"),
      category_id: formData.get("category_id") || null,
      date: formData.get("date") ? new Date(formData.get("date") as string).toISOString() : new Date().toISOString()
    }).eq('id', formData.get("transaction_id"));
    if (error) {
      console.error("Error al editar transacción:", error);
      return { error: error.message };
    }

    return redirect(`/dashboard/cuentas/${walletId}`, { headers });
  }

  if (intent === "delete_transactions") {
    const txIds = formData.getAll("transaction_ids") as string[];
    if (!txIds.length) return redirect(`/dashboard/cuentas/${walletId}`, { headers });

    const { error } = await supabase.from('transactions').delete().in('id', txIds);
    if (error) {
      console.error("Error al eliminar transacción:", error);
      return { error: error.message };
    }

    return redirect(`/dashboard/cuentas/${walletId}`, { headers });
  }

  if (intent === "close_cycle") {
    const { error } = await supabase.from('cycles').update({ is_closed: true }).eq('id', formData.get("cycle_id"));
    if (error) {
      console.error("Error al cerrar ciclo:", error);
      return { error: error.message };
    }

    return redirect(`/dashboard/cuentas/${walletId}`, { headers });
  }

  if (intent === "open_cycle") {
    const { error } = await supabase.from('cycles').update({ is_closed: false }).eq('id', formData.get("cycle_id"));
    if (error) {
      console.error("Error al reabrir ciclo:", error);
      return { error: error.message };
    }

    return redirect(`/dashboard/cuentas/${walletId}`, { headers });
  }

  if (intent === "delete_cycle") {
    const { error } = await supabase.from('cycles').delete().eq('id', formData.get("cycle_id"));
    if (error) {
      console.error("Error al eliminar ciclo:", error);
      return { error: error.message };
    }
    return redirect(`/dashboard/cuentas/${walletId}`, { headers });
  }

  if (intent === "import_csv") {
    const file = formData.get("csv_file") as File;
    const cycleId = formData.get("cycle_id") as string;
    
    if (!file || !cycleId) {
      return data({ error: "Falta el archivo o el ciclo." }, { headers });
    }

    try {
      const text = await file.text();
      const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
      
      if (lines.length < 2) return data({ error: "El archivo está vacío o no tiene encabezados." }, { headers });

      // 1. Detectar inteligentemente los índices de las columnas
      const dateIdx = parseInt(formData.get("date_idx") as string, 10);
      const conceptIdx = parseInt(formData.get("concept_idx") as string, 10);
      const amountIdx = parseInt(formData.get("amount_idx") as string, 10);

      if (isNaN(dateIdx) || isNaN(conceptIdx) || isNaN(amountIdx)) {
        return data({ error: "Mapeo de columnas inválido. Por favor, selecciona las columnas correctas." }, { headers });
      }

      const transactionsToInsert = [];
      
      // 2. Extraer datos dinámicamente ignorando columnas adicionales
      for (let i = 1; i < lines.length; i++) {
        // Esta expresión regular (Regex) separa por comas, pero ignora las comas dentro de comillas (Ej. "Amazon, Inc.")
        const parts = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
        
        // Comprobamos que la fila tenga suficientes datos para alcanzar el índice máximo que necesitamos
        if (parts.length > Math.max(dateIdx, conceptIdx, amountIdx)) {
          const dateStr = parts[dateIdx].trim().replace(/^"|"$/g, '');
          const concept = parts[conceptIdx].trim().replace(/^"|"$/g, '');
          const amountNum = parseFloat(parts[amountIdx].trim().replace(/^"|"$/g, ''));
          
          if (!isNaN(amountNum) && concept) {
            let validDate;
            try { validDate = new Date(dateStr).toISOString(); } catch(e) { validDate = new Date().toISOString(); }
            
            transactionsToInsert.push({
              wallet_id: walletId,
              cycle_id: cycleId,
              concept: concept,
              amount: Math.abs(amountNum),
              type: amountNum < 0 ? 'expense' : 'income',
              date: validDate,
              user_id: user.id
            });
          }
        }
      }

      if (transactionsToInsert.length > 0) {
        const { error } = await supabase.from('transactions').insert(transactionsToInsert);
        if (error) throw error;
        return data({ success: true, intent: "import_csv", count: transactionsToInsert.length }, { headers });
      } else {
        return data({ error: "No se encontraron filas válidas en el CSV." }, { headers });
      }
    } catch (e) {
      console.error("Error al procesar CSV:", e);
      return data({ error: "Hubo un error al leer el archivo CSV." }, { headers });
    }
  }

  return redirect(`/dashboard/cuentas/${walletId}`, { headers });
}

export default function AccountDetailRoute() {
  const { user, wallet, cycles, categories, otherWallets, rates } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state !== "idle";

  return (
    <AccountDetailView
      userEmail={user.email || ""}
      wallet={wallet}
      cycles={cycles}
      categories={categories}
      otherWallets={otherWallets}
      rates={rates}
      actionData={actionData}
      actionError={actionData && "error" in actionData ? actionData.error : undefined}
      isSubmitting={isSubmitting}
    />
  );
}