import { NextRequest, NextResponse } from "next/server";
import { getOrder, getOrdersByContact } from "@/lib/db";
import { getService } from "@/lib/config";

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  const contact = req.nextUrl.searchParams.get("contact");

  if (!id && !contact) {
    return NextResponse.json({ error: "Falta id o contact" }, { status: 400 });
  }

  const STATUS_LABEL: Record<string, string> = {
    pending_payment: "Pendiente de pago",
    paid: "Pagado — en proceso",
    delivering: "Entregando",
    delivered: "Entregado ✓",
    cancelled: "Cancelado",
  };

  if (id) {
    const order = await getOrder(id.toUpperCase());
    if (!order) return NextResponse.json({ error: "No encontrada" }, { status: 404 });
    const svc = getService(order.service);
    return NextResponse.json({
      orders: [{
        id: order.id,
        service: svc?.title ?? order.service,
        username: order.username,
        quantity: order.totalFollowers,
        statusRaw: order.status,
        status: STATUS_LABEL[order.status] ?? order.status,
        payment: order.payment,
        createdAt: order.createdAt,
      }],
    });
  }

  const orders = await getOrdersByContact(contact!);
  return NextResponse.json({
    orders: orders.map((order) => {
      const svc = getService(order.service);
      return {
        id: order.id,
        service: svc?.title ?? order.service,
        username: order.username,
        quantity: order.totalFollowers,
        statusRaw: order.status,
        status: STATUS_LABEL[order.status] ?? order.status,
        payment: order.payment,
        createdAt: order.createdAt,
      };
    }),
  });
}
