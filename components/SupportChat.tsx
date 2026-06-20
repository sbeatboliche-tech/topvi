"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { usePathname } from "next/navigation";
import { site } from "@/lib/config";

const AGENTS = [
  { name: "Valentina", color: "#e0457b" },
  { name: "Sofía",     color: "#7c3aed" },
  { name: "Camila",    color: "#0891b2" },
  { name: "Martina",   color: "#16a34a" },
  { name: "Florencia", color: "#ea580c" },
  { name: "Lucía",     color: "#6366f1" },
  { name: "Julieta",   color: "#d97706" },
];

type Message = { id: number; from: "agent" | "user"; text: string; time: string };
type ChatState = "closed" | "options" | "chat";

// ~3 segundos de delay para sentirse humano
function typingDelay(_text: string) {
  return 2800 + Math.random() * 600; // 2.8s – 3.4s
}

function nowTime() {
  return new Date().toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
}

const QUICK_REPLIES = [
  "Estado de mi pedido",
  "¿Cuándo llega mi pedido?",
  "Quiero comprar",
  "Tuve un problema",
];

export default function SupportChat({ locale }: { locale: string }) {
  const STORAGE_KEY = "tvm_chat_messages";
  const AGENT_KEY   = "tvm_chat_agent";
  const STATE_KEY   = "tvm_chat_state";
  const CID_KEY     = "tvm_chat_cid";

  const [conversationId] = useState(() => {
    try {
      let c = localStorage.getItem(CID_KEY);
      if (!c) {
        c = crypto.randomUUID?.() ?? `c_${Date.now()}_${Math.random().toString(36).slice(2)}`;
        localStorage.setItem(CID_KEY, c);
      }
      return c;
    } catch {
      return `c_${Date.now()}`;
    }
  });
  const lastSrvId = useRef(0);

  const [chatState, setChatStateRaw] = useState<ChatState>("closed");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [unread, setUnread] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [btnPos, setBtnPos] = useState<{ x: number; y: number } | null>(null);
  const pathname = usePathname();
  const lowerBtn = !!pathname && pathname.includes("/servicios");

  const [agent] = useState(() => {
    try {
      const saved = sessionStorage.getItem(AGENT_KEY);
      if (saved) return JSON.parse(saved) as (typeof AGENTS)[0];
    } catch { /* noop */ }
    const a = AGENTS[Math.floor(Math.random() * AGENTS.length)];
    try { sessionStorage.setItem(AGENT_KEY, JSON.stringify(a)); } catch { /* noop */ }
    return a;
  });

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLInputElement>(null);
  const msgId     = useRef(0);
  const greeted   = useRef(false);

  // Ref para el botón flotante (para drag sin re-renders)
  const btnRef = useRef<HTMLButtonElement>(null);
  // Posición acumulada durante el drag, sin tocar React state
  const dragPos = useRef<{ x: number; y: number } | null>(null);

  const setChatState = (s: ChatState) => {
    if (s !== "chat") setMinimized(false);
    setChatStateRaw(s);
    try { sessionStorage.setItem(STATE_KEY, s); } catch { /* noop */ }
  };

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved: Message[] = JSON.parse(raw);
        if (saved.length > 0) {
          setMessages(saved);
          msgId.current = Math.max(...saved.map((m) => m.id));
          greeted.current = true;
        }
      }
      const savedState = sessionStorage.getItem(STATE_KEY) as ChatState | null;
      if (savedState === "chat" || savedState === "options") {
        setChatStateRaw(savedState);
      }
    } catch { /* noop */ }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addMsg = useCallback((from: "agent" | "user", text: string) => {
    msgId.current++;
    const newMsg: Message = { id: msgId.current, from, text, time: nowTime() };
    setMessages((prev) => {
      const updated = [...prev, newMsg];
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(updated.slice(-50))); } catch { /* noop */ }
      return updated;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const agentReply = useCallback(
    async (userMessage: string) => {
      setIsTyping(true);
      try {
        const res = await fetch("/api/support/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: userMessage, agentName: agent.name, locale, conversationId }),
        });
        const data = await res.json();
        const reply: string = data.reply || "Un momento, te ayudo enseguida. 😊";
        await new Promise((r) => setTimeout(r, typingDelay(reply)));
        addMsg("agent", reply);
      } catch {
        await new Promise((r) => setTimeout(r, 1200));
        addMsg("agent", "Disculpá, tuve un problema. Podés escribirnos por Instagram DM y te ayudamos al instante. 😊");
      } finally {
        setIsTyping(false);
      }
    },
    [agent.name, locale, addMsg, conversationId]
  );

  useEffect(() => {
    if (chatState !== "chat") return;
    const poll = async () => {
      try {
        const r = await fetch(
          `/api/support/chat?cid=${encodeURIComponent(conversationId)}&after=${lastSrvId.current}`
        );
        const d = await r.json();
        for (const m of d.messages ?? []) {
          if (m.id > lastSrvId.current) lastSrvId.current = m.id;
          if (m.role === "admin") addMsg("agent", m.text);
        }
      } catch { /* noop */ }
    };
    poll();
    const i = setInterval(poll, 5000);
    return () => clearInterval(i);
  }, [chatState, conversationId, addMsg]);

  useEffect(() => {
    if (chatState === "chat" && !greeted.current) {
      greeted.current = true;
      setIsTyping(true);
      const delay = 1200 + Math.random() * 600;
      setTimeout(() => {
        setIsTyping(false);
        addMsg(
          "agent",
          `¡Hola! 👋 Soy ${agent.name}, del equipo de soporte de ${site.name}. Para ayudarte y poder seguir la conversación, ¿me dejás tu email? 📧`
        );
      }, delay);
    }
  }, [chatState, agent.name, addMsg]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    if (chatState === "chat" && !minimized) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [chatState, minimized]);

  useEffect(() => {
    const handler = () => {
      setChatState("chat");
      setUnread(false);
    };
    window.addEventListener("open-support-chat", handler);
    return () => window.removeEventListener("open-support-chat", handler);
  }, []);

  useEffect(() => {
    if (chatState !== "closed") return;
    const t = setTimeout(() => setUnread(true), 8000);
    return () => clearTimeout(t);
  }, [chatState]);

  const handleSend = useCallback(async () => {
    const msg = input.trim();
    if (!msg || isTyping) return;
    setInput("");
    addMsg("user", msg);
    await agentReply(msg);
  }, [input, isTyping, addMsg, agentReply]);

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleQuick = useCallback(
    async (text: string) => {
      addMsg("user", text);
      await agentReply(text);
    },
    [addMsg, agentReply]
  );

  const showQuickReplies = messages.length === 1 && !isTyping;

  // ── Drag del botón flotante — translate3d para drag a 60fps sin layout reflow ──
  const drag = useRef<{ sx: number; sy: number; moved: boolean } | null>(null);

  function onBtnPointerDown(e: React.PointerEvent) {
    const el = btnRef.current;
    if (el) {
      // Capturar posición real antes del drag y bloquear a left:0/top:0 + translate3d
      const rect = el.getBoundingClientRect();
      el.style.left       = "0";
      el.style.top        = "0";
      el.style.right      = "auto";
      el.style.bottom     = "auto";
      el.style.transition = "none";
      el.style.transform  = `translate3d(${rect.left}px,${rect.top}px,0)`;
      dragPos.current = { x: rect.left, y: rect.top };
    }
    drag.current = { sx: e.clientX, sy: e.clientY, moved: false };
    (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
  }

  function onBtnPointerMove(e: React.PointerEvent) {
    const d = drag.current;
    if (!d) return;
    if (Math.abs(e.clientX - d.sx) > 4 || Math.abs(e.clientY - d.sy) > 4) {
      d.moved = true;
    }
    if (d.moved) {
      const m = 8;
      const w = 180, h = 56;
      const x = Math.min(Math.max(e.clientX - w / 2, m), window.innerWidth - w - m);
      const y = Math.min(Math.max(e.clientY - h / 2, m), window.innerHeight - h - m);
      dragPos.current = { x, y };
      // translate3d: GPU-composited, sin layout reflow → 60fps fluido
      if (btnRef.current) {
        btnRef.current.style.transform = `translate3d(${x}px,${y}px,0)`;
      }
    }
  }

  function onBtnPointerUp() {
    const d = drag.current;
    drag.current = null;
    if (d && !d.moved) {
      // Click simple: restaurar estilos inline antes de cambiar estado
      const el = btnRef.current;
      if (el && !btnPos) {
        el.style.left = el.style.top = el.style.right = el.style.bottom = "";
        el.style.transform = el.style.transition = "";
      }
      dragPos.current = null;
      setChatState("options");
      setUnread(false);
    } else if (dragPos.current) {
      // Un solo setState al soltar: React renderiza con el mismo translate3d → sin salto visual
      setBtnPos(dragPos.current);
      dragPos.current = null;
    }
  }

  // ── Closed: floating button ──────────────────────────────────────
  if (chatState === "closed") {
    return (
      <button
        ref={btnRef}
        onPointerDown={onBtnPointerDown}
        onPointerMove={onBtnPointerMove}
        onPointerUp={onBtnPointerUp}
        style={
          btnPos
            ? { left: 0, top: 0, right: "auto", bottom: "auto", transform: `translate3d(${btnPos.x}px,${btnPos.y}px,0)`, touchAction: "none" }
            : { touchAction: "none" }
        }
        className={`fixed bottom-[5.5rem] right-5 z-50 flex cursor-grab items-center gap-2.5 rounded-full brand-gradient py-2.5 pl-2.5 pr-4 shadow-xl shadow-brand/40 transition-transform duration-500 ease-out hover:scale-105 active:cursor-grabbing ${
          !btnPos && lowerBtn ? "translate-y-12" : ""
        }`}
        aria-label="Soporte en línea 24/7 (arrastrable)"
      >
        <span className="relative flex h-9 w-9 items-center justify-center rounded-full bg-black/10">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
          >
            <path d="M4 14a8 8 0 0 1 16 0" />
            <rect x="2" y="14" width="4" height="6" rx="1.5" />
            <rect x="18" y="14" width="4" height="6" rx="1.5" />
            <path d="M20 18v1a3 3 0 0 1-3 3h-3" />
          </svg>
          <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-green-500" />
          {unread && (
            <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-red-500 text-[10px] font-bold text-white">
              1
            </span>
          )}
        </span>
        <span className="text-left leading-tight">
          <span className="block text-[10px] font-semibold uppercase tracking-wide opacity-70">
            Soporte
          </span>
          <span className="block text-sm font-extrabold">En línea 24/7</span>
        </span>
      </button>
    );
  }

  // ── Options menu ─────────────────────────────────────────────────
  if (chatState === "options") {
    return (
      <div className="fixed bottom-[5.5rem] right-5 z-50 w-72 rounded-2xl border border-border bg-surface p-4 shadow-2xl">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <p className="font-semibold">¿Cómo querés contactarnos?</p>
            <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
              En línea ahora · responde en ~1 min
            </p>
          </div>
          <button onClick={() => setChatState("closed")} className="ml-2 mt-0.5 text-muted hover:text-foreground">
            ✕
          </button>
        </div>
        <div className="flex flex-col gap-2">
          <button
            onClick={() => setChatState("chat")}
            className="flex items-center gap-3 rounded-xl border border-border bg-surface-2 p-3 text-left transition-colors hover:border-brand/50"
          >
            <span className="text-2xl">💬</span>
            <div>
              <p className="text-sm font-semibold">Chat en vivo</p>
              <p className="text-xs text-muted">Respondemos al instante</p>
            </div>
          </button>
          <a
            href={site.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-xl border border-border bg-surface-2 p-3 transition-colors hover:border-brand/50"
          >
            <span className="text-2xl">📸</span>
            <div>
              <p className="text-sm font-semibold">Instagram DM</p>
              <p className="text-xs text-muted">@{site.instagram.split("/").pop()}</p>
            </div>
          </a>
        </div>
      </div>
    );
  }

  // ── Chat window ──────────────────────────────────────────────────
  return (
    <div
      className="fixed bottom-5 right-5 z-50 flex flex-col rounded-2xl border border-border bg-surface shadow-2xl overflow-hidden"
      style={{
        width: "min(360px, 92vw)",
        maxHeight: minimized ? "none" : "min(520px, 80vh)",
      }}
    >
      {/* Header — siempre visible, clic en área vacía restaura si minimizado */}
      <div
        className={`flex shrink-0 items-center justify-between px-4 py-3 ${minimized ? "cursor-pointer" : ""}`}
        style={{ background: "linear-gradient(135deg,#0a0a0b,#1f2937)" }}
        onClick={minimized ? () => setMinimized(false) : undefined}
      >
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-white/30 text-sm font-bold text-white"
            style={{ backgroundColor: agent.color }}
          >
            {agent.name[0]}
          </div>
          <div>
            <p className="text-sm font-semibold text-white">{agent.name}</p>
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
              <p className="text-[11px] text-white/80">
                {isTyping ? "escribiendo…" : "En línea · responde en ~1 min"}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {/* Botón minimizar / restaurar */}
          <button
            onClick={(e) => { e.stopPropagation(); setMinimized((m) => !m); }}
            className="flex h-8 w-8 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white"
            aria-label={minimized ? "Expandir chat" : "Minimizar chat"}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="h-4 w-4">
              {minimized
                ? <path d="M18 15l-6-6-6 6" />   /* chevron up */
                : <path d="M6 9l6 6 6-6" />        /* chevron down */
              }
            </svg>
          </button>

          {/* Botón cerrar */}
          <button
            onClick={() => setChatState("options")}
            className="flex h-8 w-8 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Cerrar chat"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="h-4 w-4">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Cuerpo: oculto cuando minimizado */}
      {!minimized && (
        <>
          {/* Barra de seguridad */}
          <div className="flex shrink-0 items-center justify-center gap-1.5 border-b border-border bg-surface-2 px-4 py-1.5 text-[10px] text-muted">
            <span>🔒</span>
            <span>Chat seguro · Nunca te pedimos tu contraseña</span>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, idx) => (
              <div key={msg.id} className={`flex ${msg.from === "user" ? "justify-end" : "items-end gap-2"}`}>
                {msg.from === "agent" && (
                  <div
                    className="mb-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
                    style={{ backgroundColor: agent.color }}
                  >
                    {agent.name[0]}
                  </div>
                )}
                <div className="max-w-[75%]">
                  <div
                    className={`rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
                      msg.from === "user"
                        ? "rounded-br-none text-white"
                        : "rounded-bl-none bg-surface-2 text-foreground"
                    }`}
                    style={msg.from === "user" ? { background: "linear-gradient(135deg,#111827,#374151)" } : {}}
                  >
                    {msg.text}
                  </div>
                  <p className={`mt-1 flex items-center gap-1 text-[10px] text-muted ${msg.from === "user" ? "justify-end" : ""}`}>
                    {msg.time}
                    {msg.from === "user" &&
                      (() => {
                        const seen =
                          messages.slice(idx + 1).some((m) => m.from === "agent") ||
                          (isTyping && idx === messages.length - 1);
                        return (
                          <span className={seen ? "text-sky-500" : ""}>
                            {seen ? "· Visto ✓✓" : "· Enviado ✓"}
                          </span>
                        );
                      })()}
                  </p>
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex items-end gap-2">
                <div
                  className="mb-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
                  style={{ backgroundColor: agent.color }}
                >
                  {agent.name[0]}
                </div>
                <div className="rounded-2xl rounded-bl-none bg-surface-2 px-4 py-3">
                  <div className="flex gap-1">
                    {[0, 150, 300].map((d) => (
                      <span
                        key={d}
                        className="h-2 w-2 rounded-full bg-muted"
                        style={{ animation: `bounce 1s infinite ${d}ms` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Quick replies */}
            {showQuickReplies && (
              <div className="flex flex-wrap gap-2 pt-1">
                {QUICK_REPLIES.map((qr) => (
                  <button
                    key={qr}
                    onClick={() => handleQuick(qr)}
                    className="rounded-full border border-brand/40 bg-brand/10 px-3 py-1.5 text-xs font-medium text-accent transition-colors hover:bg-brand/20"
                  >
                    {qr}
                  </button>
                ))}
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="shrink-0 border-t border-border p-3">
            <div className="flex items-center gap-2 rounded-xl border border-border bg-surface-2 px-3 py-2 focus-within:border-brand transition-colors">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Escribí tu mensaje..."
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted"
                disabled={isTyping}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className="shrink-0 rounded-full p-1.5 text-white transition-opacity disabled:opacity-40"
                style={{ background: "linear-gradient(135deg,#111827,#374151)" }}
                aria-label="Enviar"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4">
                  <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                </svg>
              </button>
            </div>
            <p className="mt-1.5 text-center text-[10px] text-muted">
              🔒 Conversación protegida · Nunca pedimos tu contraseña
            </p>
          </div>
        </>
      )}
    </div>
  );
}
