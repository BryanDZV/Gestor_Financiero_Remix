import { data, redirect, useLoaderData } from "react-router";
import type { LoaderFunctionArgs, MetaFunction } from "react-router";
import { getSupabase } from "~/utils/supabase.server";
import { DebtPlannerView } from "~/features/debt-planner/components/debt-planner-view";
import { getCurrencyOptionsList } from "~/utils/currency-helpers.server";

export const meta: MetaFunction = () => {
  return [
    { title: "Planificador de Deudas | Finanzas Pro" },
    { name: "description", content: "Planifica el pago de tus deudas inteligentemente utilizando el método bola de nieve o avalancha." },
  ];
};

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