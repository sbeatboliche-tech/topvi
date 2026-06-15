"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

interface OrderRow {
  id: string;
  service: string;
  username: string;
  quantity: number;
  statusRaw: string;
  status: string;
  payment: string;
  createdAt: string;
}

const STATUS_COLOR: Record<string, string> = {
  pending_payment: "text-warning",
  paid: "text-accent",
  delivering: "text-accent",
  delivered: "text-success",
  cancelled: "text-muted",
};

const PAYMENT_LABEL: Record<string, string> = {
  mercadopago: "MercadoPago",
  tarjeta: "Tarjeta",
  usdt: "USDT",
};

export default function MisPedidosPage() {
  const { locale } = useParams<{ locale: string }>();
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<"id" | "contact">("id");
  const [results, setResults] = useState<OrderRow[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    setLoading(true);
    setError("");
    setResults(null);

    try {
      const param = mode === "id" ? `id=${encodeURIComponent(q)}` : `contact=${encodeURIComponent(q)}`;
      const res = await fetch(`/api/orders/lookup?${param}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "No encontramos pedidos con esos datos.");
      } else {
        setResults(data.orders ?? []);
        if ((data.orders ?? []).length === 0) {
          setError("No encontramos pedidos con esos datos. Verificá que el número o contacto sean correctos.");
        }
      }
    } catch {
      setError("Error de conexión. Intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold">📦 Mis pedidos</h1>
        <p className="mt-2 text-muted">Buscá por número de orden o por el email que usaste al comprar.</p>
      </div>

      {/* Mode toggle */}
      <div className="mb-4 flex rounded-xl border border-border overflow-hidden">
        <button
          type="button"
          onClick={() => { setMode("id"); setResults(null); setError(""); }}
          className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
            mode === "id" ? "brand-gradient text-white" : "bg-surface text-muted hover:text-foreground"
          }`}
        >
          Número de orden
        </button>
        <button
          type="button"
          onClick={() => { setMode("contact"); setResults(null); setError(""); }}
          className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
            mode === "contact" ? "brand-gradient text-white" : "bg-surface text-muted hover:text-foreground"
          }`}
        >
          Email
        </button>
      </div>

      <form onSubmit={handleSearch} className="flex gap-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={mode === "id" ? "ORD-XXXXXXXXX" : "tu@email.com o +54 9 ..."}
          className="flex-1 rounded-xl border border-border bg-surface px-4 py-3 text-sm outline-none focus:border-brand"
          autoCapitalize="none"
          autoCorrect="off"
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="brand-gradient rounded-xl px-5 py-3 font-semibold text-white disabled:opacity-50"
        >
          {loading ? "..." : "Buscar"}
        </button>
      </form>

      {error && (
        <p className="mt-4 rounded-xl border border-warning/30 bg-warning/5 px-4 py-3 text-sm text-warning">
          {error}
        </p>
      )}

      {results && results.length > 0 && (
        <div className="mt-6 flex flex-col gap-4">
          {results.map((order) => (
            <div key={order.id} className="rounded-2xl border border-border bg-surface p-5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs text-muted">{order.id}</p>
                  <p className="mt-0.5 font-semibold">{order.service}</p>
                  <p className="mt-0.5 text-sm text-muted">
                    @{order.username} · {order.quantity.toLocaleString("es-AR")} unidades
                  </p>
                </div>
                <span className={`text-sm font-semibold whitespace-nowrap ${STATUS_COLOR[order.statusRaw] ?? "text-muted"}`}>
                  {order.status}
                </span>
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                <span className="text-xs text-muted">
                  {PAYMENT_LABEL[order.payment] ?? order.payment} ·{" "}
                  {new Date(order.createdAt).toLocaleDateString("es-AR")}
                </span>
                <Link
                  href={`/${locale}/gracias?order=${order.id}&method=${order.payment}`}
                  className="text-xs font-medium text-accent hover:underline"
                >
                  Ver detalle →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="mt-8 text-center text-xs text-muted">
        ¿Necesitás ayuda?{" "}
        <button
          type="button"
          className="text-accent hover:underline"
          onClick={() => {
            // Trigger chat widget if available
            const ev = new CustomEvent("open-support-chat");
            window.dispatchEvent(ev);
          }}
        >
          Chateá con soporte
        </button>
      </p>
    </div>
  );
}
