// app/routes/login.tsx
import { data, redirect, useActionData, useNavigation } from "react-router";
import type { ActionFunctionArgs } from "react-router";
import { getSupabase } from "../utils/supabase.server";
import { LoginForm } from "../features/auth/components/login-form";

/**
 * ACTION (Servidor): Se ejecuta cuando el cliente hace el envío POST del formulario.
 */
export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  // Inicializamos la infraestructura de Supabase para esta petición HTTP específica
  const { supabase, headers } = getSupabase(request);

  // Ejecutamos la llamada al servicio de autenticación
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    // Retornamos el error serializado en JSON si la autenticación falla
    return data({ error: error.message }, { headers });
  }

  // Redirección exitosa. IMPORTANTE: Se inyectan las cabeceras que contienen la cookie de sesión
  return redirect("/dashboard", { headers });
}

/**
 * COMPONENTE (Cliente/Servidor): Mapea el estado del framework hacia el componente visual
 */
export default function LoginRoute() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();

  // Comprobamos si el formulario está en estado de envío activo (submitting)
  const isSubmitting = navigation.state === "submitting";

  return <LoginForm error={actionData?.error} isSubmitting={isSubmitting} />;
}