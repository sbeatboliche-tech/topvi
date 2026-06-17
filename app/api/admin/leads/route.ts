import { NextRequest, NextResponse } from "next/server";
import { isAuthed } from "@/lib/auth";
import { listLeads, markDiscountSent } from "@/lib/leads";
import { sendDiscountEmail } from "@/lib/email";
import { RETURN_COUPON, couponDiscount } from "@/lib/config";

export async function GET() {
  if (!(await isAuthed()))
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  return NextResponse.json({ leads: await listLeads() });
}

// Envía manualmente el mail de descuento a un lead desde el panel.
export async function POST(req: NextRequest) {
  if (!(await isAuthed()))
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { email, locale } = await req.json();
  if (!email) {
    return NextResponse.json({ error: "Falta el email." }, { status: 400 });
  }
  const pct = couponDiscount(RETURN_COUPON);
  const ok = await sendDiscountEmail(String(email), RETURN_COUPON, pct, locale ?? "ar");
  if (!ok) {
    return NextResponse.json(
      { error: "No se pudo enviar (¿falta RESEND_API_KEY?)." },
      { status: 502 }
    );
  }
  await markDiscountSent(String(email), RETURN_COUPON);
  return NextResponse.json({ ok: true });
}
