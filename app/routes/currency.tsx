import { data, redirect, useActionData, useLoaderData } from "react-router";
import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from "react-router";

import { getSupabase } from "~/utils/supabase.server";
import { fetchCurrencyOptions, fetchExchangeRatesSnapshot } from "~/utils/exchange-rates.server";
import { addCurrencyFavorite, fetchCurrencyFavorites, removeCurrencyFavorite } from "~/utils/currency-favorites.server";
import { CurrencyView } from "~/features/currency/components/currency-view";

export const meta: MetaFunction = () => {
  return [
    { title: "Tipos de Cambio | Finanzas Pro" },
    { name: "description", content: "Consulta las tasas de cambio en tiempo real y gestiona tus monedas favoritas." },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const { supabase, headers } = getSupabase(request);
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) throw redirect("/login", { headers });

  try {
    const [snapshot, options, favorites] = await Promise.all([
      fetchExchangeRatesSnapshot("EUR"),
      fetchCurrencyOptions(),
      fetchCurrencyFavorites(supabase, user.id),
    ]);

    return data(
      {
        user,
        snapshot,
        options,
        favorites,
        error: null,
        fetchedAt: new Date().toISOString(),
      },
      { headers }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error desconocido al cargar tasas de cambio.";

    return data(
      {
        user,
        snapshot: null,
        options: [],
        favorites: [],
        error: message,
        fetchedAt: new Date().toISOString(),
      },
      { headers }
    );
  }
}

export async function action({ request }: ActionFunctionArgs) {
  const { supabase, headers } = getSupabase(request);
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) throw redirect("/login", { headers });

  const formData = await request.formData();
  const intent = formData.get("_intent");
  const currencyCode = String(formData.get("currency_code") || "").toUpperCase();

  if (!currencyCode) {
    return data({ error: "Selecciona una moneda válida." }, { headers });
  }

  try {
    if (intent === "add_favorite") {
      await addCurrencyFavorite(supabase, user.id, currencyCode);
    }

    if (intent === "remove_favorite") {
      await removeCurrencyFavorite(supabase, user.id, currencyCode);
    }

    return data({ success: true }, { headers });
  } catch (actionError) {
    const message = actionError instanceof Error ? actionError.message : "No se pudo actualizar la moneda favorita.";
    return data({ error: message }, { headers });
  }
}

export default function CurrencyRoute() {
  const { user, snapshot, options, favorites, error, fetchedAt } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  return (
    <CurrencyView
      userEmail={user.email || ""}
      snapshot={snapshot}
      options={options}
      favorites={favorites}
      actionError={actionData && "error" in actionData ? actionData.error : undefined}
      error={error ?? undefined}
      fetchedAt={fetchedAt}
    />
  );
}
