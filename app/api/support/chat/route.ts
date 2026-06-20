import { NextRequest, NextResponse } from "next/server";
import { getOrder } from "@/lib/db";
import { getService } from "@/lib/config";
import { addMessage, messagesAfter } from "@/lib/chat";
import { captureLead } from "@/lib/leads";

const EMAIL_RE = /[^\s@]+@[^\s@]+\.[^\s@]{2,}/;

// ---------- Pattern-matching fallback ----------
const PATTERNS: Array<{ re: RegExp; reply: (agent: string) => string }> = [
  {
    re: /cu[aá]nd[oa]|llega|tarda|demora|tiempo de entrega|esperar|cu[aá]nto tarda/i,
    reply: () =>
      "Los pedidos empiezan a procesarse de inmediato y llegan entre 10 minutos y 2 horas. El proceso es gradual para que Instagram no detecte cambios bruscos. 😊",
  },
  {
    re: /ya pagu[eé]|ya abon[eé]|ya transfer[i í]|ya pag[ao]|hice el pago|acredit/i,
    reply: (a) =>
      `¡Perfecto! Tu pago fue recibido exitosamente. Tu pedido está en proceso y llegará en 10 minutos a 2 horas. Cualquier duda, acá estoy. — ${a}`,
  },
  {
    re: /pag[ué]|abona|transfer|pago|factura|cobr/i,
    reply: () =>
      "Para verificar el estado de tu pago, compartíme tu número de orden (formato ORD-XXXXX) y lo reviso ahora mismo. 🔍",
  },
  {
    re: /cay[oe]r[on]|baj[ao]r[on]|perd[i í][ó]|garantia|garantía|reponer|reposición/i,
    reply: () =>
      "Tranquilo/a, tenés garantía de reposición incluida. Compartíme tu número de orden (ORD-XXXXX) y lo solucionamos sin costo.",
  },
  {
    re: /segur[oa]|contraseña|password|peligro|hackear|robar|datos/i,
    reply: () =>
      "Es 100% seguro. Nunca pedimos tu contraseña. Solo necesitamos tu usuario público de Instagram. Tu cuenta no corre ningún riesgo. 🔒",
  },
  {
    re: /preci[oa]|costo|cu[aá]nto sale|cu[aá]nto cuesta|paquete|ver precios/i,
    reply: () =>
      "Podés ver todos los paquetes y precios en la sección Servicios. También tenemos una prueba gratuita de 10 likes para que comprob[eé]s la calidad. ¿Querés el link?",
  },
  {
    re: /privad[oa]|p[uú]blic[oa]|mi cuenta en privado|no tengo la cuenta en público/i,
    reply: () =>
      "Tu cuenta debe estar en público mientras llegan los seguidores/likes. Una vez que llegue todo, podés volver a privado sin problema. 😊",
  },
  {
    re: /gracia[s]?|muchas gracias|ok gracias|de nada|listo|perfecto|dale|bárbaro|genial|entendido/i,
    reply: (a) =>
      `¡De nada! Si necesitás algo más, acá estamos. ¡Éxitos con tu cuenta! 🌟 — ${a}`,
  },
  {
    re: /problema|error|mal|no lleg[oó]|no funcion|no recib[i í]|falla|reclam/i,
    reply: () =>
      "Lamento el inconveniente. Para resolverlo rápido, ¿podés pasarme tu número de orden? (Empieza con ORD-) Lo reviso ahora mismo.",
  },
  {
    re: /c[oó]mo compro|c[oó]mo funciona|c[oó]mo se compra|quiero comprar|empezar/i,
    reply: () =>
      "¡Súper fácil! Elegís el servicio, la cantidad, ingresás tu usuario de Instagram (sin contraseña) y pagás con MercadoPago o USDT. En 10 min a 2 hs ya estás viendo el resultado. 🚀",
  },
  {
    re: /tiktok/i,
    reply: () =>
      "¡Sí, también tenemos servicios para TikTok! Seguidores, likes y vistas. Los encontrás en la sección Servicios. 🎵",
  },
  {
    re: /instagram/i,
    reply: () =>
      "Para Instagram tenemos seguidores, likes, vistas, compartidos y guardados. ¿Qué necesitás puntualmente? 📸",
  },
];

function patternMatch(message: string, agentName: string): string | null {
  for (const p of PATTERNS) {
    if (p.re.test(message)) return p.reply(agentName);
  }
  return null;
}

// ---------- Order lookup helper ----------
async function orderContext(message: string): Promise<{ text: string; orderId: string | null }> {
  const match = message.match(/ORD-[A-Z0-9]+/i);
  if (!match) return { text: "", orderId: null };

  const id = match[0].toUpperCase();
  const order = await getOrder(id);
  if (!order) {
    return { text: `El número de orden ${id} no fue encontrado.`, orderId: id };
  }

  const svc = getService(order.service);
  const STATUS: Record<string, string> = {
    pending_payment: "pendiente de pago",
    paid: "pagado — en proceso de entrega",
    delivering: "en entrega",
    delivered: "entregado exitosamente",
    cancelled: "cancelado",
  };

  return {
    orderId: id,
    text: `Pedido ${id}: servicio=${svc?.title ?? order.service}, usuario=@${order.username}, cantidad=${order.totalFollowers}, estado=${STATUS[order.status] ?? order.status}, pago=${order.payment}.`,
  };
}

