"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { STAGE_LABEL, STAGE_RANK } from "@/lib/visits";
import AdminVisitsStats from "./AdminVisitsStats";

type Visitor = {
  ip: string;
  stage: string;
  rank: number;
  hits: number;
  region?: string;
  firstAt: string;
  lastAt: string;
  timeOnPage?: number;
};

type DayFilter = "hoy" | "ayer" | "todos";

const STAGES = Object.keys(STAGE_RANK);
const stageColor = (rank: number) =>
  rank >= 5 ? "bg-success/15 text-success"
  : rank >= 4 ? "bg-accent/15 text-accent"
  : rank >= 3 ? "bg-brand/15 text-brand-2"
  : "bg-warning/15 text-warning";

function hhmm(iso: string) {
  return new Date(iso).toLocaleString("es-AR", {
    day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit",
  });
}
function formatTime(s?: number) {
  if (!s || s < 2) return "—";
  if (s < 60) return `${s}s`;
  return `${Math.floor(s / 60)}m ${s % 60}s`;
}

export default function AdminVisits() {
  const [rows, setRows] = useState<Visitor[]>([]);
  const [dayFilter, setDayFilter] = useState<DayFilter>("hoy");

  useEffect(() => {
    const load = () =>
      fetch("/api/admin/visits")
        .then((r) => r.json())
        .then((d) => setRows(d.visitors ?? []));
    load();
    const i = setInterval(load, 10000);
    return () => clearInterval(i);
  }, []);

  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

  const filtered = rows.filter((r) => {
    if (dayFilter === "hoy") return r.lastAt.slice(0, 10) === today;
    if (dayFilter === "ayer") return r.lastAt.slice(0, 10) === yesterday;
    return true;
  });

  const funnel = STAGES.map((s) => ({
    stage: s,
    label: STAGE_LABEL[s],
    count: filtered.filter((r) => r.rank >= STAGE_RANK[s]).length,
  }));
  const maxCount = Math.max(...funnel.map((f) => f.count), 1);

  const tabs: { key: DayFilter; label: string }[] = [
    { key: "hoy", label: "Hoy" },
    { key: "ayer", label: "Ayer" },
    { key: "todos", label: "Todos" },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Visitas / Embudo</h1>
          <p className="text-sm text-muted">{rows.length} IPs únicas registradas</p>
        </div>
        <Link href="/admin" className="rounded-full border border-border bg-surface px-4 py-2 text-sm hover:bg-surface-2">
          ← Órdenes
        </Link>
      </div>

      {/* Historial de estadísticas */}
      <AdminVisitsStats />

      {/* Tabs de filtro de día */}
      <div className="mt-6 flex items-center gap-2">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setDayFilter(t.key)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
              dayFilter === t.key
                ? "brand-gradient text-white"
                : "border border-border bg-surface hover:bg-surface-2"
            }`}
          >
            {t.label}
            {t.key !== "todos" && (
              <span className="ml-1.5 text-xs opacity-70">
                {t.key === "hoy"
                  ? rows.filter((r) => r.lastAt.slice(0, 10) === today).length
                  : rows.filter((r) => r.lastAt.slice(0, 10) === yesterday).length}
              </span>
            )}
          </button>
        ))}
        {dayFilter !== "todos" && (
          <span className="ml-2 text-xs text-muted">
            {filtered.length} IP{filtered.length !== 1 ? "s" : ""} activa{filtered.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Embudo del período seleccionado */}
      <div className="mt-3 space-y-2 rounded-2xl border border-border bg-surface p-5">
        <h2 className="mb-2 text-sm font-semibold">
          Embudo — {dayFilter === "hoy" ? "hoy" : dayFilter === "ayer" ? "ayer" : "todas las visitas"}
        </h2>
        {funnel.map((f) => (
          <div key={f.stage} className="flex items-center gap-3 text-sm">
            <span className="w-40 shrink-0 text-muted">{f.label}</span>
            <div className="h-5 flex-1 overflow-hidden rounded-full bg-surface-2">
              <div
                className="brand-gradient h-full rounded-full"
                style={{ width: `${Math.max(f.count > 0 ? 4 : 0, (f.count / maxCount) * 100)}%` }}
              />
            </div>
            <span className="w-10 text-right font-semibold">{f.count}</span>
          </div>
        ))}
      </div>

      {/* Tabla de IPs */}
      <div className="mt-4 overflow-x-auto rounded-2xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-surface text-left text-muted">
            <tr>
              <th className="p-3 font-medium">IP</th>
              <th className="p-3 font-medium">Provincia / Ciudad</th>
              <th className="p-3 font-medium">Se quedó en</th>
              <th className="p-3 font-medium">Tiempo</th>
              <th className="p-3 font-medium">Visitas</th>
              <th className="p-3 font-medium">Última vez</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-muted">
                  {dayFilter === "hoy" ? "Nadie visitó el sitio hoy todavía."
                   : dayFilter === "ayer" ? "No hay visitas registradas para ayer."
                   : "Todavía no hay visitas registradas."}
                </td>
              </tr>
            )}
            {filtered.map((r) => (
              <tr key={r.ip} className="border-t border-border bg-background/40">
                <td className="p-3 font-mono text-xs">{r.ip}</td>
                <td className="p-3 text-xs">{r.region ?? "—"}</td>
                <td className="p-3">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${stageColor(r.rank)}`}>
                    {STAGE_LABEL[r.stage] ?? r.stage}
                  </span>
                </td>
                <td className="p-3 text-xs font-mono">{formatTime(r.timeOnPage)}</td>
                <td className="p-3">{r.hits}</td>
                <td className="p-3 text-xs text-muted">{hhmm(r.lastAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
