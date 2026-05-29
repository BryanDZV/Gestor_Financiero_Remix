// app/utils/supabase.server.ts
import { createServerClient, parseCookieHeader, serializeCookieHeader } from '@supabase/ssr';

/**
 * Instancia y retorna el cliente de Supabase aislado para la petición actual.
 * Evita la contaminación de estado entre diferentes usuarios en el servidor.
 */
export function getSupabase(request: Request) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Faltan las variables de entorno de Supabase en el servidor.');
  }

  // Creamos un objeto Headers intermedio para almacenar las cookies de sesión
  const headers = new Headers();

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      // Lee las cookies entrantes del navegador del usuario
      getAll() {
        return parseCookieHeader(request.headers.get('Cookie') ?? '')
          .filter((cookie): cookie is { name: string; value: string } => Boolean(cookie.value))
          .map((cookie) => ({ name: cookie.name, value: cookie.value }));
      },
      // Inyecta las nuevas cookies (refrescos de token o inicio de sesión) en la respuesta
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          headers.append('Set-Cookie', serializeCookieHeader(name, value, options))
        );
      },
    },
  });

  return { supabase, headers };
}