// ---------- Claude API ----------
async function callClaude(
  message: string,
  agentName: string,
  ctxText: string
): Promise<string | null> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return null;

  const system = `Sos ${agentName}, una agente de soporte amable y profesional de TopViralMarketing, empresa argentina que vende seguidores, likes, vistas, compartidos y guardados para Instagram y TikTok.

Reglas:
- Respondé SIEMPRE en español argentino con voseo (vos, tenés, podés, hacés, etc.)
- Respuestas CORTAS: máximo 2-3 oraciones. Nunca hagas listas largas.
- Sé cálida, empática y directa al punto
- Tiempo de entrega: siempre 10 minutos a 2 horas (proceso gradual para proteger la cuenta)
- Garantía de reposición incluida en todos los servicios
- Si el pedido está "pagado" o "en entrega": deciles que el pago fue recibido y está en camino
- Si el pedido está "pendiente de pago": pedíles que completen el pago
- Si no encontrás el pedido: decíles que verifiquen el número
- No inventes información que no tenés
- No uses tu nombre al final. No uses comillas raras ni asteriscos.
- Para problemas graves, ofrecé escalar a Instagram DM o email
- Si el cliente TODAVÍA no dejó su email en la conversación, pedíselo amablemente al inicio para poder seguir la consulta; una vez que lo deja, agradecé y respondé su duda${ctxText ? `\n\nDatos de la orden consultada:\n${ctxText}` : ""}`;

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 180,
        system,
        messages: [{ role: "user", content: message }],
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return (data.content?.[0]?.text as string) ?? null;
  } catch {
    return null;
  }
}

async function computeReply(message: string, agentName: string): Promise<string> {
  const { text: ctx, orderId } = await orderContext(message);

  // 1. Claude si hay API key
  const aiReply = await callClaude(message, agentName, ctx);
  if (aiReply) return aiReply;

  // 2. Respuesta directa por orden
  if (orderId) {
    const order = await getOrder(orderId);
    if (order) {
      const s = order.status;
      if (s === "paid" || s === "delivering")
        return `¡Tu pedido ${order.id} fue recibido exitosamente! 🎉 Estamos procesando ${order.totalFollowers.toLocaleString("es-AR")} unidades para @${order.username}. Llega en 10 minutos a 2 horas.`;
      if (s === "delivered")
        return `Tu pedido ${order.id} fue entregado exitosamente. ¿Todo llegó bien a @${order.username}? Si algo faltó, recordá que tenés garantía de reposición. 😊`;
      return `Tu pedido ${order.id} está pendiente de pago. Completá el pago y en 10 minutos a 2 horas ya tenés todo. Si ya pagaste, puede tardar unos minutos en actualizarse.`;
    }
    return `No encontré el pedido ${orderId}. Verificá que el número esté bien escrito (formato ORD-XXXXX). Si creés que hay un error, escribinos por Instagram DM o email. 😊`;
  }

  // 3. Pattern matching
  const match = patternMatch(message, agentName);
  if (match) return match;

  // 4. Default
  return "Entendido. ¿Podés contarme un poco más? Si tenés un número de pedido (formato ORD-XXXXX) compartímelo y lo reviso de inmediato. 😊";
}

// ---------- Route ----------
export async function POST(req: NextRequest) {
  try {
    const { message, agentName, conversationId } = await req.json();
    const cid = conversationId ? String(conversationId) : null;
    if (!message?.trim()) {
      return NextResponse.json({ reply: "Hola, ¿en qué te puedo ayudar? 😊" });
    }

    // Guardamos el mensaje del cliente (para que lo veas en /admin)
    if (cid) await addMessage(cid, "user", String(message)).catch(() => {});

    // Si dejó el email en el chat, lo guardamos como lead (origen soporte).
    const emailHit = String(message).match(EMAIL_RE);
    if (emailHit) {
      await captureLead({ email: emailHit[0], source: "soporte" }).catch(() => {});
    }

    const reply = await computeReply(String(message), agentName ?? "Valentina");

    if (cid) await addMessage(cid, "agent", reply).catch(() => {});

    return NextResponse.json({ reply });
  } catch (err) {
    console.error("[support/chat]", err);
    return NextResponse.json({
      reply: "Disculpá, tuve un problema de conexión. Podés escribirnos por Instagram DM o email y te ayudamos al instante. 😊",
    });
  }
}

// Polling del cliente: trae mensajes nuevos (ej. respuestas del admin).
export async function GET(req: NextRequest) {
  const cid = req.nextUrl.searchParams.get("cid");
  const after = Number(req.nextUrl.searchParams.get("after") ?? "0");
  if (!cid) return NextResponse.json({ messages: [] });
  const messages = await messagesAfter(cid, after);
  return NextResponse.json({ messages });
}
