// Notificación por email cuando se confirma una compra.
// Usa Resend (resend.com) — gratis hasta 3.000 emails/mes.
// Requiere RESEND_API_KEY en .env.local.
// Si no está configurado, solo loguea en consola (modo dev).
import type { Order } from "@/lib/db";
import { site } from "@/lib/config";

const RESEND_API = "https://api.resend.com/emails";
const NOTIFY_TO = "abalo7272@gmail.com";

// Envía el mail de descuento a un lead que no compró (remarketing).
// Devuelve true si se envió. Gated por RESEND_API_KEY.
export async function sendDiscountEmail(
  email: string,
  code: string,
  percent: number,
  locale = "ar"
): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.log(`[email] Sin RESEND_API_KEY — descuento ${code} a ${email}`);
    return false;
  }
  const base =
    process.env.PUBLIC_BASE_URL ?? `https://www.${site.domain}`;
  const link = `${base}/${locale}/servicios?promo=${encodeURIComponent(code)}`;
  const pct = Math.round(percent * 100);

  const html = `
<!DOCTYPE html>
<html lang="es">
<body style="font-family:sans-serif;background:#0a0a0b;padding:24px;color:#f4f4f5">
  <div style="max-width:480px;margin:0 auto;background:#141417;border-radius:16px;overflow:hidden;border:1px solid #2a2a31">
    <div style="padding:28px 24px;text-align:center">
      <div style="font-size:40px">🎁</div>
      <h1 style="margin:12px 0 0;font-size:22px;color:#fff">Tu descuento del ${pct}% te espera</h1>
      <p style="margin:10px 0 0;color:#9aa0aa;font-size:14px">
        Quedaste a un paso de hacer crecer tu cuenta. Volvé y aprovechá tu cupón.
      </p>
      <div style="margin:22px auto;display:inline-block;border:2px dashed #34d399;border-radius:12px;padding:12px 20px">
        <span style="color:#9aa0aa;font-size:12px;display:block">Tu cupón</span>
        <span style="color:#34d399;font-size:24px;font-weight:800;letter-spacing:1px">${code}</span>
      </div>
      <div>
        <a href="${link}" style="display:inline-block;background:#fff;color:#0a0a0b;font-weight:700;text-decoration:none;border-radius:999px;padding:14px 28px;font-size:15px">
          Usar mi ${pct}% de descuento →
        </a>
      </div>
      <p style="margin:20px 0 0;color:#6b7280;font-size:12px">
        El cupón ya viene aplicado al abrir el link. ${site.name}
      </p>
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
        to: [email],
        subject: `🎁 Tu ${pct}% de descuento en ${site.name} te espera`,
        html,
      }),
    });
    if (!res.ok) {
      console.error("[email] Resend descuento error:", res.status, await res.text());
      return false;
    }
    return true;
  } catch (err) {
    console.error("[email] Error enviando descuento:", err);
    return false;
  }
}

// Mail de win-back: cliente que compró y no volvió. Lleva un cupón (10%).
export async function sendWinbackEmail(
  email: string,
  code: string,
  percent: number,
  locale = "ar"
): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.log(`[email] Sin RESEND_API_KEY — winback ${code} a ${email}`);
    return false;
  }
  const base = process.env.PUBLIC_BASE_URL ?? `https://www.${site.domain}`;
  const link = `${base}/${locale}/servicios?promo=${encodeURIComponent(code)}`;
  const pct = Math.round(percent * 100);

  const html = `
<!DOCTYPE html>
<html lang="es">
<body style="font-family:sans-serif;background:#0a0a0b;padding:24px;color:#f4f4f5">
  <div style="max-width:480px;margin:0 auto;background:#141417;border-radius:16px;overflow:hidden;border:1px solid #2a2a31">
    <div style="padding:28px 24px;text-align:center">
      <div style="font-size:40px">🚀</div>
      <h1 style="margin:12px 0 0;font-size:22px;color:#fff">¡Te extrañamos! ${pct}% OFF para tu próximo impulso</h1>
      <p style="margin:10px 0 0;color:#9aa0aa;font-size:14px">
        Gracias por tu compra. Es momento de seguir creciendo: usá tu cupón y sumá más.
      </p>
      <div style="margin:22px auto;display:inline-block;border:2px dashed #34d399;border-radius:12px;padding:12px 20px">
        <span style="color:#9aa0aa;font-size:12px;display:block">Tu cupón</span>
        <span style="color:#34d399;font-size:24px;font-weight:800;letter-spacing:1px">${code}</span>
      </div>
      <div>
        <a href="${link}" style="display:inline-block;background:#fff;color:#0a0a0b;font-weight:700;text-decoration:none;border-radius:999px;padding:14px 28px;font-size:15px">
          Usar mi ${pct}% de descuento →
        </a>
      </div>
      <p style="margin:20px 0 0;color:#6b7280;font-size:12px">
        El cupón ya viene aplicado al abrir el link. ${site.name}
      </p>
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
        to: [email],
        subject: `🚀 ${pct}% OFF para volver a crecer en ${site.name}`,
        html,
      }),
    });
    if (!res.ok) {
      console.error("[email] Resend winback error:", res.status, await res.text());
      return false;
    }
    return true;
  } catch (err) {
    console.error("[email] Error enviando winback:", err);
    return false;
  }
}

// Manda al dueño la CAPTURA del pago que subió el cliente (como adjunto).
export async function notifyTransferProof(
  order: Order,
  file: { base64: string; filename: string }
): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  const amountFmt = new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(order.amount);
  if (!key) {
    console.log(`[email] Comprobante (sin RESEND): ${order.id} ${amountFmt}`);
    return;
  }
  const serviceLabel = SERVICE_LABELS[order.service] ?? order.service;
  const html = `
