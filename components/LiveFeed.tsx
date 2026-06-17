"use client";

import { useEffect, useState } from "react";

interface Props {
  bought: string; // "compró"
  agoText: string; // "hace {n} min"
  names: string[];
  cities: string[];
  services: string[];
}

interface Notice {
  name: string;
  city: string;
  service: string;
  ago: number; // minutos
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Toast flotante que simula compras recientes (prueba social).
export default function LiveFeed({ bought, agoText, names, cities, services }: Props) {
  const [notice, setNotice] = useState<Notice | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let hideTimer: ReturnType<typeof setTimeout>;

    const show = () => {
      setNotice({
        name: pick(names),
        city: pick(cities),
        service: pick(services),
        ago: 2 + Math.floor(Math.random() * 28),
      });
      setVisible(true);
      hideTimer = setTimeout(() => setVisible(false), 6000);
    };

    const first = setTimeout(show, 4000);
    const loop = setInterval(show, 16000);
    return () => {
      clearTimeout(first);
      clearInterval(loop);
      clearTimeout(hideTimer);
    };
  }, [names, cities, services]);

  if (!notice) return null;

  return (
    <div
      className={`fixed bottom-40 left-4 z-40 flex max-w-[280px] items-center gap-3 rounded-2xl border border-border bg-surface/95 p-3 shadow-xl shadow-black/40 backdrop-blur transition-all duration-500 md:bottom-5 md:left-5 ${
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
      }`}
    >
      <div className="brand-gradient flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white">
        {notice.name[0]}
      </div>
      <div className="text-xs leading-snug">
        <p className="font-semibold text-foreground">
          {notice.name} · {notice.city}
        </p>
        <p className="text-muted">
          {bought} <span className="font-medium text-foreground">{notice.service}</span>
        </p>
        <p className="mt-0.5 flex items-center gap-1 text-[10px] text-muted">
          <span className="h-1.5 w-1.5 rounded-full bg-success" />
          {agoText.replace("{n}", String(notice.ago))}
        </p>
      </div>
    </div>
  );
}
