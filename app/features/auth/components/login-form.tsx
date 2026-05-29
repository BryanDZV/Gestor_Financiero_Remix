// app/features/auth/components/login-form.tsx
import { Form } from "react-router";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";

interface LoginFormProps {
  error?: string;
  isSubmitting: boolean;
}

/**
 * Componente de Presentación Puro (Dumb Component).
 * No sabe nada de Supabase ni de bases de datos, solo renderiza la UI.
 */
export function LoginForm({ error, isSubmitting }: LoginFormProps) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 px-4 py-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(37,99,235,0.08),transparent_32%),linear-gradient(180deg,rgba(248,250,252,1),rgba(241,245,249,1))]" />

      <Card className="relative w-full max-w-md border-slate-200/80">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-3xl tracking-tight">Finanzas Pro</CardTitle>
          <CardDescription>Acceso seguro al panel de gestión financiera</CardDescription>
        </CardHeader>

        <CardContent>
          <Form method="post" className="space-y-5">
            {error && (
              <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <span className="font-semibold">Error de acceso:</span> {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
                Email corporativo
              </label>
              <input
                type="email"
                name="email"
                placeholder="nombre@empresa.com"
                required
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
                Contraseña
              </label>
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                required
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <Button type="submit" disabled={isSubmitting} className="h-11 w-full rounded-xl bg-blue-600 text-white shadow-sm hover:bg-blue-700">
              {isSubmitting ? "Autenticando..." : "Iniciar sesión"}
            </Button>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}