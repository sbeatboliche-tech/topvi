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
    <div className="mx-auto max-w-2xl px-4 py-20 text-center">
      <div className="animate-pop brand-gradient mx-auto flex h-16 w-16 items-center justify-center rounded-full text-3xl text-white">
        ✓
      </div>
      <h1 className="mt-6 text-3xl font-bold">{t.gracias.title}</h1>

      {order ? (
        <>
          {isPaid && (
            <PixelPurchase
              value={localAmount(order.amount, locale)}
              currency={localeConfig[locale].currency.code}
            />
          )}
          <p className="mt-3 text-muted">
            {fmt(t.gracias.orderFor, { id: order.id, user: order.username })}
          </p>

          {/* Resumen del pedido */}
          <div className="mt-8 rounded-2xl border border-border bg-surface p-6 text-left">
            {(() => {
              const pack = getPack(order.service);
              if (pack) {
                return (
                  <div className="space-y-2 border-b border-border pb-3">
                    <div className="flex justify-between">
                      <span className="text-muted">👥 Seguidores</span>
                      <span className="font-semibold">{formatNum(pack.followers, locale)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted">❤️ Likes</span>
                      <span className="font-semibold">{formatNum(pack.likes, locale)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted">▶️ Vistas</span>
                      <span className="font-semibold">{formatNum(pack.views, locale)}</span>
                    </div>
                  </div>
                );
              }
              return (
                <div className="flex justify-between border-b border-border pb-3">
                  <span className="text-muted">{t.gracias.qty}</span>
                  <span className="font-semibold">
                    {formatNum(order.totalFollowers, locale)}
                  </span>
                </div>
              );
            })()}
            <div className="flex justify-between border-b border-border py-3">
              <span className="text-muted">{t.gracias.total}</span>
              <span className="font-semibold">
                {displayPrice(order.amount, locale)}
              </span>
            </div>
            <div className="flex justify-between pt-3">
              <span className="text-muted">{t.gracias.status}</span>
              <span className="font-semibold text-accent">
                {order.status === "paid" ? t.gracias.paid : t.gracias.waiting}
              </span>
            </div>
          </div>

          {/* ETA de entrega — para pagos con MercadoPago o tarjeta */}
          {isPaid && (
            <>
              <div className="mt-5 rounded-2xl border border-success/30 bg-success/5 p-5 text-left">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">⚡</span>
                  <div>
                    <p className="font-semibold text-success">
                      {t.gracias.deliveryTitle}
                    </p>
                    <p className="mt-0.5 text-sm text-muted">
                      {t.gracias.deliveryEta}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-border bg-surface p-5 text-left">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🛡️</span>
                  <div>
                    <p className="font-semibold">{t.gracias.gradualTitle}</p>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted">
                      {t.gracias.gradualDesc}
                    </p>
                  </div>
                </div>
              </div>

              {method === "mercadopago" && order.status !== "paid" && (
                <p className="mt-4 text-sm text-muted">{t.gracias.mpPending}</p>
              )}
            </>
          )}

          {/* Instrucciones USDT */}
          {method === "usdt" && (
            <div className="mt-6 rounded-2xl border border-warning/40 bg-warning/5 p-6 text-left">
              <h2 className="font-semibold">{t.gracias.usdtTitle}</h2>
              <p className="mt-2 text-sm text-muted">
                {fmt(t.gracias.usdtBody, {
                  amount: displayPrice(order.amount, locale),
                  network: site.usdt.network,
                })}
              </p>
              <code className="mt-3 block break-all rounded-lg bg-surface-2 p-3 text-sm">
                {site.usdt.address}
              </code>
              <p className="mt-3 text-sm text-muted">{t.gracias.usdtAfter}</p>
              <a
                href={`mailto:${site.email}?subject=${encodeURIComponent(`Comprobante USDT - Orden ${order.id}`)}`}
                className="mt-4 inline-block brand-gradient rounded-full px-6 py-3 font-semibold text-white"
              >
                {t.gracias.sendProof}
              </a>
              <p className="mt-4 rounded-lg bg-surface-2 px-4 py-3 text-sm text-muted">
                ⏱️ {t.gracias.usdtDeliveryNote}
              </p>
            </div>
          )}

          {/* Instrucciones TRANSFERENCIA (dinámicas: copiar + aviso) */}
          {method === "transferencia" && (
            <TransferBox
              orderId={order.id}
              amount={displayPrice(order.amount, locale)}
              titular={site.transfer.titular}
              alias={site.transfer.alias}
              cvu={site.transfer.cvu}
              cuit={site.transfer.cuit}
              mailto={`mailto:${site.email}?subject=${encodeURIComponent(`Comprobante transferencia - Orden ${order.id}`)}`}
            />
          )}
        </>
      ) : (
        <p className="mt-3 text-muted">{t.gracias.noOrder}</p>
      )}

      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <Link
          href={p("/servicios")}
          className="brand-gradient rounded-full px-6 py-3 font-semibold text-white"
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
          href={site.instagram}
          target="_blank"
          rel="noopener noreferrer"
          className="brand-gradient rounded-full px-6 py-3 font-semibold text-white"
        >
          {t.gracias.wpp}
        </a>
      </div>
    </div>
  );
}
