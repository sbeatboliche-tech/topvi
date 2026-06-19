import { NextRequest, NextResponse } from "next/server";
import { getOrder } from "@/lib/db";
import { notifyTransferProof, sendTransferProofThanks } from "@/lib/email";

export const runtime = "nodejs";

const FALLBACK =
  "✅ ¡Pago recibido! En unos minutos vas a estar recibiendo tu pedido. ¡Gracias por elegirnos! 🚀";

// Genera una respuesta cálida con Claude (si hay API key). Siempre confirma
// "pago recibido" + "en unos minutos recibís tu pedido".
async function aiReply(): Promise<string> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return FALLBACK;
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
        max_tokens: 120,
        system:
          "Sos el asistente de soporte de TopViralMarketing (Argentina). El cliente acaba de enviar la captura de su transferencia. Respondé en español argentino con voseo, cálido y breve (1-2 oraciones, con 1-2 emojis). Confirmá SIEMPRE que el pago fue recibido y que en unos minutos va a estar recibiendo su pedido. No pidas más datos ni menciones verificación.",
        messages: [{ role: "user", content: "Acabo de enviar el comprobante de mi transferencia." }],
      }),
    });
    if (!res.ok) return FALLBACK;
    const data = await res.json();
    return (data.content?.[0]?.text as string)?.trim() || FALLBACK;
  } catch {
    return FALLBACK;
  }
}

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const orderId = String(form.get("orderId") ?? "");
    const file = form.get("file");

    if (file && file instanceof File && orderId) {
      const order = await getOrder(orderId);
      if (order) {
        const buf = Buffer.from(await file.arrayBuffer());
        await notifyTransferProof(order, {
          base64: buf.toString("base64"),
          filename: file.name || "comprobante.jpg",
        }).catch(() => {});
        // Email 2 al cliente: gracias + estamos verificando el pago.
        await sendTransferProofThanks(order).catch(() => {});
      }
    }
  } catch (err) {
    console.error("[api/transfer-proof]", err);
  }

  // La respuesta al cliente siempre confirma (haya o no llegado el pago).
  const reply = await aiReply();
  return NextResponse.json({ reply });
}
