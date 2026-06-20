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
    <div className="mx-auto max-w-lg px-4 py-16 text-center">
      <Track stage="gracias" />

      {/* Ícono de éxito */}
      <div className="relative mx-auto mb-6 flex h-24 w-24 items-center justify-center">
        <div className="absolute inset-0 animate-ping rounded-full bg-success opacity-20" />
        <div className="relative animate-pop flex h-24 w-24 items-center justify-center rounded-full border-2 border-success/40 bg-success/15 text-4xl">
          ✓
        </div>
      </div>

      <h1 className="text-3xl font-bold text-white">{t.gracias.title}</h1>
      <p className="mt-2 text-muted">
        {order ? fmt(t.gracias.orderFor, { id: order.id, user: order.username }) : t.gracias.noOrder}
      </p>

      {order && (
        <>
          <PixelPurchase
            value={localAmount(order.amount, locale)}
            currency={localeConfig[locale].currency.code}
          />

          {/* Resumen del pedido */}
          <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.04] p-6 text-left">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-white/50">
              Resumen del pedido
            </h2>
            <dl className="space-y-3 text-sm">
              {(() => {
                const pack = getPack(order.service);
                if (pack) {
                  return (
                    <>
                      {[
                        { emoji: "👥", label: "Seguidores", n: pack.followers, color: "#e1306c" },
                        { emoji: "❤️", label: "Likes",      n: pack.likes,     color: "#f59e0b" },
                        { emoji: "▶️", label: "Vistas",     n: pack.views,     color: "#8b5cf6" },
                      ].map((it) => (
                        <div key={it.label} className="flex items-center justify-between">
                          <dt className="flex items-center gap-2 text-muted">
                            <span className="flex h-7 w-7 items-center justify-center rounded-lg text-base" style={{ background: `${it.color}20` }}>
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
                    <dt className="text-muted">{t.gracias.qty}</dt>
                    <dd className="font-bold">{formatNum(order.totalFollowers, locale)}</dd>
                  </div>
                );
              })()}
              <div className="flex justify-between border-t border-white/10 pt-3">
                <dt className="text-muted">{t.gracias.total}</dt>
                <dd className="text-lg font-extrabold">{displayPrice(order.amount, locale)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">{t.gracias.status}</dt>
                <dd className={`font-semibold ${order.status === "paid" ? "text-success" : "text-warning"}`}>
                  {order.status === "paid" ? t.gracias.paid : t.gracias.waiting}
                </dd>
              </div>
            </dl>
          </div>

          {/* ETA — pagos inmediatos */}
          {isPaid && (
            <div className="mt-4 space-y-3">
              <div className="rounded-2xl border border-success/30 bg-success/8 p-5 text-left">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-success/20 text-xl">⚡</span>
                  <div>
                    <p className="font-semibold text-success">{t.gracias.deliveryTitle}</p>
                    <p className="mt-0.5 text-sm text-muted">{t.gracias.deliveryEta}</p>
                  </div>
                </div>
              </div>
              <div className="rounded-2xl border border-border bg-surface p-5 text-left">
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5 text-xl">🛡️</span>
                  <div>
                    <p className="font-semibold">{t.gracias.gradualTitle}</p>
                    <p className="mt-1 text-sm leading-relaxed text-muted">{t.gracias.gradualDesc}</p>
                  </div>
                </div>
              </div>
              {method === "mercadopago" && order.status !== "paid" && (
                <p className="text-sm text-muted">{t.gracias.mpPending}</p>
              )}
            </div>
          )}

          {/* Instrucciones USDT */}
          {method === "usdt" && (
            <div className="mt-5 rounded-2xl border border-warning/40 bg-warning/5 p-6 text-left">
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
              <p className="mt-4 rounded-xl bg-surface-2 px-4 py-3 text-sm text-muted">
                ⏱️ {t.gracias.usdtDeliveryNote}
              </p>
            </div>
          )}

          {/* Instrucciones TRANSFERENCIA */}
          {method === "transferencia" && (
            <TransferBox
              orderId={order.id}
              amount={displayPrice(order.amount, locale)}
              titular={site.transfer.titular}
              alias={site.transfer.alias}
              cvu={site.transfer.cvu}
              cuit={site.transfer.cuit}
            />
          )}
        </>
      )}

      {/* Acciones */}
      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <Link
          href={p("/servicios")}
          className="brand-gradient rounded-full px-6 py-3 font-semibold"
        >
          🛒 Comprar de nuevo
        </Link>
        <Link
          href={p("/")}
          className="rounded-full border border-border bg-surface px-6 py-3 font-semibold hover:bg-surface-2"
        >
          {t.gracias.home}
        </Link>
        <a
          href={`https://wa.me/${site.whatsapp}`}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full border border-border bg-surface px-6 py-3 font-semibold hover:bg-surface-2"
        >
          💬 {t.gracias.wpp}
        </a>
      </div>
    </div>
  );
}
