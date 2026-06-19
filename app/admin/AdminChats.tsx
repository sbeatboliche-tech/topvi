"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";

type Conv = {
  conversationId: string;
  email: string | null;
  lastText: string;
  lastRole: string;
  lastAt: string;
  count: number;
  pendingUser: boolean;
};
type Msg = {
  id: number;
  conversationId: string;
  role: "user" | "agent" | "admin";
  text: string;
  createdAt: string;
};

function shortId(id: string) {
  return id.length > 10 ? id.slice(0, 10) + "…" : id;
}
function hhmm(iso: string) {
  return new Date(iso).toLocaleString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminChats() {
  const [convs, setConvs] = useState<Conv[]>([]);
  const [active, setActive] = useState<string | null>(null);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const loadConvs = useCallback(async () => {
    const r = await fetch("/api/admin/chats").then((x) => x.json());
    setConvs(r.conversations ?? []);
  }, []);

  const loadMsgs = useCallback(async (cid: string) => {
    const r = await fetch(`/api/admin/chats?cid=${encodeURIComponent(cid)}`).then((x) =>
      x.json()
    );
    setMsgs(r.messages ?? []);
  }, []);

  useEffect(() => {
    loadConvs();
    const i = setInterval(loadConvs, 6000);
    return () => clearInterval(i);
  }, [loadConvs]);

  useEffect(() => {
    if (!active) return;
    loadMsgs(active);
    const i = setInterval(() => loadMsgs(active), 4000);
    return () => clearInterval(i);
  }, [active, loadMsgs]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

  async function send() {
    if (!active || !text.trim() || sending) return;
    setSending(true);
    const t = text.trim();
    setText("");
    await fetch("/api/admin/chats", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cid: active, text: t }),
    });
    await loadMsgs(active);
    setSending(false);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Soporte / Chats</h1>
          <p className="text-sm text-muted">
            {convs.length} conversaciones · la IA responde sola, vos podés sumarte
          </p>
        </div>
        <Link
          href="/admin"
          className="rounded-full border border-border bg-surface px-4 py-2 text-sm hover:bg-surface-2"
        >
          ← Órdenes
        </Link>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-[300px_1fr]">
        {/* Lista de conversaciones */}
        <div className="max-h-[70vh] overflow-y-auto rounded-2xl border border-border">
          {convs.length === 0 && (
            <p className="p-6 text-center text-sm text-muted">
              Todavía no hay conversaciones.
            </p>
          )}
          {convs.map((c) => (
            <button
              key={c.conversationId}
              onClick={() => setActive(c.conversationId)}
              className={`block w-full border-b border-border p-3 text-left transition-colors hover:bg-surface-2 ${
                active === c.conversationId ? "bg-surface-2" : ""
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-xs font-semibold">
                  {c.email ? `📧 ${c.email}` : `👤 ${shortId(c.conversationId)}`}
                </span>
                {c.pendingUser && (
                  <span className="shrink-0 rounded-full bg-warning px-1.5 py-0.5 text-[9px] font-bold text-black">
                    SIN RESPONDER
                  </span>
                )}
              </div>
              <p className="mt-1 truncate text-xs text-muted">
                {c.lastRole === "user" ? "🧑 " : c.lastRole === "admin" ? "🟢 " : "🤖 "}
                {c.lastText}
              </p>
              <p className="mt-0.5 text-[10px] text-muted">{hhmm(c.lastAt)}</p>
            </button>
          ))}
        </div>

        {/* Conversación activa */}
        <div className="flex max-h-[70vh] flex-col rounded-2xl border border-border">
          {!active ? (
            <p className="m-auto p-10 text-center text-sm text-muted">
              Elegí una conversación para ver y responder.
            </p>
          ) : (
            <>
              <div className="flex-1 space-y-3 overflow-y-auto p-4">
                {msgs.map((m) => (
                  <div
                    key={m.id}
                    className={`flex ${m.role === "user" ? "justify-start" : "justify-end"}`}
                  >
                    <div
                      className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-sm ${
                        m.role === "user"
                          ? "rounded-bl-none bg-surface-2"
                          : m.role === "admin"
                          ? "rounded-br-none bg-success/20 text-foreground"
                          : "rounded-br-none brand-gradient"
                      }`}
                    >
                      <div className="mb-0.5 text-[9px] uppercase opacity-60">
                        {m.role === "user" ? "Cliente" : m.role === "admin" ? "Vos" : "IA"}
                      </div>
                      {m.text}
                    </div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>
              <div className="flex gap-2 border-t border-border p-3">
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && send()}
                  placeholder="Escribí tu respuesta…"
                  className="flex-1 rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-brand"
                />
                <button
                  onClick={send}
                  disabled={sending || !text.trim()}
                  className="brand-gradient rounded-xl px-5 py-2 text-sm font-semibold disabled:opacity-50"
                >
                  Enviar
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
