"use client";

import { useEffect } from "react";

// Registra (fire-and-forget) el eslabón del embudo al montar.
export default function Track({ stage }: { stage: string }) {
  useEffect(() => {
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stage }),
    }).catch(() => {});
  }, [stage]);
  return null;
}
