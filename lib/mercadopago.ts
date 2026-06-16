// ============================================================
//  MERCADOPAGO — creación de preferencia de pago (Checkout Pro)
//  Configurá MP_ACCESS_TOKEN en las variables de entorno.
//  Si no está configurado, devuelve null y el flujo pasa a
//  coordinación manual (te contactás con el cliente).
// ============================================================

import type { Order } from "./db";
import { getService, getPack } from "./config";
import { isLocale, localeConfig, localAmount, defaultLocale } from "./i18n";

const TOKEN = process.env.MP_ACCESS_TOKEN;

export function mpConfigured() {
  return !!TOKEN;
}

export async function createPreference(
  order: Order,
  baseUrl: string
): Promise<string | null> {
  if (!TOKEN) return null;

  const locale = isLocale(order.locale) ? order.locale : defaultLocale;
  const cfg = localeConfig[locale];
  // MercadoPago no opera en este país → no se puede cobrar con MP.
  if (!cfg.mpCurrency) return null;

  const pack = getPack(order.service);
  const svc = getService(order.service);
  const title = pack
    ? `${pack.name} · ${pack.followers} seg + ${pack.likes} likes + ${pack.views} vistas`
    : svc
    ? `${order.totalFollowers} ${svc.unit} · ${svc.title}`
    : `${order.totalFollowers} unidades`;

  const res = await fetch("https://api.mercadopago.com/checkout/preferences", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${TOKEN}`,
    },
    body: JSON.stringify({
      items: [
        {
          id: order.id,
          title,
          description: `Para ${order.username}`,
          quantity: 1,
          currency_id: cfg.mpCurrency,
          unit_price: localAmount(order.amount, locale),
        },
      ],
      external_reference: order.id,
      payer: order.contact.includes("@")
        ? { email: order.contact }
        : undefined,
      back_urls: {
        success: `${baseUrl}/${locale}/gracias?order=${order.id}&method=mercadopago`,
        failure: `${baseUrl}/${locale}/servicios/${order.service}`,
        pending: `${baseUrl}/${locale}/gracias?order=${order.id}&method=mercadopago`,
      },
      auto_return: "approved",
      notification_url: `${baseUrl}/api/mercadopago/webhook`,
      statement_descriptor: "TOPVIRAL",
    }),
  });

  if (!res.ok) {
    const txt = await res.text();
    console.error("[mercadopago] error creando preferencia:", txt);
    throw new Error("No se pudo iniciar el pago con MercadoPago");
  }

  const data = await res.json();
  return data.init_point as string;
}

// ---- Checkout Transparente (tarjeta en tu propia web) ----
// Recibe el token de la tarjeta (generado por MercadoPago en el navegador)
// y crea el pago server-side. Devuelve { status } del pago.
export async function processCardPayment(
  order: Order,
  card: {
    token: string;
    installments: number;
    payment_method_id: string;
    issuer_id?: string;
    payerEmail: string;
  }
): Promise<{ status: string; detail?: string }> {
  if (!TOKEN) throw new Error("MercadoPago no configurado (MP_ACCESS_TOKEN).");

  const locale = isLocale(order.locale) ? order.locale : defaultLocale;

  const res = await fetch("https://api.mercadopago.com/v1/payments", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${TOKEN}`,
      "X-Idempotency-Key": order.id,
    },
    body: JSON.stringify({
      transaction_amount: localAmount(order.amount, locale),
      token: card.token,
      installments: card.installments,
      payment_method_id: card.payment_method_id,
      issuer_id: card.issuer_id,
      description: `Pedido ${order.id}`,
      external_reference: order.id,
      payer: { email: card.payerEmail || order.contact },
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    console.error("[mp tarjeta] error:", data);
    throw new Error(data.message || "No se pudo procesar el pago.");
  }
  return { status: data.status, detail: data.status_detail };
}

export async function getPaymentStatus(paymentId: string) {
  if (!TOKEN) return null;
  const res = await fetch(
    `https://api.mercadopago.com/v1/payments/${paymentId}`,
    { headers: { Authorization: `Bearer ${TOKEN}` } }
  );
  if (!res.ok) return null;
  return res.json();
}
