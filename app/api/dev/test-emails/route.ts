import { NextRequest, NextResponse } from "next/server";
import type { Order } from "@/lib/db";
import {
  notifyNewOrder,
  sendOrderConfirmation,
  notifyTransferClaimed,
  notifyTransferProof,
  sendDiscountEmail,
  sendWinbackEmail,
} from "@/lib/email";
import { RETURN_COUPON, WINBACK_COUPON, couponDiscount } from "@/lib/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Endpoint de prueba: dispara TODOS los mails a un destino.
// Uso: /api/dev/test-emails?key=TOPVIRAL-TEST-2026
const TOKEN = "TOPVIRAL-TEST-2026";
const TO = "abalo7272@gmail.com";

// PNG 1x1 transparente (para probar el adjunto del comprobante).
const PNG_1x1 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

export async function GET(req: NextRequest) {
  if (req.nextUrl.searchParams.get("key") !== TOKEN) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const fake: Order = {
    id: "ORD-TEST123",
    createdAt: new Date().toISOString(),
    locale: "ar",
    service: "instagram-seguidores",
    username: "cuenta_demo",
    contact: TO,
    quantity: 1000,
    bonus: 100,
    quality: "premium",
    totalFollowers: 1100,
    amount: 8500,
    payment: "transferencia",
    status: "paid",
  };

  const results: Record<string, string> = {};
  const run = async (name: string, fn: () => Promise<unknown>) => {
    try {
      await fn();
      results[name] = "ok";
    } catch (e) {
      results[name] = e instanceof Error ? e.message : "error";
    }
  };

  await run("compra_dueno", () => notifyNewOrder(fake));
  await run("confirmacion_cliente", () => sendOrderConfirmation(fake));
  await run("transferencia_avisada", () => notifyTransferClaimed(fake));
  await run("comprobante_adjunto", () =>
    notifyTransferProof(fake, { base64: PNG_1x1, filename: "comprobante-demo.png" })
  );
  await run("recuperacion_15off", () =>
    sendDiscountEmail(TO, RETURN_COUPON, couponDiscount(RETURN_COUPON), "ar")
  );
  await run("winback_10off", () =>
    sendWinbackEmail(TO, WINBACK_COUPON, couponDiscount(WINBACK_COUPON), "ar")
  );

  return NextResponse.json({ to: TO, results });
}
