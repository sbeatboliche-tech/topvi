// ============================================================
//  CHAT DE SOPORTE (persistente)
//  Guarda los mensajes para que el admin pueda ver y responder.
//  - Con Supabase → tabla `chat_messages`.
//  - Sin Supabase → memoria (solo dev; no persiste entre requests serverless).
// ============================================================

export type ChatRole = "user" | "agent" | "admin";

export interface ChatMsg {
  id: number;
  conversationId: string;
  role: ChatRole;
  text: string;
  createdAt: string;
}

const hasSupabase =
  !!process.env.SUPABASE_URL && !!process.env.SUPABASE_SERVICE_KEY;

const memory: ChatMsg[] = [];
let memId = 0;
const MAX_MEMORY = 2000;

async function sb() {
  const { createClient } = await import("@supabase/supabase-js");
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!,
    { auth: { persistSession: false } }
  );
}

export async function addMessage(
  conversationId: string,
  role: ChatRole,
  text: string
): Promise<ChatMsg | null> {
  const cid = String(conversationId).slice(0, 80);
  const body = String(text).slice(0, 2000);
  if (!cid || !body) return null;

  if (hasSupabase) {
    const client = await sb();
    const { data } = await client
      .from("chat_messages")
      .insert({ conversation_id: cid, role, text: body })
      .select("*")
      .single();
    return data ? fromRow(data) : null;
  }
  const msg: ChatMsg = {
    id: ++memId,
    conversationId: cid,
    role,
    text: body,
    createdAt: new Date().toISOString(),
  };
  memory.push(msg);
  if (memory.length > MAX_MEMORY) memory.splice(0, memory.length - MAX_MEMORY);
  return msg;
}

// Mensajes de una conversación con id > afterId (para polling).
export async function messagesAfter(
  conversationId: string,
  afterId: number
): Promise<ChatMsg[]> {
  if (hasSupabase) {
    const client = await sb();
    const { data } = await client
      .from("chat_messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .gt("id", afterId)
      .order("id", { ascending: true })
      .limit(100);
    return (data ?? []).map(fromRow);
  }
  return memory
    .filter((m) => m.conversationId === conversationId && m.id > afterId)
    .sort((a, b) => a.id - b.id);
}

// Lista de conversaciones (para el admin): última actividad + sin leer.
const EMAIL_RE = /[^\s@]+@[^\s@]+\.[^\s@]{2,}/;

export async function listConversations(): Promise<
  {
    conversationId: string;
    email: string | null;
    lastText: string;
    lastRole: ChatRole;
    lastAt: string;
    count: number;
    pendingUser: boolean;
  }[]
> {
  let msgs: ChatMsg[];
  if (hasSupabase) {
    const client = await sb();
    const { data } = await client
      .from("chat_messages")
      .select("*")
      .order("id", { ascending: false })
      .limit(1000);
    msgs = (data ?? []).map(fromRow);
  } else {
    msgs = [...memory].sort((a, b) => b.id - a.id);
  }

  const byConv = new Map<string, ChatMsg[]>();
  for (const m of msgs) {
    const arr = byConv.get(m.conversationId) ?? [];
    arr.push(m);
    byConv.set(m.conversationId, arr);
  }

  const out = [...byConv.entries()].map(([cid, arr]) => {
    const sorted = arr.sort((a, b) => a.id - b.id);
    const last = sorted[sorted.length - 1];
    // "pendiente" si el último mensaje del cliente no tiene respuesta de admin posterior
    const lastUserIdx = sorted.map((m) => m.role).lastIndexOf("user");
    const lastAdminIdx = sorted.map((m) => m.role).lastIndexOf("admin");
    // Email = primer mail que aparezca en un mensaje del cliente.
    let email: string | null = null;
    for (const m of sorted) {
      if (m.role === "user") {
        const hit = m.text.match(EMAIL_RE);
        if (hit) {
          email = hit[0].toLowerCase();
          break;
        }
      }
    }
    return {
      conversationId: cid,
      email,
      lastText: last.text,
      lastRole: last.role,
      lastAt: last.createdAt,
      count: sorted.length,
      pendingUser: lastUserIdx > lastAdminIdx,
    };
  });
  return out.sort((a, b) => b.lastAt.localeCompare(a.lastAt));
}

export async function conversationMessages(
  conversationId: string
): Promise<ChatMsg[]> {
  if (hasSupabase) {
    const client = await sb();
    const { data } = await client
      .from("chat_messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("id", { ascending: true })
      .limit(500);
    return (data ?? []).map(fromRow);
  }
  return memory
    .filter((m) => m.conversationId === conversationId)
    .sort((a, b) => a.id - b.id);
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function fromRow(r: any): ChatMsg {
  return {
    id: r.id,
    conversationId: r.conversation_id,
    role: r.role,
    text: r.text,
    createdAt: r.created_at,
  };
}
