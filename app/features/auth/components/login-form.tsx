import { Form, Link } from "react-router";
import { useState } from "react";
import { TrendingUp } from "lucide-react";
import { Input } from "~/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "~/components/ui/card";
import { FormError } from "~/components/ui/form-error";
import { SubmitButton } from "~/components/ui/submit-button";
import { ThemeToggle } from "~/components/ui/theme-toggle";

export function LoginForm({ error, isSubmitting }: { error?: string, isSubmitting: boolean }) {
  const [isRegister, setIsRegister] = useState(false);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-4 py-16 relative">
      <div className="absolute top-4 left-4 sm:top-6 sm:left-6">
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity" title="Volver a la portada">
          <div className="flex size-8 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
            <TrendingUp className="size-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground hidden sm:inline-block">Finanzas Pro</span>
        </Link>
      </div>
      <div className="absolute top-4 right-4"><ThemeToggle /></div>
      <Card className="border-border shadow-lg">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-3xl font-bold tracking-tight text-foreground">
            {isRegister ? "Crear cuenta" : "Bienvenido de nuevo"}
          </CardTitle>
          <CardDescription>
            {isRegister 
              ? "Ingresa un correo y contraseña para probar Finanzas Pro." 
              : "Ingresa a tu cuenta para gestionar tus finanzas."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form method="post" className="space-y-4">
            <input type="hidden" name="_intent" value={isRegister ? "register" : "login"} />
            
            <FormError error={error} />
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Correo electrónico</label>
              <Input type="email" name="email" placeholder="tu@correo.com" required />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground">Contraseña</label>
              </div>
              <Input type="password" name="password" placeholder="••••••••" required minLength={6} />
            </div>

            <SubmitButton isSubmitting={isSubmitting} className="w-full mt-4">
              {isRegister ? "Registrarme y probar" : "Iniciar sesión"}
            </SubmitButton>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col gap-4 border-t border-border px-6 py-4">
          <div className="text-sm text-center text-muted-foreground">
            {isRegister ? "¿Ya tienes una cuenta? " : "¿No tienes una cuenta? "}
            <button type="button" onClick={() => setIsRegister(!isRegister)} className="font-semibold text-primary hover:underline">
              {isRegister ? "Inicia sesión" : "Regístrate gratis"}
            </button>
          </div>
        </CardFooter>
      </Card>
    </main>
  );
}