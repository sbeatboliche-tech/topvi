import { NextRequest, NextResponse } from "next/server";
import { createOrder, type Order } from "@/lib/db";
import { createPreference } from "@/lib/mercadopago";
import {
  getService,
  getPack,
  priceFor,
  bonusFor,
  applyPaymentDiscount,
  applyCoupon,
  MAX_PACK_POSTS,
  MAX_TARGETS,
  formatNumber,
  type Quality,
} from "@/lib/config";
import { isLocale, defaultLocale } from "@/lib/i18n";
import { markLeadOrdered } from "@/lib/leads";

type Payment = "mercadopago" | "tarjeta" | "usdt";

function isValidPayment(p: unknown): p is Payment {
  return p === "mercadopago" || p === "tarjeta" || p === "usdt";
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { contact, payment, locale } = body;
    const loc = isLocale(String(locale)) ? String(locale) : defaultLocale;

    if (!isValidPayment(payment)) {
      return NextResponse.json({ error: "Pago inválido." }, { status: 400 });
    }
    if (!contact) {
      return NextResponse.json(
        { error: "Faltan datos del pedido." },
        { status: 400 }
      );
    }

    // ============================================================
    //  RAMA PACK (combo: seguidores + likes + vistas)
    // ============================================================
    if (body.pack) {
      const pack = getPack(String(body.pack));
      if (!pack) {
        return NextResponse.json({ error: "Pack inválido." }, { status: 400 });
      }
      const username = String(body.target ?? "")
        .trim()
        .replace(/^@+/, "")
        .slice(0, 200);
      const posts: string[] = Array.isArray(body.posts)
        ? body.posts
            .map((x: unknown) => String(x).trim())
            .filter(Boolean)
            .slice(0, MAX_PACK_POSTS)
        : [];
      if (!username) {
        return NextResponse.json(
          { error: "Falta el usuario para los seguidores." },
          { status: 400 }
        );
      }
      if (posts.length === 0) {
        return NextResponse.json(
          { error: "Cargá al menos un link de posteo para los likes y vistas." },
          { status: 400 }
        );
      }

      const notes =
        `PACK: ${pack.name}\n` +
        `• ${formatNumber(pack.followers)} seguidores → @${username}\n` +
        `• ${formatNumber(pack.likes)} likes + ${formatNumber(pack.views)} vistas, repartidos en ${posts.length} posteo(s):\n` +
        posts.map((p, i) => `  ${i + 1}) ${p}`).join("\n");

      const order = await createOrder({
        locale: loc,
        service: pack.slug,
        username,
        contact: String(contact).slice(0, 120),
        quantity: pack.followers,
        bonus: 0,
        quality: "global",
        totalFollowers: pack.followers,
        amount: applyPaymentDiscount(applyCoupon(pack.price, body.coupon), payment),
        payment,
        notes,
      });

      await markLeadOrdered(contact, pack.slug, loc).catch(() => {});
      return finishOrder(order, payment, req);
    }

    // ============================================================
    //  RAMA SERVICIO INDIVIDUAL (con multi-target + add-on opcional)
    // ============================================================
    const { slug, quantity, quality } = body;

    const svc = getService(String(slug));
    if (!svc) {
      return NextResponse.json({ error: "Servicio inválido." }, { status: 400 });
    }
    const tier = svc.tiers.find((t) => t.quantity === quantity);
    if (!tier) {
      return NextResponse.json({ error: "Paquete inválido." }, { status: 400 });
    }

    // Destinos: array (nuevo) o `target` único (compatibilidad).
    const rawTargets: unknown[] = Array.isArray(body.targets)
      ? body.targets
      : body.target
      ? [body.target]
      : [];
    const targets = rawTargets
      .map((x) => String(x).trim().replace(/^@+/, "").slice(0, 200))
      .filter(Boolean)
      .slice(0, MAX_TARGETS);
    if (targets.length === 0) {
      return NextResponse.json(
        { error: "Faltan datos del pedido." },
        { status: 400 }
      );
    }

    const q: Quality =
      svc.hasQuality && quality === "premium" ? "premium" : "global";
    let amount = priceFor(tier, q);
    const bonus = bonusFor(tier, q);
    const totalFollowers = tier.quantity + bonus;

    const fmtTarget = (kind: string, val: string) =>
      kind === "followers" ? `@${val}` : val;

    // Add-on / upsell cruzado (opcional).
    let addonNote = "";
    if (body.addon && body.addon.slug) {
      const aSvc = getService(String(body.addon.slug));
      const aTier = aSvc?.tiers.find((t) => t.quantity === body.addon.quantity);
      const aTargets: string[] = Array.isArray(body.addon.targets)
        ? body.addon.targets
            .map((x: unknown) => String(x).trim().replace(/^@+/, ""))
            .filter(Boolean)
        : [];
      if (!aSvc || !aTier) {
        return NextResponse.json({ error: "Add-on inválido." }, { status: 400 });
      }
      if (aTargets.length === 0) {
        return NextResponse.json(
          { error: "Falta el destino del add-on." },
          { status: 400 }
        );
      }
      amount += priceFor(aTier, "global");
      addonNote =
        `\n+ ADD-ON: ${formatNumber(aTier.quantity)} ${aSvc.short} → ` +
        aTargets.map((x) => fmtTarget(aSvc.kind, x)).join(", ");
    }

    // Notas para entrega: solo si hay reparto múltiple o add-on.
    const targetWord = svc.kind === "followers" ? "cuenta(s)" : "posteo(s)";
    let notes: string | undefined;
    if (targets.length > 1 || addonNote) {
      notes =
        `${formatNumber(totalFollowers)} ${svc.unit} en ${targets.length} ${targetWord}:\n` +
        targets.map((x, i) => `  ${i + 1}) ${fmtTarget(svc.kind, x)}`).join("\n") +
        addonNote;
    }

    const order = await createOrder({
      locale: loc,
      service: svc.slug,
      username: targets[0],
      contact: String(contact).slice(0, 120),
      quantity: tier.quantity,
      bonus,
      quality: q,
      totalFollowers,
      amount: applyPaymentDiscount(applyCoupon(amount, body.coupon), payment),
      payment,
      notes,
    });

    await markLeadOrdered(contact, svc.slug, loc).catch(() => {});
    return finishOrder(order, payment, req);
  } catch (err) {
    console.error("[api/orders]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error del servidor" },
      { status: 500 }
    );
  }
}

// Cierra la orden: inicia el pago si es MercadoPago, o devuelve el id.
async function finishOrder(order: Order, payment: Payment, req: NextRequest) {
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
}
