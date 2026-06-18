import { NextRequest, NextResponse } from "next/server";
import { trackVisit } from "@/lib/visits";

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
