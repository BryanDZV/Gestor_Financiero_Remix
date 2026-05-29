// app/routes/dashboard.tsx
import { data, redirect, useLoaderData } from "react-router";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";
import { getSupabase } from "~/utils/supabase.server";
import { DashboardView } from "~/features/dashboard/components/dashboard-view";
import { mapRawWallets } from "~/utils/wallets.server";
import type { WalletViewModel } from "~/types/models";

// (Loader y Action se mantienen exactamente igual, la seguridad no cambia)
export async function loader({ request }: LoaderFunctionArgs) {
  const { supabase, headers } = getSupabase(request);
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) throw redirect("/login", { headers });

  const [walletsResponse, transactionsResponse] = await Promise.all([
    supabase.from('wallets').select("*, transactions!transactions_wallet_id_fkey(amount, type)").order('created_at', { ascending: true }),
    supabase.from('transactions').select('*, wallets(name, currency)').order('date', { ascending: false }).limit(10)
  ]);

  const wallets: WalletViewModel[] = mapRawWallets(walletsResponse.data);

  return data(
    { user, wallets, transactions: transactionsResponse.data || [] },
    { headers }
  );
}

export async function action({ request }: ActionFunctionArgs) {
  const { supabase, headers } = getSupabase(request);
  await supabase.auth.signOut();
  return redirect("/login", { headers });
}

export default function DashboardRoute() {
  const { user, wallets, transactions } = useLoaderData<typeof loader>();

  return <DashboardView userEmail={user.email || ""} wallets={wallets} transactions={transactions} />;
}