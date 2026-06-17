import { NextRequest, NextResponse } from "next/server";
import {
  leadsNeedingDiscount,
  markDiscountSent,
  customersForWinback,
  markWinbackSent,
} from "@/lib/leads";
import { sendDiscountEmail, sendWinbackEmail } from "@/lib/email";
import { RETURN_COUPON, WINBACK_COUPON, couponDiscount } from "@/lib/config";

// Cron diario (ver vercel.json). Dos flujos:
//  1) Recuperación: lead que NO compró, pasadas HOURS_BEFORE_DISCOUNT horas → 15% (VOLVE15).
//  2) Win-back: cliente que compró y a los DAYS_BEFORE_WINBACK días no volvió → 10% (GRACIAS10).
// Cada mail se manda una sola vez por persona/ciclo.
export const dynamic = "force-dynamic";

const HOURS_BEFORE_DISCOUNT = 2;
const DAYS_BEFORE_WINBACK = 15;

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

  // 1) Recuperación de carrito (no compró)
  const recoveryPct = couponDiscount(RETURN_COUPON);
  const leads = await leadsNeedingDiscount(HOURS_BEFORE_DISCOUNT);
  let recoverySent = 0;
  for (const lead of leads) {
    const ok = await sendDiscountEmail(
      lead.email,
      RETURN_COUPON,
      recoveryPct,
      lead.locale ?? "ar"
    );
    if (ok) {
      await markDiscountSent(lead.email, RETURN_COUPON);
      recoverySent++;
    }
  }

  // 2) Win-back (compró y no volvió en 15 días)
  const winbackPct = couponDiscount(WINBACK_COUPON);
  const customers = await customersForWinback(DAYS_BEFORE_WINBACK);
  let winbackSent = 0;
  for (const c of customers) {
    const ok = await sendWinbackEmail(
      c.email,
      WINBACK_COUPON,
      winbackPct,
      c.locale ?? "ar"
    );
    if (ok) {
      await markWinbackSent(c.email, WINBACK_COUPON);
      winbackSent++;
    }
  }

  return NextResponse.json({
    recovery: { candidates: leads.length, sent: recoverySent },
    winback: { candidates: customers.length, sent: winbackSent },
  });
}
