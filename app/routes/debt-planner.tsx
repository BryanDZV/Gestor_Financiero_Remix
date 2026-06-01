import { data, redirect, useLoaderData } from "react-router";
import type { LoaderFunctionArgs } from "react-router";
import { getSupabase } from "~/utils/supabase.server";
import { DebtPlannerView } from "~/features/debt-planner/components/debt-planner-view";
import { getCurrencyOptionsList } from "~/utils/currency-helpers.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const { supabase, headers } = getSupabase(request);
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) throw redirect("/login", { headers });

  // Obtenemos todas las monedas disponibles en la API
  const currencyOptions = await getCurrencyOptionsList();

  return data({ user, currencyOptions }, { headers });
}

export default function DebtPlannerRoute() {
  const { user, currencyOptions } = useLoaderData<typeof loader>();
  return <DebtPlannerView userEmail={user.email || ""} currencyOptions={currencyOptions} />;
}