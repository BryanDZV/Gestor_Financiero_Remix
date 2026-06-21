import { data, redirect, useLoaderData } from "react-router";
import type { LoaderFunctionArgs, ActionFunctionArgs, MetaFunction } from "react-router";
import { getSupabase } from "~/utils/supabase.server";
import { SubscriptionsView } from "~/features/subscriptions/components/subscriptions-view";
import { handleCreateSubscription, handleDeleteSubscriptions, handleToggleSubscription } from "~/utils/subscriptions.server";

export const meta: MetaFunction = () => {
  return [
    { title: "Suscripciones y Gastos Fijos | Finanzas Pro" },
    { name: "description", content: "Lleva el control de tus pagos recurrentes, suscripciones y servicios para no pagar de más." },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const { supabase, headers } = getSupabase(request);
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) throw redirect("/login", { headers });

  const [subsResponse, walletsResponse] = await Promise.all([
    supabase
      .from('subscriptions')
      .select('*, wallets(name, currency)')
      .eq('user_id', user.id)
      .order('active', { ascending: false })
      .order('name', { ascending: true }),
    supabase.from('wallets').select('id, name').eq('user_id', user.id).order('name', { ascending: true })
  ]);

  return data({ user, subscriptions: subsResponse.data || [], wallets: walletsResponse.data || [] }, { headers });
}

export async function action({ request }: ActionFunctionArgs) {
  const { supabase, headers } = getSupabase(request);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw redirect("/login", { headers });

  const formData = await request.formData();
  const intent = formData.get("_intent");

  if (intent === "create_subscription") {
    return handleCreateSubscription(formData, user.id, supabase, headers);
  }
  
  if (intent === "toggle_subscription") {
    return handleToggleSubscription(formData, supabase, headers);
  }

  if (intent === "delete_subscriptions") {
    return handleDeleteSubscriptions(formData, supabase, headers);
  }
  
  return data({ success: true }, { headers });
}

export default function SubscriptionsRoute() {
  const { user, subscriptions, wallets } = useLoaderData<typeof loader>();
  return <SubscriptionsView userEmail={user.email || ""} subscriptions={subscriptions} wallets={wallets} />;
}