<!DOCTYPE html><html lang="es"><body style="font-family:sans-serif;background:#f4f4f5;padding:24px">
  <div style="max-width:480px;margin:0 auto;background:#fff;border-radius:12px;border:1px solid #e4e4e7;overflow:hidden">
    <div style="background:#16a34a;padding:18px 24px"><h1 style="color:#fff;margin:0;font-size:18px">📸 Comprobante de transferencia</h1></div>
    <div style="padding:24px;font-size:14px">
      <p>El cliente subió la captura del pago (adjunta). Verificá en el banco que entró:</p>
      <table style="width:100%;border-collapse:collapse;margin-top:8px">
        <tr><td style="padding:8px 0;color:#666">Orden</td><td style="padding:8px 0;font-weight:700">${order.id}</td></tr>
        <tr><td style="padding:8px 0;color:#666">Importe</td><td style="padding:8px 0;font-weight:700;color:#16a34a">${amountFmt}</td></tr>
        <tr><td style="padding:8px 0;color:#666">Servicio</td><td style="padding:8px 0">${serviceLabel}</td></tr>
        <tr><td style="padding:8px 0;color:#666">Cuenta/Link</td><td style="padding:8px 0">@${order.username}</td></tr>
        <tr><td style="padding:8px 0;color:#666">Contacto</td><td style="padding:8px 0">${order.contact}</td></tr>
      </table>
      <p style="margin-top:16px;color:#666">Si está OK, marcá la orden como <b>Pagado</b> en /admin y entregá.</p>
    </div>
  </div>
