"use client";

import { useState, useEffect } from "react";

const DEVICE_TOKEN_KEY = "tvm_device_token";

function getOrCreateDeviceToken(): string {
  try {
    let token = localStorage.getItem(DEVICE_TOKEN_KEY);
    if (!token) {
      token = crypto.randomUUID();
      localStorage.setItem(DEVICE_TOKEN_KEY, token);
    }
    return token;
  } catch {
    return "unknown";
  }
}

type State = "idle" | "form" | "loading" | "success" | "used" | "error";

export default function TrialBanner() {
  const [state, setState] = useState<State>("idle");
  const [postUrl, setPostUrl] = useState("");
  const [contact, setContact] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Check if already claimed (quick localStorage check for UX only)
  useEffect(() => {
    try {
      if (localStorage.getItem("tvm_trial_claimed")) setState("used");
    } catch { /* noop */ }
  }, []);

  async function handleClaim(e: React.FormEvent) {
    e.preventDefault();
    if (!postUrl.trim()) {
      setErrorMsg("Ingresá el link de tu publicación de Instagram.");
      return;
    }
    setState("loading");
    setErrorMsg("");

    try {
      const deviceToken = getOrCreateDeviceToken();
      const res = await fetch("/api/trial/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postUrl: postUrl.trim(), contact: contact.trim(), deviceToken }),
      });
      const data = await res.json();

      if (res.status === 409) {
        setState("used");
        return;
      }
      if (!res.ok) {
        setErrorMsg(data.error ?? "Error al reclamar la prueba. Intentá de nuevo.");
        setState("form");
        return;
      }

      localStorage.setItem("tvm_trial_claimed", "1");
      setState("success");
    } catch {
      setErrorMsg("Error de conexión. Intentá de nuevo.");
      setState("form");
    }
  }

  if (state === "used") return null;

  if (state === "success") {
    return (
      <div className="mb-6 rounded-2xl border border-success/30 bg-success/5 p-5 text-center">
        <p className="text-2xl">🎉</p>
        <p className="mt-2 font-semibold text-success">¡Prueba reclamada!</p>
        <p className="mt-1 text-sm text-muted">
          Tus 10 likes están en camino. Llegan entre 10 minutos y 1 hora.
        </p>
      </div>
    );
  }

  if (state === "form" || state === "loading") {
    return (
      <div className="mb-6 rounded-2xl border border-brand/30 bg-brand/5 p-5">
        <p className="mb-3 font-semibold">🎁 Probá 10 likes gratis</p>
        <form onSubmit={handleClaim} className="space-y-3">
          <div>
            <label className="mb-1 block text-xs text-muted">Link de tu publicación de Instagram</label>
            <input
              value={postUrl}
              onChange={(e) => setPostUrl(e.target.value)}
              placeholder="https://www.instagram.com/p/..."
              className="w-full rounded-xl border border-border bg-surface-2 px-3 py-2.5 text-sm outline-none focus:border-brand"
              autoCapitalize="none"
              autoCorrect="off"
              disabled={state === "loading"}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted">Email (para avisarte)</label>
            <input
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="tu@email.com o +54 9..."
              className="w-full rounded-xl border border-border bg-surface-2 px-3 py-2.5 text-sm outline-none focus:border-brand"
              disabled={state === "loading"}
            />
          </div>
          {errorMsg && (
            <p className="text-xs text-warning">{errorMsg}</p>
          )}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={state === "loading"}
              className="brand-gradient flex-1 rounded-full py-2.5 text-sm font-semibold text-white disabled:opacity-60"
            >
              {state === "loading" ? "Enviando..." : "Reclamar prueba gratuita"}
            </button>
            <button
              type="button"
              onClick={() => setState("idle")}
              className="rounded-full border border-border px-4 py-2.5 text-sm text-muted hover:bg-surface-2"
            >
              Cancelar
            </button>
          </div>
          <p className="text-center text-[11px] text-muted">
            Una vez por IP · Requiere publicación pública
          </p>
        </form>
      </div>
    );
  }

  // idle state: show teaser button
  return (
    <div className="mb-6 flex items-center justify-between gap-4 rounded-2xl border border-dashed border-brand/40 bg-brand/5 p-4">
      <div>
        <p className="text-sm font-semibold">🎁 Prueba gratuita disponible</p>
        <p className="mt-0.5 text-xs text-muted">10 likes gratis · Sin tarjeta · Una sola vez</p>
      </div>
      <button
        onClick={() => setState("form")}
        className="shrink-0 rounded-full border border-brand/50 px-4 py-2 text-xs font-semibold text-accent hover:bg-brand/10 transition-colors"
      >
        Probar gratis
      </button>
    </div>
  );
}
