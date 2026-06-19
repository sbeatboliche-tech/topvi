import { NextRequest, NextResponse } from "next/server";
import { isAuthed } from "@/lib/auth";
import { listOrders, updateStatus, deleteOrder, getOrder, type OrderStatus } from "@/lib/db";
import { markLeadCustomer } from "@/lib/leads";

export async function GET() {
  if (!(await isAuthed()))
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  return NextResponse.json({ orders: await listOrders() });
}

export async function POST(req: NextRequest) {
  if (!(await isAuthed()))
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { id, status } = await req.json();
  const valid: OrderStatus[] = [
    "pending_payment",
    "paid",
    "delivering",
    "delivered",
    "cancelled",
  ];
  if (!id || !valid.includes(status))
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  await updateStatus(id, status);
  // Si lo marcás Pagado/Entregando/Entregado, el lead pasa a "cliente".
  if (["paid", "delivering", "delivered"].includes(status)) {
    const order = await getOrder(String(id));
    if (order) await markLeadCustomer(order.contact).catch(() => {});
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  if (!(await isAuthed()))
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "Falta el id" }, { status: 400 });
  await deleteOrder(String(id));
  return NextResponse.json({ ok: true });
}