</body></html>`;
  try {
    const from = process.env.RESEND_FROM ?? "TopViralMarketing <onboarding@resend.dev>";
    await fetch(RESEND_API, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: [NOTIFY_TO],
        subject: `📸 Comprobante ${amountFmt} — Orden ${order.id}`,
        html,
        attachments: [{ filename: file.filename, content: file.base64 }],
      }),
    });
  } catch (err) {
    console.error("[email] Error comprobante:", err);
  }
}

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

// Aviso al DUEÑO cuando un cliente dice "Ya transferí" → a verificar en el banco.
export async function notifyTransferClaimed(order: Order): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  const serviceLabel = SERVICE_LABELS[order.service] ?? order.service;
  const amountFmt = new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(order.amount);
  if (!key) {
    console.log(`[email] Transferencia avisada (sin RESEND): ${order.id} ${amountFmt}`);
    return;
  }
  const html = `
<!DOCTYPE html><html lang="es"><body style="font-family:sans-serif;background:#f4f4f5;padding:24px">
  <div style="max-width:480px;margin:0 auto;background:#fff;border-radius:12px;border:1px solid #e4e4e7;overflow:hidden">
    <div style="background:#f59e0b;padding:18px 24px"><h1 style="color:#fff;margin:0;font-size:18px">🏦 Transferencia para verificar</h1></div>
    <div style="padding:24px;font-size:14px">
      <p>Un cliente avisó que ya transfirió. Verificá en el banco que entró este importe:</p>
      <table style="width:100%;border-collapse:collapse;margin-top:8px">
        <tr><td style="padding:8px 0;color:#666">Código / Orden</td><td style="padding:8px 0;font-weight:700">${order.id}</td></tr>
        <tr><td style="padding:8px 0;color:#666">Importe exacto</td><td style="padding:8px 0;font-weight:700;color:#b45309">${amountFmt}</td></tr>
        <tr><td style="padding:8px 0;color:#666">Servicio</td><td style="padding:8px 0">${serviceLabel}</td></tr>
        <tr><td style="padding:8px 0;color:#666">Cuenta/Link</td><td style="padding:8px 0">@${order.username}</td></tr>
        <tr><td style="padding:8px 0;color:#666">Contacto</td><td style="padding:8px 0">${order.contact}</td></tr>
      </table>
      <p style="margin-top:16px;color:#666">Si entró, marcá la orden como <b>Pagado</b> en /admin y entregá.</p>
    </div>
  </div>
</body></html>`;
  try {
    const from = process.env.RESEND_FROM ?? "TopViralMarketing <onboarding@resend.dev>";
    await fetch(RESEND_API, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: [NOTIFY_TO],
        subject: `🏦 Verificar transferencia ${amountFmt} — Orden ${order.id}`,
        html,
      }),
    });
  } catch (err) {
    console.error("[email] Error aviso transferencia:", err);
  }
}

// Mail de confirmación al CLIENTE cuando su compra se aprueba.
// Solo se envía si el contacto es un email. Gated por RESEND_API_KEY.
export async function sendOrderConfirmation(order: Order): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return;
  if (!order.contact.includes("@")) return; // contacto por teléfono, no email

  const serviceLabel = SERVICE_LABELS[order.service] ?? order.service;
  const target = order.username.startsWith("http")
    ? order.username
    : `@${order.username}`;

  const html = `
