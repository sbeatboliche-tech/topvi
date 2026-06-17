"use client";

import { useState } from "react";
import Link from "next/link";
import type { Lead } from "@/lib/leads";

type Filter = "all" | "lead" | "customer";

function fmtDate(iso?: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminLeads({ initialLeads }: { initialLeads: Lead[] }) {
  const [leads, setLeads] = useState(initialLeads);
  const [filter, setFilter] = useState<Filter>("all");
  const [sending, setSending] = useState<string | null>(null);

  const customers = leads.filter((l) => l.status === "customer").length;
  const onlyLeads = leads.length - customers;

  const filtered =
    filter === "all" ? leads : leads.filter((l) => l.status === filter);

  async function logout() {
    await fetch("/api/admin/login", { method: "DELETE" });
    window.location.reload();
  }

  function exportCsv() {
    const head = [
      "email",
      "estado",
      "servicio",
      "origen",
      "creado",
      "compró",
      "descuento_enviado",
    ];
    const rows = leads.map((l) => [
      l.email,
      l.status === "customer" ? "compró" : "no compró",
      l.service ?? "",
      l.source ?? "",
      l.createdAt,
      l.purchasedAt ?? "",
      l.discountSentAt ?? "",
    ]);
    const csv = [head, ...rows]
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leads-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function sendDiscount(email: string, locale?: string) {
    setSending(email);
    try {
      const res = await fetch("/api/admin/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, locale }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error ?? "No se pudo enviar.");
      } else {
        setLeads((arr) =>
          arr.map((l) =>
            l.email === email
              ? { ...l, discountSentAt: new Date().toISOString() }
              : l
          )
        );
      }
    } finally {
      setSending(null);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Leads</h1>
          <p className="text-sm text-muted">
            {leads.length} emails · {customers} compraron · {onlyLeads} no compraron
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin"
            className="rounded-full border border-border bg-surface px-4 py-2 text-sm hover:bg-surface-2"
          >
            Órdenes
          </Link>
          <button
            onClick={exportCsv}
            className="rounded-full border border-border bg-surface px-4 py-2 text-sm hover:bg-surface-2"
          >
            Exportar CSV
          </button>
          <button
            onClick={logout}
            className="rounded-full border border-border bg-surface px-4 py-2 text-sm hover:bg-surface-2"
          >
            Salir
          </button>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {(["all", "customer", "lead"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
              filter === f
                ? "brand-gradient"
                : "border border-border bg-surface hover:bg-surface-2"
            }`}
          >
            {f === "all" ? "Todos" : f === "customer" ? "Compraron" : "No compraron"}
          </button>
        ))}
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-surface text-left text-muted">
            <tr>
              <th className="p-3 font-medium">Email</th>
              <th className="p-3 font-medium">Estado</th>
              <th className="p-3 font-medium">Servicio</th>
              <th className="p-3 font-medium">Origen</th>
              <th className="p-3 font-medium">Creado</th>
              <th className="p-3 font-medium">Descuento</th>
              <th className="p-3 font-medium">Acción</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="p-8 text-center text-muted">
                  No hay leads para mostrar.
                </td>
              </tr>
            )}
            {filtered.map((l) => (
              <tr key={l.email} className="border-t border-border bg-background/40">
                <td className="p-3 font-medium">{l.email}</td>
                <td className="p-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      l.status === "customer"
                        ? "bg-success/15 text-success"
                        : "bg-warning/15 text-warning"
                    }`}
                  >
                    {l.status === "customer" ? "Compró" : "No compró"}
                  </span>
                </td>
                <td className="p-3 text-xs">{l.service ?? "—"}</td>
                <td className="p-3 text-xs">{l.source ?? "—"}</td>
                <td className="p-3 text-xs text-muted">{fmtDate(l.createdAt)}</td>
                <td className="p-3 text-xs text-muted">
                  {l.discountSentAt ? `enviado ${fmtDate(l.discountSentAt)}` : "—"}
                </td>
                <td className="p-3">
                  {l.status !== "customer" && (
                    <button
                      onClick={() => sendDiscount(l.email, l.locale)}
                      disabled={sending === l.email}
                      className="rounded-lg border border-border bg-surface-2 px-3 py-1 text-xs hover:border-brand/50 disabled:opacity-50"
                    >
                      {sending === l.email
                        ? "Enviando…"
                        : l.discountSentAt
                        ? "Reenviar descuento"
                        : "Enviar descuento"}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
