import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TOKEN = "TOPVIRAL-TEST-2026";

// Diagnóstico crudo de la tabla leads: dice el error exacto de Supabase.
export async function GET(req: NextRequest) {
  if (req.nextUrl.searchParams.get("key") !== TOKEN) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const url = process.env.SUPABASE_URL;
  const keySet = !!process.env.SUPABASE_SERVICE_KEY;
  // project ref = subdominio de la URL (xxxx.supabase.co)
  const projectRef = url ? url.replace(/^https?:\/\//, "").split(".")[0] : null;
  if (!url || !keySet) {
    return NextResponse.json({ supabase_configurado: false, url: !!url, key: keySet });
  }
  const { createClient } = await import("@supabase/supabase-js");
  const sb = createClient(url, process.env.SUPABASE_SERVICE_KEY!, {
    auth: { persistSession: false },
  });

  const insert = await sb
    .from("leads")
    .upsert(
      { email: "diag@test.com", status: "lead", winback_sent_at: null, updated_at: new Date().toISOString() },
      { onConflict: "email" }
    );
  const select = await sb.from("leads").select("email").limit(5);

  return NextResponse.json({
    supabase_configurado: true,
    project_ref: projectRef,
    insert_error: insert.error?.message ?? null,
    select_error: select.error?.message ?? null,
    filas: select.data ?? [],
  });
}
