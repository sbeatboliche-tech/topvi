"use client";

import { useEffect, useState } from "react";

// Botón "Comprobar" que consulta si una cuenta de Instagram es pública o
// privada (best-effort). Nunca bloquea la compra: si no se puede verificar,
// lo dice y listo.

type Status = "idle" | "loading" | "public" | "private" | "not_found" | "unknown";

export default function AccountCheck({ username }: { username: string }) {
  const [status, setStatus] = useState<Status>("idle");
  const clean = username.trim().replace(/^@/, "");

  // Si cambian el usuario después de comprobar, reseteamos el resultado.
  useEffect(() => {
    setStatus("idle");
  }, [clean]);

  async function check() {
    if (!clean) return;
    setStatus("loading");
    try {
      const res = await fetch(`/api/instagram/check?u=${encodeURIComponent(clean)}`);
      const data = await res.json();
      setStatus(data.status ?? "unknown");
    } catch {
      setStatus("unknown");
    }
  }

  const msg: Record<Exclude<Status, "idle" | "loading">, { text: string; cls: string }> = {
    public: { text: "✓ Cuenta pública, todo listo", cls: "text-success" },
    private: { text: "🔒 Está privada — ponela en pública para recibir", cls: "text-warning" },
    not_found: { text: `⚠️ No encontramos @${clean}`, cls: "text-warning" },
    unknown: { text: "No pudimos verificar (podés comprar igual)", cls: "text-muted" },
  };

  return (
    <div className="mt-1.5 flex items-center gap-2">
      <button
        type="button"
        onClick={check}
        disabled={!clean || status === "loading"}
        className="rounded-full border border-border px-3 py-1 text-xs font-medium text-muted transition-colors hover:bg-surface-2 disabled:opacity-50"
      >
        {status === "loading" ? "Comprobando…" : "Comprobar si es pública"}
      </button>
      {status !== "idle" && status !== "loading" && (
        <span className={`text-xs font-medium ${msg[status].cls}`}>
          {msg[status].text}
        </span>
      )}
    </div>
  );
}
