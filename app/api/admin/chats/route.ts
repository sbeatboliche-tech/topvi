import { NextRequest, NextResponse } from "next/server";
import { isAuthed } from "@/lib/auth";
import { listConversations, conversationMessages, addMessage } from "@/lib/chat";

// GET            -> lista de conversaciones
// GET ?cid=xxx   -> mensajes de una conversación
// POST {cid,text}-> responde como vos (rol admin, se muestra como el agente)
export async function GET(req: NextRequest) {
  if (!(await isAuthed()))
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const cid = req.nextUrl.searchParams.get("cid");
  if (cid) {
    return NextResponse.json({ messages: await conversationMessages(cid) });
  }
  return NextResponse.json({ conversations: await listConversations() });
}

export async function POST(req: NextRequest) {
  if (!(await isAuthed()))
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { cid, text } = await req.json();
  if (!cid || !text?.trim())
    return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
  const msg = await addMessage(String(cid), "admin", String(text));
  return NextResponse.json({ ok: true, message: msg });
}
