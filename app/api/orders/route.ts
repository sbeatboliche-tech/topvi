import { NextRequest, NextResponse } from "next/server";
import { createOrder } from "@/lib/db";
import { createPreference } from "@/lib/mercadopago";
import { getService, priceFor, bonusFor, type Quality } from "@/lib/config";
import { isLocale, defaultLocale } from "@/lib/i18n";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { slug, target, contact, quantity, quality, payment, locale } = body;
    const loc = isLocale(String(locale)) ? String(locale) : defaultLocale;

    // ---- Validación básica ----
    if (!target || !contact) {
      return NextResponse.json(
        { error: "Faltan datos del pedido." },
        { status: 400 }
      );
    }
    if (
      payment !== "mercadopago" &&
      payment !== "tarjeta" &&
      payment !== "usdt"
    ) {
      return NextResponse.json({ error: "Pago inválido." }, { status: 400 });
    }

    // ---- Validamos servicio y recalculamos precio en el server ----
    const svc = getService(String(slug));
    if (!svc) {
      return NextResponse.json({ error: "Servicio inválido." }, { status: 400 });
    }
    const tier = svc.tiers.find((t) => t.quantity === quantity);
    if (!tier) {
      return NextResponse.json({ error: "Paquete inválido." }, { status: 400 });
    }
    const q: Quality =
      svc.hasQuality && quality === "premium" ? "premium" : "global";
    const amount = priceFor(tier, q);
    const bonus = bonusFor(tier, q);
    const totalFollowers = tier.quantity + bonus;

    const order = await createOrder({
      locale: loc,
      service: svc.slug,
      username: String(target).trim().replace(/^@+/, "").slice(0, 200),
      contact: String(contact).slice(0, 120),
      quantity: tier.quantity,
      bonus,
      quality: q,
      totalFollowers,
      amount,
      payment,
    });

    if (payment === "mercadopago") {
      const baseUrl = process.env.PUBLIC_BASE_URL ?? req.nextUrl.origin;
      const init_point = await createPreference(order, baseUrl);
      if (!init_point) {
        // MP no está configurado o no opera en este país → avisamos claro
        // en vez de mandar al usuario a "gracias" sin haber pagado.
        return NextResponse.json(
          {
            error:
              "El pago con MercadoPago no está disponible en este momento. Probá con tarjeta o crypto, o escribinos.",
          },
          { status: 502 }
        );
      }
      return NextResponse.json({ orderId: order.id, init_point });
    }

    return NextResponse.json({ orderId: order.id });
  } catch (err) {
    console.error("[api/orders]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error del servidor" },
      { status: 500 }
    );
  }
}
