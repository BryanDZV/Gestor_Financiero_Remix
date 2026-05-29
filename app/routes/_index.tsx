import { Link } from "react-router";
import { redirect } from "react-router";
import type { LoaderFunctionArgs } from "react-router";
import { Button } from "~/components/ui/button";
import { Wallet, PieChart, ShieldCheck, TrendingUp } from "lucide-react";
import { getSupabase } from "~/utils/supabase.server";

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
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 font-sans text-slate-900">
      {/* Barra de Navegación */}
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-slate-200 bg-white/80 px-6 py-4 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
            <TrendingUp className="size-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">Finanzas Pro</span>
        </div>
        <nav className="flex items-center gap-2">
          <Button asChild className="rounded-xl bg-blue-600 text-white shadow-sm hover:bg-blue-700">
            <Link to="/login">Iniciar Sesión</Link>
          </Button>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-20 text-center sm:py-32">
        <div className="mb-6 inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
          <span className="mr-2 flex size-2 rounded-full bg-blue-600 animate-pulse"></span>
          Tu nuevo gestor financiero personal
        </div>
        
        <h1 className="max-w-4xl text-5xl font-extrabold tracking-tight text-slate-900 sm:text-6xl lg:text-7xl">
          Toma el control de tus <span className="bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">cuentas</span>
        </h1>

        {/* Grid de Características */}
        <div className="mt-24 grid w-full max-w-5xl grid-cols-1 gap-8 text-left md:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition-shadow hover:shadow-md">
            <div className="mb-6 flex size-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
              <PieChart className="size-6" />
            </div>
            <h3 className="text-lg font-semibold tracking-tight text-slate-900">Soporte Multimoneda</h3>
            <p className="mt-2 text-slate-500">Gestiona tu dinero en Euros, Dólares o la moneda que necesites sin mezclar tus balances ni tu patrimonio real.</p>
          </div>
          
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition-shadow hover:shadow-md">
            <div className="mb-6 flex size-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
              <Wallet className="size-6" />
            </div>
            <h3 className="text-lg font-semibold tracking-tight text-slate-900">Cuentas y Transferencias</h3>
            <p className="mt-2 text-slate-500">Organiza tus finanzas por periodos mensuales y mueve dinero mágicamente entre tus cuentas con un solo clic.</p>
          </div>
          
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition-shadow hover:shadow-md">
            <div className="mb-6 flex size-12 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600">
              <ShieldCheck className="size-6" />
            </div>
            <h3 className="text-lg font-semibold tracking-tight text-slate-900">Privacidad y Seguridad</h3>
            <p className="mt-2 text-slate-500">Tus datos están protegidos en la nube mediante Row Level Security (RLS) y encriptación de nivel bancario.</p>
          </div>
        </div>
      </main>
    </div>
  );
}