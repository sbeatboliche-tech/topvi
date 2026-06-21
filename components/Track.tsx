"use client";

import { useEffect, useRef } from "react";

export default function Track({ stage }: { stage: string }) {
  const startRef = useRef(Date.now());

  useEffect(() => {
    // Registrar eslabón del embudo al montar
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stage }),
    }).catch(() => {});

    // Enviar tiempo en página al salir (visibilitychange es confiable en mobile)
    const sendTime = () => {
      const seconds = Math.round((Date.now() - startRef.current) / 1000);
      if (seconds < 2) return;
      const body = JSON.stringify({ stage, seconds });
      if (navigator.sendBeacon) {
        navigator.sendBeacon("/api/track", new Blob([body], { type: "application/json" }));
      }
    };

    const onVisibility = () => {
      if (document.visibilityState === "hidden") sendTime();
    };

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", sendTime);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", sendTime);
    };
  }, [stage]);

  return null;
}
