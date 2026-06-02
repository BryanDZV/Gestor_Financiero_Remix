// app/routes/accounts.tsx
import { data, redirect, useLoaderData } from "react-router";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";
import { getSupabase } from "~/utils/supabase.server";
import { AccountsView } from "~/features/accounts/components/accounts-view";
import { mapRawWallets } from "~/utils/wallets.server";
import type { AccountsWallet } from "~/types";
import { getCurrencyOptionsList } from "~/utils/currency-helpers.server";
import { handleCreateWallet, handleDeleteWallets } from "~/utils/wallet-mutations.server";
import { PrivacyProvider } from "~/hooks/use-privacy";

export async function loader({ request }: LoaderFunctionArgs) {
  const { supabase, headers } = getSupabase(request);
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) throw redirect("/login", { headers });

  const { data: rawWalletsData } = await supabase
    .from('wallets')
    .select("*, transactions!transactions_wallet_id_fkey(amount, type)")
    .order('created_at', { ascending: true });

  const rawWallets = rawWalletsData || [];
  const wallets: AccountsWallet[] = mapRawWallets(rawWallets).map((w: any) => ({
    ...w,
    id: w.id || "",
    type: w.type || "account",
    current_balance: Number(w.current_balance || 0),
    target_amount: Number(w.target_amount || 0)
  }));

  const currencyOptions = await getCurrencyOptionsList();

  return data({ user, wallets, currencyOptions }, { headers });
}

export async function action({ request }: ActionFunctionArgs) {
  const { supabase, headers } = getSupabase(request);

  // 1. Validación estricta de sesión para RLS
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw redirect("/login", { headers });

  const formData = await request.formData();
  const intent = formData.get("_intent");

  if (intent === "create_wallet") {
    return handleCreateWallet(formData, user.id, supabase, headers);
  }

  if (intent === "edit_wallet") {
    const walletId = formData.get("wallet_id") as string;
    const name = formData.get("name") as string;
    const targetAmount = parseFloat(formData.get("target_amount") as string) || 0;
    const shareDivisor = parseInt(formData.get("share_divisor") as string, 10) || 1;

    const { error } = await supabase.from('wallets').update({ name, target_amount: targetAmount, share_divisor: shareDivisor }).eq('id', walletId).eq('user_id', user.id);
    if (error) return data({ error: error.message }, { headers });
    return data({ success: true }, { headers });
  }

  if (intent === "delete_wallets") {
    return handleDeleteWallets(formData, supabase, headers);
  }

  return data({ success: true }, { headers });
}

export default function AccountsRoute() {
  const { user, wallets, currencyOptions } = useLoaderData<typeof loader>();
  return (
    <PrivacyProvider namespace="accounts">
      <AccountsView userEmail={user.email || ""} wallets={wallets} currencyOptions={currencyOptions} />
    </PrivacyProvider>
  );
}