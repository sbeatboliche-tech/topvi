import { NextRequest, NextResponse } from "next/server";
import { leadsNeedingDiscount, markDiscountSent } from "@/lib/leads";
import { sendDiscountEmail } from "@/lib/email";
import { RETURN_COUPON, couponDiscount } from "@/lib/config";

// Cron: manda el mail de descuento a los leads que NO compraron, pasadas
// HOURS_BEFORE_DISCOUNT horas, una sola vez por lead.
// Lo dispara Vercel Cron (ver vercel.json). También se puede llamar manual
// con el header Authorization: Bearer <CRON_SECRET>.
export const dynamic = "force-dynamic";

const HOURS_BEFORE_DISCOUNT = 2;

function authorized(req: NextRequest): boolean {
  // Vercel Cron agrega este header automáticamente.
  if (req.headers.get("x-vercel-cron")) return true;
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get("authorization") === `Bearer ${secret}`) {
    return true;
  }
  // Si no hay secreto configurado, permitimos (útil en dev).
  return !secret;
}

export async function GET(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const pct = couponDiscount(RETURN_COUPON);
  const leads = await leadsNeedingDiscount(HOURS_BEFORE_DISCOUNT);

  let sent = 0;
  for (const lead of leads) {
    const ok = await sendDiscountEmail(
      lead.email,
      RETURN_COUPON,
      pct,
      lead.locale ?? "ar"
    );
    if (ok) {
      await markDiscountSent(lead.email, RETURN_COUPON);
      sent++;
    }
  }

  return NextResponse.json({ candidates: leads.length, sent });
}
