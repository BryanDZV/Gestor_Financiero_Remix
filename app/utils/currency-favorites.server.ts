// app/utils/currency-favorites.server.ts
import type { SupabaseClient } from "@supabase/supabase-js";
import type { CurrencyFavoriteRow } from "~/types/models";

export async function fetchCurrencyFavorites(supabase: SupabaseClient, userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from("currency_favorites")
    .select("currency_code")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  return (data as Pick<CurrencyFavoriteRow, "currency_code">[] | null | undefined)?.map((row) => row.currency_code) ?? [];
}

export async function addCurrencyFavorite(supabase: SupabaseClient, userId: string, currencyCode: string) {
  const { error } = await supabase.from("currency_favorites").upsert(
    {
      user_id: userId,
      currency_code: currencyCode,
    },
    {
      onConflict: "user_id,currency_code",
      ignoreDuplicates: false,
    },
  );

  if (error) {
    throw error;
  }
}

export async function removeCurrencyFavorite(supabase: SupabaseClient, userId: string, currencyCode: string) {
  const { error } = await supabase
    .from("currency_favorites")
    .delete()
    .eq("user_id", userId)
    .eq("currency_code", currencyCode);

  if (error) {
    throw error;
  }
}
