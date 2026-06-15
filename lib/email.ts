// Notificación por email cuando se confirma una compra.
// Usa Resend (resend.com) — gratis hasta 3.000 emails/mes.
// Requiere RESEND_API_KEY en .env.local.
// Si no está configurado, solo loguea en consola (modo dev).
import type { Order } from "@/lib/db";

const RESEND_API = "https://api.resend.com/emails";
const NOTIFY_TO = "abalo7272@gmail.com";

const SERVICE_LABELS: Record<string, string> = {
  "instagram-seguidores": "Seguidores Instagram",
  "instagram-likes": "Likes Instagram",
  "instagram-vistas": "Vistas Instagram",
  "instagram-compartidos": "Compartidos Instagram",
  "instagram-guardados": "Guardados Instagram",
  "tiktok-seguidores": "Seguidores TikTok",
  "tiktok-likes": "Likes TikTok",
  "tiktok-vistas": "Vistas TikTok",
};

export async function notifyNewOrder(order: Order): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.log(
      `[email] Sin RESEND_API_KEY — nueva compra: ${order.id} | ${order.service} | @${order.username} | ${order.amount} ARS`
    );
    return;
  }

  const serviceLabel = SERVICE_LABELS[order.service] ?? order.service;
  const amountFmt = new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(order.amount);

  const paymentLabel: Record<string, string> = {
    mercadopago: "MercadoPago",
    tarjeta: "Tarjeta de crédito",
    usdt: "USDT",
  };

  const html = `
<!DOCTYPE html>
<html lang="es">
<body style="font-family:sans-serif;background:#f4f4f5;padding:24px">
  <div style="max-width:480px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e4e4e7">
    <div style="background:linear-gradient(135deg,#1d4ed8,#3b82f6,#22d3ee);padding:20px 24px">
      <h1 style="color:#fff;margin:0;font-size:18px">🛒 Nueva compra confirmada</h1>
    </div>
    <div style="padding:24px">
      <table style="width:100%;border-collapse:collapse;font-size:14px">
        <tr style="border-bottom:1px solid #f1f1f1">
          <td style="padding:8px 0;color:#666;width:40%">Orden</td>
          <td style="padding:8px 0;font-weight:600">${order.id}</td>
        </tr>
        <tr style="border-bottom:1px solid #f1f1f1">
          <td style="padding:8px 0;color:#666">Servicio</td>
          <td style="padding:8px 0;font-weight:600">${serviceLabel}</td>
        </tr>
        <tr style="border-bottom:1px solid #f1f1f1">
          <td style="padding:8px 0;color:#666">Usuario / Link</td>
          <td style="padding:8px 0;font-weight:600">@${order.username}</td>
        </tr>
        <tr style="border-bottom:1px solid #f1f1f1">
          <td style="padding:8px 0;color:#666">Cantidad</td>
          <td style="padding:8px 0">${order.quantity.toLocaleString("es-AR")}${order.bonus > 0 ? ` + ${order.bonus.toLocaleString("es-AR")} de regalo` : ""} = <b>${order.totalFollowers.toLocaleString("es-AR")} totales</b></td>
        </tr>
        <tr style="border-bottom:1px solid #f1f1f1">
          <td style="padding:8px 0;color:#666">Calidad</td>
          <td style="padding:8px 0;text-transform:capitalize">${order.quality}</td>
        </tr>
        <tr style="border-bottom:1px solid #f1f1f1">
          <td style="padding:8px 0;color:#666">Contacto</td>
          <td style="padding:8px 0">${order.contact}</td>
        </tr>
        <tr style="border-bottom:1px solid #f1f1f1">
          <td style="padding:8px 0;color:#666">Pago</td>
          <td style="padding:8px 0">${paymentLabel[order.payment] ?? order.payment}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;color:#666">Importe</td>
          <td style="padding:8px 0;font-size:18px;font-weight:700;color:#1d4ed8">${amountFmt}</td>
        </tr>
      </table>

      <div style="margin-top:20px;background:#f0fdf4;border:1px solid #86efac;border-radius:8px;padding:14px">
        <p style="margin:0;font-size:14px;color:#166534">
          <b>⚡ Acción requerida:</b> Entregar <b>${order.totalFollowers.toLocaleString("es-AR")} ${serviceLabel.toLowerCase()}</b> a <b>@${order.username}</b>
        </p>
      </div>
    </div>
  </div>
</body>
</html>`;

  try {
    const from =
      process.env.RESEND_FROM ?? "TopViralMarketing <onboarding@resend.dev>";
    const res = await fetch(RESEND_API, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [NOTIFY_TO],
        subject: `🛒 Nueva compra — ${serviceLabel} × ${order.quantity.toLocaleString("es-AR")} para @${order.username}`,
        html,
      }),
    });
    if (!res.ok) {
      const txt = await res.text();
      console.error("[email] Resend error:", res.status, txt);
    }
  } catch (err) {
    console.error("[email] Error enviando notificación:", err);
  }
}
