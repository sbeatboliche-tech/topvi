"use client";

import { useState } from "react";

// Caja de pago por transferencia: datos con botón de copiar + aviso "Ya transferí".
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
  mailto,
}: {
  orderId: string;
  amount: string;
  titular: string;
  alias: string;
  cvu: string;
  cuit: string;
  mailto: string;
}) {
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");

  async function avisar() {
    setState("sending");
    try {
      await fetch("/api/orders/transferred", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: orderId }),
      });
    } catch {
      /* no rompemos el flujo */
    }
    setState("sent");
  }

  return (
    <div className="mt-6 rounded-2xl border border-warning/40 bg-warning/5 p-6 text-left">
      <h2 className="font-semibold">🏦 Pagá por transferencia</h2>
      <p className="mt-2 text-sm text-muted">
        Transferí el monto exacto a estos datos. Es lo que más rápido nos permite
        identificar tu pago:
      </p>

      <div className="mt-3 space-y-2">
        <CopyRow label="Monto exacto (5% OFF aplicado)" value={amount} />
        <CopyRow label="Titular" value={titular} />
        <CopyRow label="Alias" value={alias} />
        <CopyRow label="CVU" value={cvu} />
        <CopyRow label="CUIT" value={cuit} />
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        {state === "sent" ? (
          <span className="inline-flex items-center gap-2 rounded-full bg-success/15 px-5 py-3 text-sm font-semibold text-success">
            ✓ ¡Aviso recibido! Verificamos y arrancamos la entrega.
          </span>
        ) : (
          <button
            type="button"
            onClick={avisar}
            disabled={state === "sending"}
            className="brand-gradient rounded-full px-6 py-3 font-semibold shadow-lg shadow-brand/30 disabled:opacity-60"
          >
            {state === "sending" ? "Enviando…" : "✅ Ya transferí"}
          </button>
        )}
        <a
          href={mailto}
          className="rounded-full border border-border bg-surface px-6 py-3 font-semibold hover:bg-surface-2"
        >
          Enviar comprobante
        </a>
      </div>
    </div>
  );
}
