import { NextRequest, NextResponse } from "next/server";
import { trackVisit } from "@/lib/visits";

// Diagnóstico: /api/track?key=TOPVIRAL-TEST-2026 → dice si la tabla existe.
export async function GET(req: NextRequest) {
  if (req.nextUrl.searchParams.get("key") !== "TOPVIRAL-TEST-2026") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const url = process.env.SUPABASE_URL;
  const projectRef = url ? url.replace(/^https?:\/\//, "").split(".")[0] : null;
  if (!url || !process.env.SUPABASE_SERVICE_KEY) {
    return NextResponse.json({ supabase: false, project_ref: projectRef });
  }
  const { createClient } = await import("@supabase/supabase-js");
  const sb = createClient(url, process.env.SUPABASE_SERVICE_KEY!, {
    auth: { persistSession: false },
  });
  await sb.from("visitors").insert({ ip: "diag-check", stage: "home", rank: 1 });
  const sel = await sb.from("visitors").select("ip", { count: "exact" });
  return NextResponse.json({
    supabase: true,
    project_ref: projectRef,
    table_error: sel.error?.message ?? null,
    count: sel.count ?? (sel.data?.length ?? 0),
  });
}

export const runtime = "nodejs";

// Registra el eslabón del embudo al que llegó la IP. Fire-and-forget.
export async function POST(req: NextRequest) {
  try {
    const { stage } = await req.json().catch(() => ({}));
    const ip =
      (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";
    if (stage) await trackVisit(ip, String(stage));
  } catch (err) {
    console.error("[api/track]", err);
  }
  return NextResponse.json({ ok: true });
}
