import { NextRequest, NextResponse } from "next/server";
import { captureLead } from "@/lib/leads";

// Captura un email apenas lo escriben en el checkout (aunque no compren).
// Nunca rompe el flujo: si algo falla, igual devuelve ok.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    await captureLead({
      email: String(body.contact ?? ""),
      locale: body.locale ? String(body.locale) : undefined,
      service: body.service ? String(body.service) : undefined,
      source: body.source ? String(body.source) : "checkout",
    });
  } catch (err) {
    console.error("[api/leads]", err);
  }
  return NextResponse.json({ ok: true });
}
