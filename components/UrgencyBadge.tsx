"use client";

import { useEffect, useState } from "react";

export default function UrgencyBadge() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    setCount(Math.floor(Math.random() * 9) + 5);
    const t = setInterval(() => {
      setCount((c) => {
        if (c === null) return 7;
        const delta = Math.random() > 0.45 ? 1 : -1;
        return Math.max(3, Math.min(18, c + delta));
      });
    }, 7000);
    return () => clearInterval(t);
  }, []);

  if (count === null) return null;

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-success/25 bg-success/10 px-3 py-1 text-xs font-semibold text-success">
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-success" />
      {count} personas comprando ahora
    </span>
  );
}
