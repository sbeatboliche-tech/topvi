// ============================================================
//  LEADS / SUSCRIPTORES
//  Captura de emails (compraron o no) para remarketing.
//  - Con Supabase configurado → tabla `leads` (persistente).
//  - Sin Supabase → store en memoria (solo dev).
// ============================================================

export interface Lead {
  email: string;
  createdAt: string;
  updatedAt: string;
  locale?: string;
  service?: string;
  source?: string;
  status: "lead" | "customer";
  orderedAt?: string | null;
  purchasedAt?: string | null;
  discountCode?: string | null;
  discountSentAt?: string | null;
}

const hasSupabase =
  !!process.env.SUPABASE_URL && !!process.env.SUPABASE_SERVICE_KEY;

const memory = new Map<string, Lead>();

async function sb() {
  const { createClient } = await import("@supabase/supabase-js");
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!,
    { auth: { persistSession: false } }
  );
}

// Email válido y normalizado (minúsculas). Devuelve null si no es email.
export function normalizeEmail(raw: unknown): string | null {
  const s = String(raw ?? "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s)) return null;
  return s.slice(0, 200);
}

// Guarda/actualiza un lead SIN pisar su estado (status/purchased).
export async function captureLead(input: {
  email: string;
  locale?: string;
  service?: string;
  source?: string;
}): Promise<void> {
  const email = normalizeEmail(input.email);
  if (!email) return;
  const now = new Date().toISOString();

  if (hasSupabase) {
    const client = await sb();
    // upsert solo de campos "blandos": no toca status/ordered/purchased.
    await client.from("leads").upsert(
      {
        email,
        locale: input.locale,
        service: input.service,
        source: input.source,
        updated_at: now,
      },
      { onConflict: "email" }
    );
    return;
  }

  const prev = memory.get(email);
  memory.set(email, {
    email,
    createdAt: prev?.createdAt ?? now,
    updatedAt: now,
    locale: input.locale ?? prev?.locale,
    service: input.service ?? prev?.service,
    source: input.source ?? prev?.source,
    status: prev?.status ?? "lead",
    orderedAt: prev?.orderedAt ?? null,
    purchasedAt: prev?.purchasedAt ?? null,
    discountCode: prev?.discountCode ?? null,
    discountSentAt: prev?.discountSentAt ?? null,
  });
}

// Marca que el lead creó una orden (haya pagado o no).
export async function markLeadOrdered(
  rawEmail: unknown,
  service?: string,
  locale?: string
): Promise<void> {
  const email = normalizeEmail(rawEmail);
  if (!email) return;
  const now = new Date().toISOString();

  if (hasSupabase) {
    const client = await sb();
    await client.from("leads").upsert(
      { email, service, locale, ordered_at: now, updated_at: now },
      { onConflict: "email" }
    );
    return;
  }
  const prev = memory.get(email);
  memory.set(email, {
    email,
    createdAt: prev?.createdAt ?? now,
    updatedAt: now,
    locale: locale ?? prev?.locale,
    service: service ?? prev?.service,
    source: prev?.source ?? "checkout",
    status: prev?.status ?? "lead",
    orderedAt: now,
    purchasedAt: prev?.purchasedAt ?? null,
    discountCode: prev?.discountCode ?? null,
    discountSentAt: prev?.discountSentAt ?? null,
  });
}

// Marca al lead como cliente (pago confirmado).
export async function markLeadCustomer(rawEmail: unknown): Promise<void> {
  const email = normalizeEmail(rawEmail);
  if (!email) return;
  const now = new Date().toISOString();

  if (hasSupabase) {
    const client = await sb();
    await client.from("leads").upsert(
      { email, status: "customer", purchased_at: now, updated_at: now },
      { onConflict: "email" }
    );
    return;
  }
  const prev = memory.get(email);
  memory.set(email, {
    email,
    createdAt: prev?.createdAt ?? now,
    updatedAt: now,
    locale: prev?.locale,
    service: prev?.service,
    source: prev?.source,
    status: "customer",
    orderedAt: prev?.orderedAt ?? null,
    purchasedAt: now,
    discountCode: prev?.discountCode ?? null,
    discountSentAt: prev?.discountSentAt ?? null,
  });
}

export async function listLeads(): Promise<Lead[]> {
  if (hasSupabase) {
    const client = await sb();
    const { data } = await client
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false });
    return (data ?? []).map(fromRow);
  }
  return [...memory.values()].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt)
  );
}

// Leads que aún no compraron, sin mail de descuento enviado, y "viejos".
export async function leadsNeedingDiscount(
  minHoursOld: number
): Promise<Lead[]> {
  const cutoff = new Date(Date.now() - minHoursOld * 3600_000).toISOString();
  if (hasSupabase) {
    const client = await sb();
    const { data } = await client
      .from("leads")
      .select("*")
      .eq("status", "lead")
      .is("purchased_at", null)
      .is("discount_sent_at", null)
      .lt("created_at", cutoff)
      .limit(200);
    return (data ?? []).map(fromRow);
  }
  return [...memory.values()].filter(
    (l) =>
      l.status === "lead" &&
      !l.purchasedAt &&
      !l.discountSentAt &&
      l.createdAt < cutoff
  );
}

export async function markDiscountSent(
  rawEmail: unknown,
  code: string
): Promise<void> {
  const email = normalizeEmail(rawEmail);
  if (!email) return;
  const now = new Date().toISOString();
  if (hasSupabase) {
    const client = await sb();
    await client
      .from("leads")
      .update({ discount_code: code, discount_sent_at: now, updated_at: now })
      .eq("email", email);
    return;
  }
  const prev = memory.get(email);
  if (prev) {
    prev.discountCode = code;
    prev.discountSentAt = now;
    prev.updatedAt = now;
  }
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function fromRow(r: any): Lead {
  return {
    email: r.email,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    locale: r.locale ?? undefined,
    service: r.service ?? undefined,
    source: r.source ?? undefined,
    status: r.status === "customer" ? "customer" : "lead",
    orderedAt: r.ordered_at ?? null,
    purchasedAt: r.purchased_at ?? null,
    discountCode: r.discount_code ?? null,
    discountSentAt: r.discount_sent_at ?? null,
  };
}
