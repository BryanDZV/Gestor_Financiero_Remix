import { data, redirect, useLoaderData } from "react-router";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";
import { getSupabase } from "~/utils/supabase.server";
import { BudgetsView } from "~/features/budgets/components/budgets-view";
import { getCurrencyOptionsList } from "~/utils/currency-helpers.server";
import { getBudgetsData, handleCreateBudget, handleEditBudget, handleDeleteBudgets } from "~/utils/budgets.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const { supabase, headers } = getSupabase(request);
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) throw redirect("/login", { headers });

  const budgets = await getBudgetsData(user.id, supabase);

  // Obtenemos todas las monedas disponibles en la API
  const currencyOptions = await getCurrencyOptionsList();

  return data({ user, budgets, currencyOptions }, { headers });
}

export async function action({ request }: ActionFunctionArgs) {
  const { supabase, headers } = getSupabase(request);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw redirect("/login", { headers });

  const formData = await request.formData();
  const intent = formData.get("_intent");

  if (intent === "create_budget") {
    return handleCreateBudget(formData, user.id, supabase, headers);
  }

  if (intent === "edit_budget") {
    return handleEditBudget(formData, user.id, supabase, headers);
  }

  if (intent === "delete_budgets") {
    return handleDeleteBudgets(formData, supabase, headers);
  }
  return data({ success: true }, { headers });
}

export default function BudgetsRoute() {
  const { user, budgets, currencyOptions } = useLoaderData<typeof loader>();
  return <BudgetsView userEmail={user.email || ""} budgets={budgets} currencyOptions={currencyOptions} />;
}