<!DOCTYPE html>
<html lang="es">
<body style="font-family:sans-serif;background:#0a0a0b;padding:24px;color:#f4f4f5">
  <div style="max-width:480px;margin:0 auto;background:#141417;border-radius:16px;overflow:hidden;border:1px solid #2a2a31">
    <div style="padding:28px 24px;text-align:center">
      <div style="font-size:40px">✅</div>
      <h1 style="margin:12px 0 0;font-size:22px;color:#fff">¡Recibimos tu compra!</h1>
      <p style="margin:10px 0 0;color:#9aa0aa;font-size:14px">
        Ya estamos preparando tu pedido. La entrega arranca en minutos y se completa entre 10 minutos y 2 horas. Lo hacemos gradual para que las redes no lo detecten y tu cuenta quede protegida.
      </p>
    </div>
    <div style="padding:0 24px 24px">
      <table style="width:100%;border-collapse:collapse;font-size:14px;color:#f4f4f5">
        <tr style="border-bottom:1px solid #2a2a31">
          <td style="padding:10px 0;color:#9aa0aa;width:45%">Pedido</td>
          <td style="padding:10px 0;font-weight:600;text-align:right">${order.id}</td>
        </tr>
        <tr style="border-bottom:1px solid #2a2a31">
          <td style="padding:10px 0;color:#9aa0aa">Servicio</td>
          <td style="padding:10px 0;font-weight:600;text-align:right">${serviceLabel}</td>
        </tr>
        <tr style="border-bottom:1px solid #2a2a31">
          <td style="padding:10px 0;color:#9aa0aa">Cantidad</td>
          <td style="padding:10px 0;text-align:right">${order.totalFollowers.toLocaleString("es-AR")}</td>
        </tr>
        <tr>
          <td style="padding:10px 0;color:#9aa0aa">Cuenta / Posteo</td>
          <td style="padding:10px 0;font-weight:600;text-align:right">${target}</td>
        </tr>
      </table>
      <div style="margin-top:18px;background:#102a1f;border:1px solid #1f5f43;border-radius:10px;padding:14px;text-align:center">
        <p style="margin:0;font-size:13px;color:#34d399">
          🔒 Recordá tener tu cuenta en <b>público</b> mientras hacemos la entrega.
        </p>
      </div>
      <p style="margin:18px 0 0;text-align:center;color:#6b7280;font-size:12px">
        ¿Dudas? Respondé este mail o escribinos por Instagram. ${site.name}
      </p>
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
        to: [order.contact],
        subject: `✅ Confirmamos tu compra en ${site.name} (${order.id})`,
        html,
      }),
    });
    if (!res.ok) {
      console.error("[email] Confirmación cliente error:", res.status, await res.text());
    }
  } catch (err) {
    console.error("[email] Error enviando confirmación al cliente:", err);
  }
}

const ARS = (n: number) =>
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(n);

async function sendResend(to: string, subject: string, html: string) {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.log(`[email] Sin RESEND_API_KEY — ${subject} a ${to}`);
    return;
  }
  try {
    const from =
      process.env.RESEND_FROM ?? "TopViralMarketing <onboarding@resend.dev>";
    const res = await fetch(RESEND_API, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: [to], subject, html }),
    });
    if (!res.ok) console.error("[email] Resend error:", res.status, await res.text());
  } catch (err) {
    console.error("[email] Resend excepción:", err);
  }
}

