"use client";

import { useState } from "react";
import type { Order, OrderStatus } from "@/lib/db";
import { formatARS, formatNumber, getService, getPack } from "@/lib/config";
import { localeConfig, displayPrice, isLocale } from "@/lib/i18n";

const statusLabels: Record<OrderStatus, string> = {
  pending_payment: "Esperando pago",
  paid: "Pagado",
  delivering: "Entregando",
  delivered: "Entregado",
  cancelled: "Cancelado",
};

const statusColors: Record<OrderStatus, string> = {
  pending_payment: "bg-warning/15 text-warning",
  paid: "bg-accent/15 text-accent",
  delivering: "bg-brand/15 text-brand-2",
  delivered: "bg-success/15 text-success",
  cancelled: "bg-muted/15 text-muted",
};

export default function AdminTable({
  initialOrders,
}: {
  initialOrders: Order[];
}) {
  const [orders, setOrders] = useState(initialOrders);
  const [filter, setFilter] = useState<OrderStatus | "all">("all");

  async function setStatus(id: string, status: OrderStatus) {
    setOrders((o) => o.map((x) => (x.id === id ? { ...x, status } : x)));
    await fetch("/api/admin/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
  }

  async function logout() {
    await fetch("/api/admin/login", { method: "DELETE" });
    window.location.reload();
  }

  const filtered =
    filter === "all" ? orders : orders.filter((o) => o.status === filter);

  const revenue = orders
    .filter((o) => o.status !== "pending_payment" && o.status !== "cancelled")
    .reduce((s, o) => s + o.amount, 0);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Órdenes</h1>
          <p className="text-sm text-muted">
            {orders.length} órdenes · {formatARS(revenue)} facturado (base ARS)
          </p>
        </div>
        <div className="flex gap-2">
          <a
            href="/admin/leads"
            className="rounded-full border border-border bg-surface px-4 py-2 text-sm hover:bg-surface-2"
          >
            Leads
          </a>
          <button
            onClick={logout}
            className="rounded-full border border-border bg-surface px-4 py-2 text-sm hover:bg-surface-2"
          >
            Salir
          </button>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {(["all", "paid", "pending_payment", "delivering", "delivered"] as const).map(
          (f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
                filter === f
                  ? "brand-gradient text-white"
                  : "border border-border bg-surface hover:bg-surface-2"
              }`}
            >
              {f === "all" ? "Todas" : statusLabels[f]}
            </button>
          )
        )}
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-surface text-left text-muted">
            <tr>
              <th className="p-3 font-medium">Orden</th>
              <th className="p-3 font-medium">Servicio</th>
              <th className="p-3 font-medium">Cuenta / Link</th>
              <th className="p-3 font-medium">Paquete</th>
              <th className="p-3 font-medium">Monto</th>
              <th className="p-3 font-medium">Pago</th>
              <th className="p-3 font-medium">Contacto</th>
              <th className="p-3 font-medium">Estado</th>
              <th className="p-3 font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={9} className="p-8 text-center text-muted">
                  No hay órdenes para mostrar.
                </td>
              </tr>
            )}
            {filtered.map((o) => (
              <tr key={o.id} className="border-t border-border bg-background/40">
                <td className="p-3 font-mono text-xs">{o.id}</td>
                <td className="p-3 text-xs">
                  {getService(o.service)?.title ?? getPack(o.service)?.name ?? o.service}
                </td>
                <td className="p-3">
                  {(() => {
                    const isUrl = o.username.startsWith("http");
                    const platform = getService(o.service)?.platform;
                    const href = isUrl
                      ? o.username
                      : platform === "tiktok"
                      ? `https://tiktok.com/@${o.username}`
                      : `https://instagram.com/${o.username}`;
                    return (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-accent hover:underline"
                      >
                        {isUrl ? "ver posteo ↗" : `@${o.username}`}
                      </a>
                    );
                  })()}
                  {o.notes && (
                    <details className="mt-1">
                      <summary className="cursor-pointer text-xs text-muted">
                        ver desglose
                      </summary>
                      <pre className="mt-1 whitespace-pre-wrap break-all text-[11px] text-muted">
                        {o.notes}
                      </pre>
                    </details>
                  )}
                </td>
                <td className="p-3">
                  {formatNumber(o.totalFollowers)}{" "}
                  <span className="text-muted">({o.quality})</span>
                </td>
                <td className="p-3 font-medium">
                  {isLocale(o.locale) && (
                    <span className="mr-1">{localeConfig[o.locale].flag}</span>
                  )}
                  {isLocale(o.locale)
                    ? displayPrice(o.amount, o.locale)
                    : formatARS(o.amount)}
                </td>
                <td className="p-3 uppercase text-xs">{o.payment}</td>
                <td className="p-3 text-xs">{o.contact}</td>
                <td className="p-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusColors[o.status]}`}
                  >
                    {statusLabels[o.status]}
                  </span>
                </td>
                <td className="p-3">
                  <select
                    value={o.status}
                    onChange={(e) =>
                      setStatus(o.id, e.target.value as OrderStatus)
                    }
                    className="rounded-lg border border-border bg-surface-2 px-2 py-1 text-xs outline-none"
                  >
                    {Object.entries(statusLabels).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
