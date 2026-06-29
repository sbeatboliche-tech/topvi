import { NextRequest, NextResponse } from "next/server";
import { isAuthed } from "@/lib/auth";
import { conversationMessages } from "@/lib/chat";
import { sendChatTranscript } from "@/lib/email";

const EMAIL_RE = /[^\s@]+@[^\s@]+\.[^\s@]{2,}/;

export async function POST(req: NextRequest) {
  if (!(await isAuthed()))
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { cid } = await req.json();
  if (!cid) return NextResponse.json({ error: "Falta cid" }, { status: 400 });

  const messages = await conversationMessages(String(cid));
  if (!messages.length)
    return NextResponse.json({ error: "Sin mensajes" }, { status: 404 });

  let email: string | null = null;
  for (const m of messages) {
    if (m.role === "user") {
      const hit = m.text.match(EMAIL_RE);
      if (hit) { email = hit[0].toLowerCase(); break; }
    }
  }

  if (!email)
    return NextResponse.json({ error: "Sin email en la conversación" }, { status: 400 });

  const ok = await sendChatTranscript(email, messages);
  if (!ok) return NextResponse.json({ error: "Error al enviar" }, { status: 500 });

  return NextResponse.json({ ok: true, sentTo: email });
}
