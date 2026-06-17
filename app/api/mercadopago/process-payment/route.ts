import { NextRequest, NextResponse } from "next/server";
import { getOrder, updateStatus } from "@/lib/db";
import { processCardPayment } from "@/lib/mercadopago";
import { notifyNewOrder, sendOrderConfirmation } from "@/lib/email";
import { markLeadCustomer } from "@/lib/leads";

// Procesa el pago con tarjeta (Checkout Transparente). El navegador manda el
// token de la tarjeta + cuotas; acá creamos el pago real en MercadoPago.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, token, installments, payment_method_id, issuer_id, payerEmail } =
      body;

    const order = orderId ? await getOrder(String(orderId)) : null;
    if (!order) {
      return NextResponse.json({ error: "Orden no encontrada" }, { status: 404 });
    }
    if (!token || !payment_method_id) {
      return NextResponse.json({ error: "Datos de tarjeta incompletos" }, { status: 400 });
    }

    const result = await processCardPayment(order, {
      token: String(token),
      installments: Number(installments) || 1,
      payment_method_id: String(payment_method_id),
      issuer_id: issuer_id ? String(issuer_id) : undefined,
      payerEmail: String(payerEmail || order.contact),
    });

    if (result.status === "approved") {
      await updateStatus(order.id, "paid");
      await notifyNewOrder(order);
      await sendOrderConfirmation(order).catch(() => {});
      await markLeadCustomer(order.contact).catch(() => {});
    }

    return NextResponse.json({ status: result.status, detail: result.detail });
  } catch (err) {
    console.error("[process-payment]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error del servidor" },
      { status: 500 }
    );
  }
}
