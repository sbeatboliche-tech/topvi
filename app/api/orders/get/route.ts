import { NextRequest, NextResponse } from "next/server";
import { getOrder } from "@/lib/db";
import { getService, getPack } from "@/lib/config";
import { isLocale, localeConfig, localAmount, defaultLocale } from "@/lib/i18n";

// Devuelve datos públicos de una orden para la pantalla de pago con tarjeta.
export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Falta id" }, { status: 400 });

  const order = await getOrder(id);
  if (!order) return NextResponse.json({ error: "No encontrada" }, { status: 404 });

  const locale = isLocale(order.locale) ? order.locale : defaultLocale;
  const cfg = localeConfig[locale];
  const svc = getService(order.service);
  const pack = getPack(order.service);
  const title = pack
    ? pack.name
    : svc
    ? `${order.totalFollowers} ${svc.unit} · ${svc.title}`
    : "";

  return NextResponse.json({
    id: order.id,
    amount: localAmount(order.amount, locale), // monto en moneda local
    currency: cfg.currency.code,
    payerEmail: order.contact.includes("@") ? order.contact : "",
    title,
    status: order.status,
  });
}
