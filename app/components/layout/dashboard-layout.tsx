// app/components/layout/dashboard-layout.tsx
import { Form, Link, useLocation } from "react-router";
import { Button } from "~/components/ui/button";
import { LayoutDashboard, Wallet, LogOut, PieChart, Repeat, Calculator, Coins, BarChart3, Tags } from "lucide-react";
import type { DashboardLayoutProps } from "~/types";
import { ThemeToggle } from "~/components/ui/theme-toggle";

export function DashboardLayout({ userEmail, children }: DashboardLayoutProps) {
  const location = useLocation();

  // Configuración de las rutas del menú lateral
  const navItems = [
    { name: "Resumen", path: "/dashboard", icon: LayoutDashboard },
    { name: "Mis Cuentas", path: "/dashboard/cuentas", icon: Wallet },
    { name: "Categorías", path: "/dashboard/categorias", icon: Tags },
    { name: "Presupuestos", path: "/dashboard/presupuestos", icon: PieChart },
    { name: "Monedas", path: "/dashboard/monedas", icon: Coins },
    { name: "Suscripciones", path: "/dashboard/suscripciones", icon: Repeat },
    { name: "Planificador", path: "/dashboard/planificador", icon: Calculator },
    { name: "Análisis", path: "/dashboard/analytics", icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors md:flex">
      <aside className="hidden w-72 flex-col border-r border-border bg-card transition-colors md:flex">
        <div className="flex h-20 items-center justify-between border-b border-border px-6">
          <Link to="/" className="block hover:opacity-80 transition-opacity">
            <h2 className="text-xl font-semibold tracking-tight text-foreground">Finanzas Pro</h2>
            <p className="text-xs text-muted-foreground">Gestión financiera premium</p>
          </Link>
          <ThemeToggle />
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
                className={`w-full justify-start rounded-xl px-3 py-2.5 ${isActive ? "bg-secondary font-medium text-secondary-foreground" : "text-muted-foreground hover:bg-muted"}`}
              >
                <Link to={item.path}>
                  <Icon className="mr-3 size-4" />
                  {item.name}
                </Link>
              </Button>
            );
          })}
        </nav>

        <div className="border-t border-border p-4">
          <div className="mb-4 rounded-2xl border border-border bg-muted/50 px-3 py-2">
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">Sesión</p>
            <p className="mt-1 truncate text-sm text-foreground" title={userEmail}>
              {userEmail}
            </p>
          </div>

          <Form method="post" action="/dashboard">
            <Button variant="outline" type="submit" className="w-full justify-start rounded-xl border-border">
              <LogOut className="mr-3 size-4" />
              Cerrar sesión
            </Button>
          </Form>
        </div>
      </aside>

      <div className="flex-1 min-w-0">
        <header className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur transition-colors md:hidden">
          <div className="flex items-center justify-between gap-3 px-4 py-3">
            <Link to="/" className="block hover:opacity-80 transition-opacity">
              <h2 className="text-base font-semibold tracking-tight text-foreground">Finanzas Pro</h2>
              <p className="text-xs text-muted-foreground">Panel financiero</p>
            </Link>

            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Form method="post" action="/dashboard">
                <Button variant="outline" type="submit" size="sm" className="rounded-full border-border px-3" aria-label="Cerrar sesión">
                  <LogOut className="size-4" />
                </Button>
              </Form>
            </div>
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
                  className={`justify-start rounded-xl px-3 py-2 text-sm ${isActive ? "bg-secondary font-medium text-secondary-foreground" : "text-muted-foreground hover:bg-muted"}`}
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