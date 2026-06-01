// app/routes/dashboard.tsx
import { data, redirect, useLoaderData } from "react-router";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";
import { getSupabase } from "~/utils/supabase.server";
import { DashboardView } from "~/features/dashboard/components/dashboard-view";
import { mapRawWallets } from "~/utils/wallets.server";
import type { DashboardWallet, DashboardTransaction } from "~/types";

// (Loader y Action se mantienen exactamente igual, la seguridad no cambia)
export async function loader({ request }: LoaderFunctionArgs) {
  const { supabase, headers } = getSupabase(request);
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) throw redirect("/login", { headers });

  const [walletsResponse, transactionsResponse] = await Promise.all([
    supabase.from('wallets').select("*, transactions!transactions_wallet_id_fkey(amount, type)").order('created_at', { ascending: true }),
    supabase.from('transactions').select('id, concept, amount, type, date, wallets(name, currency)').order('date', { ascending: false }).limit(10)
  ]);

  const rawWallets = walletsResponse.data || [];
  const wallets: DashboardWallet[] = mapRawWallets(rawWallets).map((w: any) => ({
    id: w.id || "",
    name: w.name,
    type: w.type || "account",
    initial_balance: Number(w.initial_balance || 0),
    current_balance: Number(w.current_balance || 0),
    is_liability: w.is_liability,
    currency: w.currency
  }));

  // Mapeo seguro: transforma el resultado de Supabase (que retorna la relación wallets como un array) a nuestro modelo esperado
  const rawTransactions = transactionsResponse.data || [];
  const transactions: DashboardTransaction[] = rawTransactions.map((tx: any) => ({
    id: tx.id,
    concept: tx.concept,
    amount: tx.amount,
    type: tx.type,
    date: tx.date,
    wallets: Array.isArray(tx.wallets) ? tx.wallets[0] : tx.wallets
  }));

  return data(
    { user, wallets, transactions },
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