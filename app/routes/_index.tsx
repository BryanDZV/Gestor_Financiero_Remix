import { redirect } from "react-router";
import type { LoaderFunctionArgs, MetaFunction } from "react-router";
import { getSupabase } from "~/utils/supabase.server";
import { LandingView } from "~/features/landing/components/landing-view";

export const meta: MetaFunction = () => {
  return [
    { title: "Finanzas Pro | Tu gestor financiero personal" },
    { name: "description", content: "Toma el control de tus cuentas, presupuestos y patrimonio de forma segura con Finanzas Pro." },
  ];
};

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