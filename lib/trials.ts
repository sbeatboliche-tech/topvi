// Rastrea quién ya usó la prueba gratuita.
// En dev usa memoria; en prod usa Supabase (tabla free_trials).

const TRIAL_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 días

const memStore = new Map<string, number>(); // key → timestamp

const hasSupabase =
  !!process.env.SUPABASE_URL && !!process.env.SUPABASE_SERVICE_KEY;

async function sb() {
  const { createClient } = await import("@supabase/supabase-js");
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!,
    { auth: { persistSession: false } }
  );
}

export async function hasClaimedTrial(key: string): Promise<boolean> {
  if (hasSupabase) {
    const client = await sb();
    const cutoff = new Date(Date.now() - TRIAL_TTL_MS).toISOString();
    const { data } = await client
      .from("free_trials")
      .select("id")
      .eq("lookup_key", key)
      .gte("created_at", cutoff)
      .limit(1);
    return (data?.length ?? 0) > 0;
  }
  const ts = memStore.get(key);
  return ts !== undefined && Date.now() - ts < TRIAL_TTL_MS;
}

export async function markTrialClaimed(key: string): Promise<void> {
  if (hasSupabase) {
    const client = await sb();
    await client.from("free_trials").insert({ lookup_key: key });
    return;
  }
  memStore.set(key, Date.now());
}
