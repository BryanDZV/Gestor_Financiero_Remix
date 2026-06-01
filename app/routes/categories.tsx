import { data, redirect, useLoaderData } from "react-router";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";
import { getSupabase } from "~/utils/supabase.server";
import { CategoriesView } from "~/features/categories/components/categories-view";
import { handleCreateCategory, handleDeleteCategories } from "~/utils/budgets.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const { supabase, headers } = getSupabase(request);
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) throw redirect("/login", { headers });

  // Traemos solo las categorías y sus iconos
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, icon')
    .eq('user_id', user.id)
    .order('name');

  return data({ user, categories: categories || [] }, { headers });
}

export async function action({ request }: ActionFunctionArgs) {
  const { supabase, headers } = getSupabase(request);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw redirect("/login", { headers });

  const formData = await request.formData();
  const intent = formData.get("_intent");

  if (intent === "create_category") return handleCreateCategory(formData, user.id, supabase, headers);
  if (intent === "delete_categories") return handleDeleteCategories(formData, supabase, headers);
  return data({ success: true }, { headers });
}

export default function CategoriesRoute() {
  const { user, categories } = useLoaderData<typeof loader>();
  return <CategoriesView userEmail={user.email || ""} categories={categories} />;
}