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

    const pingTime = () => {
      const seconds = Math.round((Date.now() - startRef.current) / 1000);
      if (seconds < 2) return;
      fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage, seconds }),
        keepalive: true,
      }).catch(() => {});
    };

    const sendBeaconTime = () => {
      const seconds = Math.round((Date.now() - startRef.current) / 1000);
      if (seconds < 2) return;
      const body = JSON.stringify({ stage, seconds });
      if (navigator.sendBeacon) {
        navigator.sendBeacon("/api/track", new Blob([body], { type: "application/json" }));
      } else {
        fetch("/api/track", { method: "POST", headers: { "Content-Type": "application/json" }, body, keepalive: true }).catch(() => {});
      }
    };

    // Ping cada 5s — cubre el IAB de Instagram que no dispara pagehide
    const interval = setInterval(pingTime, 5_000);

    const onVisibility = () => {
      if (document.visibilityState === "hidden") sendBeaconTime();
    };

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", sendBeaconTime);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", sendBeaconTime);
    };
  }, [stage]);

  return null;
}
