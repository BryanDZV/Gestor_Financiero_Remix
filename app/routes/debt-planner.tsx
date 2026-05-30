import { data, redirect, useLoaderData } from "react-router";
import type { LoaderFunctionArgs } from "react-router";
import { getSupabase } from "~/utils/supabase.server";
import { DebtPlannerView } from "~/features/debt-planner/components/debt-planner-view";

export async function loader({ request }: LoaderFunctionArgs) {
  const { supabase, headers } = getSupabase(request);
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) throw redirect("/login", { headers });

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

  return data({ user, currencyOptions }, { headers });
}

export default function DebtPlannerRoute() {
  const { user, currencyOptions } = useLoaderData<typeof loader>();
  return <DebtPlannerView userEmail={user.email || ""} currencyOptions={currencyOptions} />;
}