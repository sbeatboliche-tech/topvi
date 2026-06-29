"use client";

import { useEffect, useState } from "react";

type DayStat = { day: string; unique: number };
type Range = "hoy" | "ayer" | 30 | 90 | 365;

function fmtDay(d: string) {
  return new Date(d + "T12:00:00").toLocaleDateString("es-AR", {
    day: "2-digit", month: "2-digit",
  });
}
function fmtMonth(d: string) {
  return new Date(d + "T12:00:00").toLocaleDateString("es-AR", {
    month: "long", year: "numeric",
  });
}

const rangeLabel: Record<string, string> = {
  hoy: "Hoy", ayer: "Ayer", "30": "30 días", "90": "90 días", "365": "1 año",
};

export default function AdminVisitsStats() {
  const [open, setOpen] = useState(true);
  const [range, setRange] = useState<Range>(30);
  const [stats, setStats] = useState<DayStat[]>([]);
  const [loading, setLoading] = useState(false);

  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

  const fetchDays = range === "hoy" || range === "ayer" ? 2 : (range as number);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    fetch(`/api/admin/visits/stats?days=${fetchDays}`)
      .then((r) => r.json())
      .then((d) => setStats(d.stats ?? []))
      .finally(() => setLoading(false));
  }, [open, fetchDays]);

  // Para Hoy/Ayer: mostrar solo ese día
  const displayStats =
    range === "hoy" ? stats.filter((s) => s.day === today)
    : range === "ayer" ? stats.filter((s) => s.day === yesterday)
    : stats;

  const byMonth = new Map<string, number>();
  for (const s of displayStats) {
    const month = s.day.slice(0, 7);
    byMonth.set(month, (byMonth.get(month) ?? 0) + s.unique);
  }
  const months = [...byMonth.entries()].sort((a, b) => b[0].localeCompare(a[0]));
  const maxDay = Math.max(...displayStats.map((s) => s.unique), 1);
  const totalPeriod = displayStats.reduce((a, s) => a + s.unique, 0);

  const todayCount = stats.find((s) => s.day === today)?.unique ?? 0;
  const yesterdayCount = stats.find((s) => s.day === yesterday)?.unique ?? 0;
  const thisMonth = today.slice(0, 7);
  const monthCount = (() => {
    const m = new Map<string, number>();
    for (const s of stats) m.set(s.day.slice(0, 7), (m.get(s.day.slice(0, 7)) ?? 0) + s.unique);
    return m.get(thisMonth) ?? 0;
  })();

  const ranges: Range[] = ["hoy", "ayer", 30, 90, 365];

  return (
    <div className="mt-4">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium hover:bg-surface-2"
      >
        📊 {open ? "Ocultar historial" : "Ver historial de estadísticas"}
      </button>

      {open && (
        <div className="mt-4 rounded-2xl border border-border bg-surface p-5">
          {/* Header + range selector */}
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold">Historial de visitas únicas</h2>
              <p className="text-xs text-muted">Visitantes nuevos por día (primera visita registrada)</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {ranges.map((r) => (
                <button
                  key={String(r)}
                  type="button"
                  onClick={() => setRange(r)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                    range === r
                      ? "brand-gradient text-white"
                      : "border border-border bg-surface-2 hover:bg-surface"
                  }`}
                >
                  {rangeLabel[String(r)]}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <p className="py-8 text-center text-sm text-muted">Cargando…</p>
          ) : (
            <>
              {/* KPIs siempre visibles */}
              <div className="mb-4 grid grid-cols-3 gap-3">
                {[
                  { label: "Hoy", value: todayCount },
                  { label: "Ayer", value: yesterdayCount },
                  { label: "Este mes", value: monthCount },
                ].map((k) => (
                  <div key={k.label} className="rounded-xl border border-border bg-surface-2 p-3 text-center">
                    <div className="text-[11px] text-muted">{k.label}</div>
                    <div className="mt-0.5 text-2xl font-extrabold">{k.value.toLocaleString("es-AR")}</div>
                  </div>
                ))}
              </div>

              {displayStats.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted">
                  Sin datos para {rangeLabel[String(range)].toLowerCase()}.
                </p>
              ) : (
                <>
                  {/* Vista single-day: solo el número grande */}
                  {(range === "hoy" || range === "ayer") ? (
                    <div className="flex flex-col items-center py-4">
                      <div className="text-5xl font-extrabold">{totalPeriod.toLocaleString("es-AR")}</div>
                      <div className="mt-1 text-sm text-muted">
                        visitas únicas {range === "hoy" ? "hoy" : "ayer"} ({fmtDay(displayStats[0]?.day ?? today)})
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Barra de total del período */}
                      <div className="mb-3 text-xs text-muted">
                        Total período: <strong className="text-foreground">{totalPeriod.toLocaleString("es-AR")}</strong> visitas únicas
                      </div>

                      {/* Gráfico de barras diario */}
                      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Por día</h3>
                      <div className="flex items-end gap-0.5 overflow-x-auto pb-2" style={{ minHeight: 80 }}>
                        {displayStats.map((s) => {
                          const pct = Math.max(4, (s.unique / maxDay) * 100);
                          const isToday = s.day === today;
                          return (
                            <div
                              key={s.day}
                              className="group relative flex flex-col items-center"
                              style={{ minWidth: range === 365 ? 4 : range === 90 ? 7 : 14 }}
                            >
                              <div
                                className={`w-full rounded-t transition-all ${isToday ? "bg-brand-2" : "brand-gradient opacity-80"}`}
                                style={{ height: `${pct}%`, minHeight: 4 }}
                              />
                              <div className="pointer-events-none absolute bottom-full mb-1 hidden whitespace-nowrap rounded-lg border border-border bg-surface px-2 py-1 text-[10px] shadow-lg group-hover:block z-10">
                                {fmtDay(s.day)}: <strong>{s.unique}</strong>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <div className="mt-1 flex justify-between text-[10px] text-muted">
                        <span>{fmtDay(displayStats[0].day)}</span>
                        <span>{fmtDay(displayStats[displayStats.length - 1].day)}</span>
                      </div>

                      {/* Por mes */}
                      {months.length > 0 && (
                        <>
                          <h3 className="mb-2 mt-5 text-xs font-semibold uppercase tracking-wide text-muted">Por mes</h3>
                          <div className="space-y-1.5">
                            {months.map(([month, count]) => {
                              const maxM = Math.max(...months.map((m) => m[1]), 1);
                              return (
                                <div key={month} className="flex items-center gap-3 text-sm">
                                  <span className="w-28 shrink-0 text-xs capitalize text-muted">
                                    {fmtMonth(month + "-01")}
                                  </span>
                                  <div className="h-4 flex-1 overflow-hidden rounded-full bg-surface-2">
                                    <div
                                      className="brand-gradient h-full rounded-full"
                                      style={{ width: `${Math.max(4, (count / maxM) * 100)}%` }}
                                    />
                                  </div>
                                  <span className="w-10 text-right text-xs font-semibold">{count.toLocaleString("es-AR")}</span>
                                </div>
                              );
                            })}
                          </div>
                        </>
                      )}
                    </>
                  )}
                </>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