// 1) Transferencia: pedido recibido, falta el pago. Incluye datos + link a subir comprobante.
export async function sendTransferPending(order: Order): Promise<void> {
  if (!order.contact.includes("@")) return;
  const base = process.env.PUBLIC_BASE_URL ?? `https://www.${site.domain}`;
  const link = `${base}/${order.locale}/gracias?order=${order.id}&method=transferencia`;
  const serviceLabel = SERVICE_LABELS[order.service] ?? order.service;
  const tr = site.transfer;
  const html = `
<!DOCTYPE html><html lang="es"><body style="font-family:sans-serif;background:#0a0a0b;padding:24px;color:#f4f4f5">
  <div style="max-width:480px;margin:0 auto;background:#141417;border-radius:16px;overflow:hidden;border:1px solid #2a2a31">
    <div style="padding:28px 24px;text-align:center">
      <div style="font-size:40px">🧾</div>
      <h1 style="margin:12px 0 0;font-size:22px;color:#fff">¡Gracias por tu compra!</h1>
      <p style="margin:10px 0 0;color:#9aa0aa;font-size:14px">
        Reservamos tu pedido <b style="color:#f4f4f5">${order.id}</b> (${serviceLabel}).
        Apenas verifiquemos tu transferencia, comenzamos la entrega (se completa entre 10 minutos y 2 horas, de forma gradual para proteger tu cuenta).
      </p>
    </div>
    <div style="padding:0 24px 24px">
      <p style="font-size:14px;color:#f4f4f5;margin:0 0 8px">Transferí el monto exacto a:</p>
      <table style="width:100%;border-collapse:collapse;font-size:14px;color:#f4f4f5">
        <tr style="border-bottom:1px solid #2a2a31"><td style="padding:9px 0;color:#9aa0aa">Monto (5% OFF)</td><td style="padding:9px 0;font-weight:700;text-align:right;color:#34d399">${ARS(order.amount)}</td></tr>
        <tr style="border-bottom:1px solid #2a2a31"><td style="padding:9px 0;color:#9aa0aa">Titular</td><td style="padding:9px 0;text-align:right">${tr.titular}</td></tr>
        <tr style="border-bottom:1px solid #2a2a31"><td style="padding:9px 0;color:#9aa0aa">Alias</td><td style="padding:9px 0;font-weight:600;text-align:right">${tr.alias}</td></tr>
        <tr style="border-bottom:1px solid #2a2a31"><td style="padding:9px 0;color:#9aa0aa">CVU</td><td style="padding:9px 0;text-align:right">${tr.cvu}</td></tr>
        <tr><td style="padding:9px 0;color:#9aa0aa">CUIT</td><td style="padding:9px 0;text-align:right">${tr.cuit}</td></tr>
      </table>
      <div style="text-align:center;margin-top:22px">
        <a href="${link}" style="display:inline-block;background:#fff;color:#0a0a0b;font-weight:700;text-decoration:none;border-radius:999px;padding:14px 28px;font-size:15px">
          Ya transferí → subir comprobante
        </a>
      </div>
      <p style="margin:18px 0 0;text-align:center;color:#6b7280;font-size:12px">
        Cuando subas la captura del pago, confirmamos y entregamos. ${site.name}
      </p>
    </div>
  </div>
</body></html>`;
  await sendResend(order.contact, `🧾 Recibimos tu pedido ${order.id} — confirmá tu transferencia`, html);
}

// 2) Transferencia: el cliente subió el comprobante. Agradecimiento + estamos verificando.
export async function sendTransferProofThanks(order: Order): Promise<void> {
  if (!order.contact.includes("@")) return;
  const serviceLabel = SERVICE_LABELS[order.service] ?? order.service;
  const html = `
<!DOCTYPE html><html lang="es"><body style="font-family:sans-serif;background:#0a0a0b;padding:24px;color:#f4f4f5">
  <div style="max-width:480px;margin:0 auto;background:#141417;border-radius:16px;overflow:hidden;border:1px solid #2a2a31">
    <div style="padding:28px 24px;text-align:center">
      <div style="font-size:40px">✅</div>
      <h1 style="margin:12px 0 0;font-size:22px;color:#fff">¡Muchas gracias por tu compra!</h1>
      <p style="margin:10px 0 0;color:#9aa0aa;font-size:14px">
        Recibimos tu comprobante del pedido <b style="color:#f4f4f5">${order.id}</b> (${serviceLabel}).
        Estamos <b style="color:#f4f4f5">verificando el pago</b> y, una vez confirmado,
        comenzamos a entregar tu servicio (se completa entre 10 minutos y 2 horas, de forma gradual para proteger tu cuenta).
      </p>
      <div style="margin-top:18px;background:#102a1f;border:1px solid #1f5f43;border-radius:10px;padding:14px">
        <p style="margin:0;font-size:13px;color:#34d399">
          🔒 Recordá tener tu cuenta en <b>público</b> hasta recibir todo el pedido.
        </p>
      </div>
      <p style="margin:18px 0 0;color:#6b7280;font-size:12px">
        Te avisamos por acá ante cualquier novedad. ¡Gracias por elegir ${site.name}!
      </p>
    </div>
  </div>
</body></html>`;
  await sendResend(order.contact, `✅ Recibimos tu comprobante — verificando tu pago (${order.id})`, html);
}
