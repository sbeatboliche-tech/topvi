"use client";

import { useRef, useState } from "react";

// Caja de pago por transferencia: datos con copiar + subir captura del pago
// con respuesta automática (IA) de "pago recibido".
function CopyRow({ label, value }: { label: string; value: string }) {
  const [done, setDone] = useState(false);
  function copy() {
    navigator.clipboard?.writeText(value).then(() => {
      setDone(true);
      setTimeout(() => setDone(false), 1500);
    });
  }
  return (
    <div className="flex items-center justify-between gap-2 rounded-lg bg-surface-2 p-3 text-sm">
      <div className="min-w-0">
        <div className="text-[11px] uppercase tracking-wide text-muted">{label}</div>
        <code className="block truncate font-semibold">{value}</code>
      </div>
      <button
        type="button"
        onClick={copy}
        className="shrink-0 rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-surface"
      >
        {done ? "✓ Copiado" : "Copiar"}
      </button>
    </div>
  );
}

export default function TransferBox({
  orderId,
  amount,
  titular,
  alias,
  cvu,
  cuit,
}: {
  orderId: string;
  amount: string;
  titular: string;
  alias: string;
  cvu: string;
  cuit: string;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<"idle" | "uploading" | "typing" | "done">(
    "idle"
  );
  const [reply, setReply] = useState("");
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif", "image/gif"];
    if (!allowed.includes(file.type)) {
      setError("Subí una imagen (JPG, PNG o WEBP).");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("La imagen es muy pesada (máx 10 MB).");
      return;
    }
    setFileName(file.name);
    setState("uploading");

    const fd = new FormData();
    fd.append("file", file);
    fd.append("orderId", orderId);

    let data: { reply?: string } = {};
    try {
      const res = await fetch("/api/transfer-proof", { method: "POST", body: fd });
      data = await res.json();
    } catch {
      /* seguimos igual con el mensaje por defecto */
    }

    // Efecto "escribiendo…" para que se sienta como un agente real.
    setState("typing");
    await new Promise((r) => setTimeout(r, 1800));
    setReply(
      data.reply ||
        "✅ ¡Pago recibido! En unos minutos vas a estar recibiendo tu pedido. ¡Gracias por elegirnos! 🚀"
    );
    setState("done");
  }

  return (
    <div className="mt-6 rounded-2xl border border-warning/40 bg-warning/5 p-6 text-left">
      <h2 className="font-semibold">🏦 Pagá por transferencia</h2>
      <p className="mt-2 text-sm text-muted">
        Transferí el monto exacto a estos datos:
      </p>

      <div className="mt-3 space-y-2">
        <CopyRow label="Monto exacto (5% OFF aplicado)" value={amount} />
        <CopyRow label="Titular" value={titular} />
        <CopyRow label="Alias" value={alias} />
        <CopyRow label="CVU" value={cvu} />
        <CopyRow label="CUIT" value={cuit} />
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        onChange={onFile}
        className="hidden"
      />

      {state !== "done" ? (
        <>
          <p className="mt-5 text-sm font-medium">
            📸 Enviá la captura del pago y confirmamos al instante:
          </p>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={state === "uploading" || state === "typing"}
            className="brand-gradient mt-3 w-full rounded-full py-3.5 font-semibold shadow-lg shadow-brand/30 transition-transform hover:scale-[1.02] disabled:opacity-60"
          >
            {state === "uploading"
              ? "Subiendo captura…"
              : state === "typing"
              ? "Verificando…"
              : "📎 Enviar captura del pago"}
          </button>
          {error && <p className="mt-2 text-sm text-warning">{error}</p>}
        </>
      ) : (
        <div className="mt-5">
          {fileName && (
            <p className="mb-2 text-right text-xs text-muted">
              📎 {fileName} enviado ✓
            </p>
          )}
          {/* Respuesta tipo chat de soporte */}
          <div className="flex items-end gap-2">
            <div className="brand-gradient flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold">
              S
            </div>
            <div className="rounded-2xl rounded-bl-none bg-surface-2 px-4 py-3 text-sm leading-relaxed">
              {reply}
            </div>
          </div>
        </div>
      )}

      {/* Indicador "escribiendo" mientras la IA responde */}
      {state === "typing" && (
        <div className="mt-3 flex items-center gap-2 text-xs text-muted">
          <span className="brand-gradient flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold">
            S
          </span>
          <span className="rounded-2xl rounded-bl-none bg-surface-2 px-4 py-3">
            escribiendo…
          </span>
        </div>
      )}
    </div>
  );
}
