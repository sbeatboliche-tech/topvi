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

    const sendTime = (sync = false) => {
      const seconds = Math.round((Date.now() - startRef.current) / 1000);
      if (seconds < 2) return;
      const body = JSON.stringify({ stage, seconds });
      // sendBeacon para salida real; fetch normal para pings periódicos e IAB de Instagram
      if (!sync && navigator.sendBeacon) {
        navigator.sendBeacon("/api/track", new Blob([body], { type: "application/json" }));
      } else {
        fetch("/api/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body,
          keepalive: true,
        }).catch(() => {});
      }
    };

    // Ping cada 15 s — cubre el IAB de Instagram que no dispara pagehide
    const interval = setInterval(() => sendTime(true), 15_000);

    const onVisibility = () => {
      if (document.visibilityState === "hidden") sendTime();
    };

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", sendTime);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", sendTime);
    };
  }, [stage]);

  return null;
}
