// Helper para disparar eventos del Meta Pixel desde cualquier componente.
// Si el pixel no está cargado (sin ID configurado), no hace nada.

type Fbq = (action: string, event: string, params?: Record<string, unknown>) => void;

export function fbqTrack(event: string, params?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  const fbq = (window as unknown as { fbq?: Fbq }).fbq;
  if (typeof fbq === "function") {
    fbq("track", event, params);
  }
}
