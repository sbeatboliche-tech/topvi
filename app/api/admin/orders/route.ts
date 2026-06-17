import { NextRequest, NextResponse } from "next/server";
import { isAuthed } from "@/lib/auth";
import { listOrders, updateStatus, deleteOrder, type OrderStatus } from "@/lib/db";

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
