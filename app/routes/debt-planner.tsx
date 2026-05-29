import { data, redirect, useLoaderData } from "react-router";
import type { LoaderFunctionArgs } from "react-router";
import { getSupabase } from "~/utils/supabase.server";
import { DebtPlannerView } from "~/features/debt-planner/components/debt-planner-view";

export async function loader({ request }: LoaderFunctionArgs) {
  const { supabase, headers } = getSupabase(request);
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) throw redirect("/login", { headers });

  return data({ user }, { headers });
}

export default function DebtPlannerRoute() {
  const { user } = useLoaderData<typeof loader>();
  return <DebtPlannerView userEmail={user.email || ""} />;
}