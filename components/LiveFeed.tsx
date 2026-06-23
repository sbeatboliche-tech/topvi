"use client";

import { useEffect, useState } from "react";

interface Props {
  bought: string;
  agoText: string;
  names: string[];
  cities: string[];
  services: string[];
}

interface Notice {
  name: string;
  initial: string;
  city: string;
  service: string;
  ago: number;
  color: string;
}

const COLORS = ["#e1306c", "#833ab4", "#fd1d1d", "#f77737", "#fcaf45", "#5851db"];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export default function LiveFeed({ bought, agoText, names, cities, services }: Props) {
  const [notice, setNotice] = useState<Notice | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let hideTimer: ReturnType<typeof setTimeout>;

    const show = () => {
      const name = pick(names);
      setNotice({
        name,
        initial: name[0].toUpperCase(),
        city: pick(cities),
        service: pick(services),
        ago: 1 + Math.floor(Math.random() * 18),
        color: pick(COLORS),
      });
      setVisible(true);
      hideTimer = setTimeout(() => setVisible(false), 4000);
    };

    const first = setTimeout(show, 4000);
    const loop = setInterval(show, 14000);
    return () => {
      clearTimeout(first);
      clearInterval(loop);
      clearTimeout(hideTimer);
    };
  }, [names, cities, services]);

  if (!notice) return null;

  return (
    <div
      className={`fixed left-4 top-20 z-[60] w-[280px] overflow-hidden rounded-2xl border border-white/10 bg-[#111]/90 shadow-2xl shadow-black/60 backdrop-blur-xl transition-all duration-500 ease-out ${
        visible ? "translate-x-0 opacity-100" : "pointer-events-none -translate-x-10 opacity-0"
      }`}
      style={{ boxShadow: `0 0 0 1px rgba(255,255,255,0.06), 0 20px 40px rgba(0,0,0,0.5)` }}
    >
      {/* Barra de acento superior */}
      <div className="h-[2px] w-full" style={{ background: `linear-gradient(90deg, ${notice.color}, transparent)` }} />

      <div className="flex items-center gap-3 px-3 py-3">
        {/* Avatar */}
        <div
          className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white shadow-lg"
          style={{ background: `linear-gradient(135deg, ${notice.color}, #833ab4)` }}
        >
          {notice.initial}
          {/* Checkmark */}
          <span className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#0095f6] text-[8px] font-bold text-white ring-2 ring-[#111]">
            ✓
          </span>
        </div>

        {/* Texto */}
        <div className="min-w-0 flex-1 text-xs leading-snug">
          <p className="truncate font-semibold text-white">
            {notice.name}
            <span className="ml-1 font-normal text-white/40">· {notice.city}</span>
          </p>
          <p className="mt-0.5 text-white/50">
            {bought} <span className="font-semibold text-white/80">{notice.service}</span>
          </p>
        </div>

        {/* Tiempo */}
        <div className="shrink-0 text-right">
          <span className="flex items-center gap-1 text-[10px] text-white/30">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-success" />
            {agoText.replace("{n}", String(notice.ago))}
          </span>
        </div>
      </div>
    </div>
  );
}
