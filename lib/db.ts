// ============================================================
//  CAPA DE DATOS (órdenes)
//  - Si configurás Supabase (SUPABASE_URL + SUPABASE_SERVICE_KEY),
//    usa Supabase (persistente, recomendado para producción).
//  - Si no, usa un store en memoria (sirve para probar en local;
//    se borra al reiniciar el servidor).
// ============================================================

export type OrderStatus =
  | "pending_payment" // esperando pago
  | "paid" // pagado, falta entregar
  | "delivering" // entregando
  | "delivered" // entregado
  | "cancelled";

export interface Order {
  id: string;
  createdAt: string;
  locale: string; // país/idioma del comprador (ej "ar", "br")
  service: string; // slug del servicio (ej "instagram-seguidores")
  username: string; // @usuario o link del posteo
  contact: string;
  quantity: number;
  bonus: number;
  quality: string;
  totalFollowers: number;
  amount: number; // ARS
  payment: "mercadopago" | "tarjeta" | "usdt" | "transferencia";
  status: OrderStatus;
  notes?: string; // desglose del pack + links de posteos (para entregar)
}

const hasSupabase =
  !!process.env.SUPABASE_URL && !!process.env.SUPABASE_SERVICE_KEY;

// ---------- Fallback en memoria ----------
const memory: Order[] = [];

// ---------- Cliente Supabase (lazy) ----------
async function sb() {
  const { createClient } = await import("@supabase/supabase-js");
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!,
    { auth: { persistSession: false } }
  );
}

function newId() {
  return (
    "ORD-" +
    Date.now().toString(36).toUpperCase() +
    Math.random().toString(36).slice(2, 6).toUpperCase()
  );
}

export async function createOrder(
  data: Omit<Order, "id" | "createdAt" | "status">
): Promise<Order> {
  const order: Order = {
    ...data,
    id: newId(),
    createdAt: new Date().toISOString(),
    status: "pending_payment",
  };

  if (hasSupabase) {
    const client = await sb();
    const { error } = await client.from("orders").insert({
      id: order.id,
      created_at: order.createdAt,
      locale: order.locale,
      service: order.service,
      username: order.username,
      contact: order.contact,
      quantity: order.quantity,
      bonus: order.bonus,
      quality: order.quality,
      total_followers: order.totalFollowers,
      amount: order.amount,
      payment: order.payment,
      status: order.status,
      notes: order.notes ?? null,
    });
    if (error) throw new Error(error.message);
  } else {
    memory.unshift(order);
    console.warn(
      "[db] Supabase no configurado: orden guardada solo en memoria."
    );
  }
  return order;
}

export async function getOrder(id: string): Promise<Order | null> {
  if (hasSupabase) {
    const client = await sb();
    const { data } = await client.from("orders").select("*").eq("id", id).single();
    return data ? fromRow(data) : null;
  }
  return memory.find((o) => o.id === id) ?? null;
}

export async function listOrders(): Promise<Order[]> {
  if (hasSupabase) {
    const client = await sb();
    const { data } = await client
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });
    return (data ?? []).map(fromRow);
  }
  return memory;
}

export async function getOrdersByContact(contact: string): Promise<Order[]> {
  const q = contact.trim().toLowerCase();
  if (hasSupabase) {
    const client = await sb();
    const { data } = await client
      .from("orders")
      .select("*")
      .ilike("contact", `%${q}%`)
      .order("created_at", { ascending: false })
      .limit(20);
    return (data ?? []).map(fromRow);
  }
  return memory.filter((o) => o.contact.toLowerCase().includes(q));
}

export async function updateStatus(id: string, status: OrderStatus) {
  if (hasSupabase) {
    const client = await sb();
    await client.from("orders").update({ status }).eq("id", id);
  } else {
    const o = memory.find((x) => x.id === id);
    if (o) o.status = status;
  }
}

export async function deleteOrder(id: string) {
  if (hasSupabase) {
    const client = await sb();
    await client.from("orders").delete().eq("id", id);
  } else {
    const i = memory.findIndex((x) => x.id === id);
    if (i >= 0) memory.splice(i, 1);
  }
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function fromRow(r: any): Order {
  return {
    id: r.id,
    createdAt: r.created_at,
    locale: r.locale ?? "ar",
    service: r.service ?? "",
    username: r.username,
    contact: r.contact,
    quantity: r.quantity,
    bonus: r.bonus,
    quality: r.quality,
    totalFollowers: r.total_followers,
    amount: Number(r.amount),
    payment: r.payment,
    status: r.status,
    notes: r.notes ?? undefined,
  };
}
