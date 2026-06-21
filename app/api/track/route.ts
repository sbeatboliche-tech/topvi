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
  const sel = await sb
    .from("visitors")
    .select("stage, ip, last_at")
    .order("last_at", { ascending: false })
    .limit(500);
  const rows = sel.data ?? [];
  const byStage: Record<string, number> = {};
  for (const r of rows) byStage[r.stage] = (byStage[r.stage] ?? 0) + 1;
  return NextResponse.json({
    supabase: true,
    project_ref: projectRef,
    table_error: sel.error?.message ?? null,
    total: rows.length,
    por_eslabon: byStage,
    ultimos: rows.slice(0, 8),
  });
}

export const runtime = "nodejs";

// Registra el eslabón del embudo al que llegó la IP. Fire-and-forget.
export async function POST(req: NextRequest) {
  try {
    const { stage, seconds } = await req.json().catch(() => ({}));
    const ip =
      (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";
    // Geo de Vercel: región/provincia y ciudad (si están disponibles).
    const region = decodeURIComponent(
      req.headers.get("x-vercel-ip-country-region") || ""
    );
    const city = decodeURIComponent(req.headers.get("x-vercel-ip-city") || "");
    const geo = [city, region].filter(Boolean).join(", ") || undefined;
    if (stage) await trackVisit(ip, String(stage), geo, typeof seconds === "number" ? seconds : undefined);
  } catch (err) {
    console.error("[api/track]", err);
  }
  return NextResponse.json({ ok: true });
}
