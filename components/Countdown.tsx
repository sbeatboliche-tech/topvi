"use client";

import { useEffect, useState } from "react";

// Cuenta regresiva hasta la próxima medianoche (se renueva cada día).
// Da una sensación de "oferta por hoy" real, sin trucos burdos.
function msToMidnight() {
  const now = new Date();
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);
  return end.getTime() - now.getTime();
}

function fmt(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const h = String(Math.floor(s / 3600)).padStart(2, "0");
  const m = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
  const sec = String(s % 60).padStart(2, "0");
  return `${h}:${m}:${sec}`;
}

export default function Countdown() {
  const [left, setLeft] = useState<number | null>(null);

  useEffect(() => {
    setLeft(msToMidnight());
    const id = setInterval(() => setLeft(msToMidnight()), 1000);
    return () => clearInterval(id);
  }, []);

  if (left === null) return null;

  return (
    <span className="tabular-nums font-bold tracking-tight">{fmt(left)}</span>
  );
}
