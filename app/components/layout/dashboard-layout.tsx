// app/components/layout/dashboard-layout.tsx
import { Form, Link, useLocation } from "react-router";
import { Button } from "~/components/ui/button";
import { LayoutDashboard, Wallet, LogOut, PieChart, Repeat, Calculator, Coins } from "lucide-react";
import type { DashboardLayoutProps } from "~/types";

export function DashboardLayout({ userEmail, children }: DashboardLayoutProps) {
  const location = useLocation();

  // Configuración de las rutas del menú lateral
  const navItems = [
    { name: "Resumen", path: "/dashboard", icon: LayoutDashboard },
    { name: "Mis Cuentas", path: "/dashboard/cuentas", icon: Wallet },
    { name: "Presupuestos", path: "/dashboard/presupuestos", icon: PieChart },
    { name: "Monedas", path: "/dashboard/monedas", icon: Coins },
    { name: "Suscripciones", path: "/dashboard/suscripciones", icon: Repeat },
    { name: "Planificador", path: "/dashboard/planificador", icon: Calculator },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 md:flex">
      <aside className="hidden w-72 flex-col border-r border-slate-200 bg-white md:flex">
        <div className="flex h-20 items-center border-b border-slate-100 px-6">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-slate-900">Finanzas Pro</h2>
            <p className="text-xs text-slate-500">Gestión financiera premium</p>
          </div>
        </div>

        <nav className="flex-1 space-y-2 px-4 py-6">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            return (
              <Button
                key={item.name}
                asChild
                variant={isActive ? "secondary" : "ghost"}
                className={`w-full justify-start rounded-xl px-3 py-2.5 ${isActive ? "bg-slate-100 font-medium text-slate-900" : "text-slate-600"}`}
              >
                <Link to={item.path}>
                  <Icon className="mr-3 size-4" />
                  {item.name}
                </Link>
              </Button>
            );
          })}
        </nav>

        <div className="border-t border-slate-100 p-4">
          <div className="mb-4 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-slate-500">Sesión</p>
            <p className="mt-1 truncate text-sm text-slate-700" title={userEmail}>
              {userEmail}
            </p>
          </div>

          <Form method="post" action="/dashboard">
            <Button variant="outline" type="submit" className="w-full justify-start rounded-xl border-slate-200">
              <LogOut className="mr-3 size-4" />
              Cerrar sesión
            </Button>
          </Form>
        </div>
      </aside>

      <div className="flex-1 min-w-0">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur md:hidden">
          <div className="flex items-center justify-between gap-3 px-4 py-3">
            <div>
              <h2 className="text-base font-semibold tracking-tight text-slate-900">Finanzas Pro</h2>
              <p className="text-xs text-slate-500">Panel financiero</p>
            </div>

            <Form method="post" action="/dashboard">
              <Button variant="outline" type="submit" size="sm" className="rounded-full border-slate-200 px-3">
                <LogOut className="size-4" />
              </Button>
            </Form>
          </div>

          <nav className="grid grid-cols-2 gap-2 border-t border-slate-100 px-4 py-3">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;

              return (
                <Button
                  key={item.name}
                  asChild
                  variant={isActive ? "secondary" : "ghost"}
                  className={`justify-start rounded-xl px-3 py-2 text-sm ${isActive ? "bg-slate-100 font-medium text-slate-900" : "text-slate-600"}`}
                >
                  <Link to={item.path}>
                    <Icon className="mr-2 size-4" />
                    {item.name}
                  </Link>
                </Button>
              );
            })}
          </nav>
        </header>

        <main className="min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}