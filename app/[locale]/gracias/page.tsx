import Link from "next/link";
import { notFound } from "next/navigation";
import { getOrder } from "@/lib/db";
import { site, getPack } from "@/lib/config";
import {
  getDict,
  isLocale,
  fmt,
  displayPrice,
  formatNum,
  localAmount,
  localeConfig,
  type Locale,
} from "@/lib/i18n";
import PixelPurchase from "@/components/PixelPurchase";
import TransferBox from "@/components/TransferBox";
import Track from "@/components/Track";

export default async function Gracias({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ order?: string; method?: string }>;
}) {
  const { locale: l } = await params;
  if (!isLocale(l)) notFound();
  const locale = l as Locale;
  const t = getDict(locale);
  const { order: orderId, method } = await searchParams;
  const order = orderId ? await getOrder(orderId) : null;
  const p = (path: string) => `/${locale}${path}`;

  const isPaid = method === "mercadopago" || method === "tarjeta";

  return (
    <div className="mx-auto max-w-lg px-4 py-12 text-center">
      <Track stage="gracias" />

      {order && isPaid && (
        <PixelPurchase
          value={localAmount(order.amount, locale)}
          currency={localeConfig[locale].currency.code}
        />
      )}

      {/* Hero de confirmación */}
      <div className="relative mx-auto mb-6 w-fit">
        {/* Glow detrás */}
        <div className="absolute inset-0 scale-150 rounded-full bg-success/20 blur-2xl" />
        <div className="relative animate-pop flex h-20 w-20 items-center justify-center rounded-full border border-success/30 bg-success/10 text-4xl">
          ✓
        </div>
      </div>

      <h1 className="text-2xl font-extrabold text-white">
        ¡Gracias por tu compra!
      </h1>
      {order && (
        <p className="mt-1.5 text-sm text-white/50">
          Orden <span className="font-mono font-semibold text-white/70">{order.id}</span>
          {" · "}@{order.username}
        </p>
      )}

      {/* Tarjeta de entrega — el foco principal */}
      {isPaid && (
        <div
          className="mt-6 overflow-hidden rounded-2xl p-[1px]"
          style={{ background: "linear-gradient(135deg, #22c55e44, #16a34a22, transparent)" }}
        >
          <div className="rounded-2xl bg-[#0d1a12] px-5 py-5 text-left">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-success/15 text-2xl">
                ⚡
              </div>
              <div>
                <p className="font-bold text-success">Tu pedido está en camino</p>
                <p className="mt-1 text-sm leading-relaxed text-white/60">
                  Entre <span className="font-semibold text-white/90">10 minutos y 2 horas</span> vas a ver
                  cómo empieza a llegar tu servicio. Lo entregamos de forma gradual
                  para que se vea natural.
                </p>
              </div>
            </div>

            {/* Barra de progreso animada */}
            <div className="mt-4 overflow-hidden rounded-full bg-white/5 h-1.5">
              <div
                className="h-full rounded-full bg-success"
                style={{
                  width: "30%",
                  animation: "progressPulse 2s ease-in-out infinite",
                }}
              />
            </div>
            <p className="mt-2 text-right text-[11px] text-white/30">Procesando tu pedido…</p>
          </div>
        </div>
      )}

      {/* Instrucciones TRANSFERENCIA */}
      {method === "transferencia" && (
        <div className="mt-6">
          <TransferBox
            orderId={order?.id ?? ""}
            amount={order ? displayPrice(order.amount, locale) : ""}
            titular={site.transfer.titular}
            alias={site.transfer.alias}
            cvu={site.transfer.cvu}
            cuit={site.transfer.cuit}
          />
        </div>
      )}

      {/* Instrucciones USDT */}
      {method === "usdt" && order && (
        <div className="mt-6 rounded-2xl border border-warning/40 bg-warning/5 p-6 text-left">
          <h2 className="font-semibold">{t.gracias.usdtTitle}</h2>
          <p className="mt-2 text-sm text-muted">
            {fmt(t.gracias.usdtBody, {
              amount: displayPrice(order.amount, locale),
              network: site.usdt.network,
            })}
          </p>
          <code className="mt-3 block break-all rounded-xl bg-surface-2 p-4 text-sm font-mono">
            {site.usdt.address}
          </code>
          <p className="mt-3 text-sm text-muted">{t.gracias.usdtAfter}</p>
          <a
            href={`mailto:${site.email}?subject=${encodeURIComponent(`Comprobante USDT - Orden ${order.id}`)}`}
            className="mt-4 inline-block rounded-full bg-warning px-6 py-3 font-semibold text-black"
          >
            {t.gracias.sendProof}
          </a>
        </div>
      )}

      {/* Resumen del pedido */}
      {order && (
        <div className="mt-5 rounded-2xl border border-white/8 bg-white/[0.03] p-5 text-left">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/30">
            Resumen
          </p>
          <dl className="space-y-2.5 text-sm">
            {(() => {
              const pack = getPack(order.service);
              if (pack) {
                return (
                  <>
                    {[
                      { emoji: "👥", label: "Seguidores", n: pack.followers, color: "#e1306c" },
                      { emoji: "❤️", label: "Likes", n: pack.likes, color: "#f59e0b" },
                      { emoji: "▶️", label: "Vistas", n: pack.views, color: "#8b5cf6" },
                    ].map((it) => (
                      <div key={it.label} className="flex items-center justify-between">
                        <dt className="flex items-center gap-2 text-white/50">
                          <span
                            className="flex h-6 w-6 items-center justify-center rounded-md text-sm"
                            style={{ background: `${it.color}20` }}
                          >
                            {it.emoji}
                          </span>
                          {it.label}
                        </dt>
                        <dd className="font-bold">{formatNum(it.n, locale)}</dd>
                      </div>
                    ))}
                  </>
                );
              }
              return (
                <div className="flex justify-between">
                  <dt className="text-white/50">{t.gracias.qty}</dt>
                  <dd className="font-bold">{formatNum(order.totalFollowers, locale)}</dd>
                </div>
              );
            })()}
            <div className="flex justify-between border-t border-white/8 pt-2.5">
              <dt className="text-white/50">{t.gracias.total}</dt>
              <dd className="text-lg font-extrabold">{displayPrice(order.amount, locale)}</dd>
            </div>
          </dl>
        </div>
      )}

      {/* Upsell */}
      {order && isPaid && (
        <div className="mt-5 rounded-2xl border border-white/8 bg-white/[0.03] p-5 text-left">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/30">
            Potenciá tu cuenta
          </p>
          <h2 className="mt-1.5 text-base font-bold">Agregale likes a tus posteos</h2>
          <p className="mt-1 text-sm text-white/50">
            Los posteos con likes ranquean mejor. El algoritmo te muestra a más gente.
          </p>
          <Link
            href={p("/servicios/instagram-likes")}
            className="brand-gradient mt-3 inline-block rounded-full px-5 py-2.5 text-sm font-semibold"
          >
            Ver paquetes de likes →
          </Link>
        </div>
      )}

      {/* Acciones */}
      <div className="mt-8 flex flex-wrap justify-center gap-2">
        <Link
          href={p("/servicios")}
          className="brand-gradient rounded-full px-5 py-2.5 text-sm font-semibold"
        >
          Comprar de nuevo
        </Link>
        <a
          href={`https://wa.me/${site.whatsapp}`}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold hover:bg-white/10"
        >
          💬 Consultar por WhatsApp
        </a>
      </div>
    </div>
  );
}
