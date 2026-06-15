// Autenticación mínima para el panel admin.
// Configurá ADMIN_PASSWORD en las variables de entorno.
// (Para producción seria conviene migrar a Supabase Auth.)

import { cookies } from "next/headers";

export const ADMIN_COOKIE = "boostar_admin";

export function getPassword() {
  return process.env.ADMIN_PASSWORD ?? "admin1234"; // cambialo en .env
}

export async function isAuthed(): Promise<boolean> {
  const store = await cookies();
  return store.get(ADMIN_COOKIE)?.value === getPassword();
}
