"use client";

import { useEffect } from "react";
import { fbqTrack } from "@/lib/fbq";

// Dispara el evento Purchase del Meta Pixel al llegar a la pantalla de gracias
// (una sola vez). Se renderiza solo cuando el pago está confirmado.
export default function PixelPurchase({
  value,
  currency,
}: {
  value: number;
  currency: string;
}) {
  useEffect(() => {
    fbqTrack("Purchase", { value, currency });
  }, [value, currency]);
  return null;
}
