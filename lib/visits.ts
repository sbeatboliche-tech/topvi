// ============================================================
//  VISITAS / FUNNEL POR IP
//  Registra hasta qué eslabón del embudo llegó cada IP.
//  - Con Supabase → tabla `visitors` (1 fila por IP, guarda el más lejos).
//  - Sin Supabase → memoria (solo dev).
// ============================================================

// Orden del embudo (eslabones)
export const STAGE_RANK: Record<string, number> = {
  home: 1,
  servicios: 2,
  checkout: 3,
  payment: 4,
  gracias: 5,
};
export const STAGE_LABEL: Record<string, string> = {
  home: "Inicio",
  servicios: "Vio servicios",
  checkout: "Eligiendo cantidad",
  payment: "Está pagando",
  gracias: "Completó el pedido",
};

export interface Visitor {
  ip: string;
  stage: string;
  rank: number;
  hits: number;
  region?: string;
  firstAt: string;
  lastAt: string;
  timeOnPage?: number; // segundos máximos registrados en la sesión
}

const hasSupabase =
  !!process.env.SUPABASE_URL && !!process.env.SUPABASE_SERVICE_KEY;

const memory = new Map<string, Visitor>();

async function sb() {
  const { createClient } = await import("@supabase/supabase-js");
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!, {
    auth: { persistSession: false },
  });
}

export async function trackVisit(
  ip: string,
  stage: string,
  region?: string,
  seconds?: number
): Promise<void> {
  const cleanIp = String(ip || "unknown").slice(0, 64);
  const rank = STAGE_RANK[stage] ?? 1;
  const reg = region ? String(region).slice(0, 80) : undefined;
  const now = new Date().toISOString();

  if (hasSupabase) {
    const client = await sb();
    const { data } = await client
      .from("visitors")
      .select("rank, hits")
      .eq("ip", cleanIp)
      .single();
    if (!data) {
      await client.from("visitors").insert({
        ip: cleanIp,
        stage,
        rank,
        hits: 1,
        first_at: now,
        last_at: now,
      });
    } else {
      const better = rank > (data.rank ?? 0);
      await client
        .from("visitors")
        .update({
          hits: (data.hits ?? 0) + 1,
          last_at: now,
          ...(better ? { stage, rank } : {}),
        })
        .eq("ip", cleanIp);
    }
    // Región: best-effort. Si la columna no existe, no rompe el tracking.
    if (reg) {
      const upd = await client.from("visitors").update({ region: reg }).eq("ip", cleanIp);
      if (upd.error) console.warn("[visits] region no guardada:", upd.error.message);
    }
    // Tiempo en página: guarda el máximo registrado. Best-effort.
    if (seconds && seconds > 0) {
      const upd = await client
        .from("visitors")
        .update({ time_on_page: seconds })
        .eq("ip", cleanIp)
        .or(`time_on_page.is.null,time_on_page.lt.${seconds}`);
      if (upd.error) console.warn("[visits] time_on_page no guardado:", upd.error.message);
    }
    return;
  }

  const prev = memory.get(cleanIp);
  if (!prev) {
    memory.set(cleanIp, {
      ip: cleanIp,
      stage,
      rank,
      hits: 1,
      region: reg,
      firstAt: now,
      lastAt: now,
      timeOnPage: seconds,
    });
  } else {
    const better = rank > prev.rank;
    memory.set(cleanIp, {
      ...prev,
      hits: prev.hits + 1,
      lastAt: now,
      stage: better ? stage : prev.stage,
      rank: better ? rank : prev.rank,
      region: prev.region ?? reg,
      timeOnPage: seconds && (!prev.timeOnPage || seconds > prev.timeOnPage)
        ? seconds
        : prev.timeOnPage,
    });
  }
}

export interface DayStat {
  day: string;   // YYYY-MM-DD
  unique: number;
}

export async function getDailyStats(days = 30): Promise<DayStat[]> {
  if (hasSupabase) {
    const client = await sb();
    const since = new Date();
    since.setDate(since.getDate() - days);
    const { data } = await client
      .from("visitors")
      .select("first_at")
      .gte("first_at", since.toISOString());
    const map = new Map<string, number>();
    for (const row of data ?? []) {
      const day = (row.first_at as string).slice(0, 10);
      map.set(day, (map.get(day) ?? 0) + 1);
    }
    return [...map.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([day, unique]) => ({ day, unique }));
  }
  // fallback memory
  const map = new Map<string, number>();
  for (const v of memory.values()) {
    const day = v.firstAt.slice(0, 10);
    map.set(day, (map.get(day) ?? 0) + 1);
  }
  return [...map.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([day, unique]) => ({ day, unique }));
}

export async function listVisitors(): Promise<Visitor[]> {
  if (hasSupabase) {
    const client = await sb();
    const { data } = await client
      .from("visitors")
      .select("*")
      .order("last_at", { ascending: false })
      .limit(500);
    /* eslint-disable @typescript-eslint/no-explicit-any */
    return (data ?? []).map((r: any) => ({
      ip: r.ip,
      stage: r.stage,
      rank: r.rank,
      hits: r.hits,
      region: r.region ?? undefined,
      firstAt: r.first_at,
      lastAt: r.last_at,
      timeOnPage: r.time_on_page ?? undefined,
    }));
  }
  return [...memory.values()].sort((a, b) => b.lastAt.localeCompare(a.lastAt));
}
