import { data, redirect, useLoaderData } from "react-router";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";
import { getSupabase } from "~/utils/supabase.server";
import { BudgetsView } from "~/features/budgets/components/budgets-view";

export async function loader({ request }: LoaderFunctionArgs) {
  const { supabase, headers } = getSupabase(request);
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) throw redirect("/login", { headers });

  // Obtenemos los límites del mes actual
  const date = new Date();
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).toISOString();
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59).toISOString();

  const [categoriesRes, transactionsRes] = await Promise.all([
    supabase.from('categories').select('*').eq('user_id', user.id).order('name'),
    supabase.from('transactions').select('amount, category_id, type').eq('user_id', user.id).eq('type', 'expense').gte('date', firstDay).lte('date', lastDay)
  ]);

  const categories = categoriesRes.data || [];
  const transactions = transactionsRes.data || [];

  // Cruzamos los datos matemáticamente
  const budgets = categories.map(cat => {
    const spent = transactions.filter(tx => tx.category_id === cat.id).reduce((sum, tx) => sum + Number(tx.amount), 0);
    return { ...cat, spent };
  });

  // Obtenemos todas las monedas disponibles en la API
  let currencyOptions: string[] = ["EUR", "USD", "GBP", "MXN"];
  try {
    const res = await fetch("https://open.er-api.com/v6/latest/EUR");
    if (res.ok) {
      const apiData = await res.json();
      if (apiData.rates) currencyOptions = Object.keys(apiData.rates);
    }
  } catch (e) {
    console.error("Error al obtener opciones de moneda:", e);
  }

  return data({ user, budgets, currencyOptions }, { headers });
}

export async function action({ request }: ActionFunctionArgs) {
  const { supabase, headers } = getSupabase(request);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw redirect("/login", { headers });

  const formData = await request.formData();
  const intent = formData.get("_intent");

  if (intent === "create_category") {
    const { error } = await supabase.from('categories').insert({
      user_id: user.id,
      name: formData.get("name"),
      type: 'expense',
      monthly_limit: parseFloat(formData.get("monthly_limit") as string) || 0,
      currency: formData.get("currency") as string || 'EUR',
    });
    if (error) {
      console.error("Error al crear presupuesto:", error);
      return data({ error: error.message }, { headers });
    }
  }
  if (intent === "delete_categories") {
    const categoryIds = formData.getAll("category_ids") as string[];
    if (!categoryIds.length) return data({ success: true }, { headers });
    
    const { error } = await supabase.from('categories').delete().in('id', categoryIds);
    if (error) {
      console.error("Error al eliminar presupuesto:", error);
      return data({ error: error.message }, { headers });
    }
  }
  return data({ success: true }, { headers });
}

export default function BudgetsRoute() {
  const { user, budgets, currencyOptions } = useLoaderData<typeof loader>();
  return <BudgetsView userEmail={user.email || ""} budgets={budgets} currencyOptions={currencyOptions} />;
}