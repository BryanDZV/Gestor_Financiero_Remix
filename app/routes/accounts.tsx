// app/routes/accounts.tsx
import { data, redirect, useLoaderData } from "react-router";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";
import { getSupabase } from "~/utils/supabase.server";
import { AccountsView } from "~/features/accounts/components/accounts-view";
import { mapRawWallets } from "~/utils/wallets.server";
import type { WalletViewModel } from "~/types/models";

export async function loader({ request }: LoaderFunctionArgs) {
  const { supabase, headers } = getSupabase(request);
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) throw redirect("/login", { headers });

  const { data: rawWalletsData } = await supabase
    .from('wallets')
    .select("*, transactions!transactions_wallet_id_fkey(amount, type)")
    .order('created_at', { ascending: true });

  const wallets: WalletViewModel[] = mapRawWallets(rawWalletsData);

  return data({ user, wallets }, { headers });
}

export async function action({ request }: ActionFunctionArgs) {
  const { supabase, headers } = getSupabase(request);

  // 1. Validación estricta de sesión para RLS
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw redirect("/login", { headers });

  const formData = await request.formData();
  const intent = formData.get("_intent");

  if (intent === "create_wallet") {
    const name = formData.get("name") as string;
    const isLiability = formData.get("is_liability") === "true";
    const initialBalance = parseFloat(formData.get("initial_balance") as string) || 0;
    const targetAmount = parseFloat(formData.get("target_amount") as string) || 0;
    const shareDivisor = parseInt(formData.get("share_divisor") as string, 10) || 1;
    const type = isLiability ? "credit" : "cash";
    const currency = formData.get("currency") as string || "EUR";

    // 2. Inserción con la Clave Foránea del propietario
    const payload = {
      user_id: user.id,
      name,
      type,
      is_liability: isLiability,
      initial_balance: initialBalance,
      target_amount: targetAmount,
      share_divisor: shareDivisor,
      currency,
    };

    const { data: inserted, error } = await supabase.from('wallets').insert(payload).select();

    if (error) {
      return data({ error: error.message }, { headers });
    }

    return redirect("/dashboard/cuentas", { headers });
  }

  if (intent === "delete_wallets") {
    const walletIds = formData.getAll("wallet_ids") as string[];
    if (!walletIds.length) return data({ success: true }, { headers });
    
    const { error } = await supabase.from('wallets').delete().in('id', walletIds);
    if (error) {
      return data({ error: error.message }, { headers });
    }
    
    return data({ success: true }, { headers });
  }

  return data({ success: true }, { headers });
}

export default function AccountsRoute() {
  const { user, wallets } = useLoaderData<typeof loader>();
  return <AccountsView userEmail={user.email || ""} wallets={wallets} />;
}