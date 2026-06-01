import { redirect } from "react-router";
import type { LoaderFunctionArgs } from "react-router";
import { getSupabase } from "~/utils/supabase.server";
import { LandingView } from "~/features/landing/components/landing-view";

export async function loader({ request }: LoaderFunctionArgs) {
  const { supabase, headers } = getSupabase(request);
  const { data: { user } } = await supabase.auth.getUser();

  // Si el usuario ya tiene sesión activa, lo mandamos directo al dashboard
  if (user) {
    throw redirect("/dashboard", { headers });
  }
  return null;
}

export default function IndexRoute() {
  return <LandingView />;
}