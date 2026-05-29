import { data, redirect, useLoaderData } from "react-router";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";
import { getSupabase } from "~/utils/supabase.server";
import { SubscriptionsView } from "~/features/subscriptions/components/subscriptions-view";

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
    const walletId = formData.get("wallet_id") as string || null;
    const amount = parseFloat(formData.get("amount") as string) || 0;
    const name = formData.get("name") as string;
    const startDate = formData.get("start_date") as string || new Date().toISOString().split('T')[0];

    const { error } = await supabase.from('subscriptions').insert({
      user_id: user.id,
      name,
      amount,
      billing_period: formData.get("billing_period"),
      active: true,
      wallet_id: walletId,
      start_date: startDate,
    });
    
    // Magia: Si seleccionó una cuenta, le inyectamos automáticamente el primer pago
    if (!error && walletId) {
      const { data: cycle } = await supabase
        .from('cycles')
        .select('id')
        .eq('wallet_id', walletId)
        .eq('is_closed', false)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (cycle) {
        await supabase.from('transactions').insert({
          user_id: user.id,
          wallet_id: walletId,
          cycle_id: cycle.id,
          concept: `Suscripción: ${name}`,
          amount: amount,
          type: 'expense',
          date: startDate,
        });
      }
    }
    
    if (error) return data({ error: error.message }, { headers });
  }
  
  if (intent === "toggle_subscription") {
    const id = formData.get("subscription_id");
    const active = formData.get("active") === "true";
    await supabase.from('subscriptions').update({ active: !active }).eq('id', id);
  }

  if (intent === "delete_subscriptions") {
    const ids = formData.getAll("subscription_ids") as string[];
    if (ids.length) await supabase.from('subscriptions').delete().in('id', ids);
  }
  
  return data({ success: true }, { headers });
}

export default function SubscriptionsRoute() {
  const { user, subscriptions, wallets } = useLoaderData<typeof loader>();
  return <SubscriptionsView userEmail={user.email || ""} subscriptions={subscriptions} wallets={wallets} />;
}