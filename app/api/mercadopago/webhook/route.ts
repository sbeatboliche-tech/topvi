import { NextRequest, NextResponse } from "next/server";
import { getPaymentStatus } from "@/lib/mercadopago";
import { getOrder, updateStatus } from "@/lib/db";
import { notifyNewOrder } from "@/lib/email";
import { markLeadCustomer } from "@/lib/leads";

// MercadoPago notifica acá cuando cambia el estado de un pago.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const type = body.type ?? req.nextUrl.searchParams.get("type");
    const paymentId =
      body?.data?.id ?? req.nextUrl.searchParams.get("data.id");

    if (type === "payment" && paymentId) {
      const payment = await getPaymentStatus(String(paymentId));
      const orderId = payment?.external_reference;
      if (orderId && payment?.status === "approved") {
        await updateStatus(orderId, "paid");
        const order = await getOrder(orderId);
        if (order) {
          await notifyNewOrder(order);
          await markLeadCustomer(order.contact).catch(() => {});
        }
        // TODO (entrega automática): si en el futuro conectás la API
        // de tu proveedor, disparala acá.
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("[mp webhook]", err);
    return NextResponse.json({ received: true });
  }
}

export async function GET() {
  return NextResponse.json({ ok: true });
}
