"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getService,
  platformInfo,
  priceFor,
  bonusFor,
  type Quality,
} from "@/lib/config";
import {
  getDict,
  localeConfig,
  displayPrice,
  formatNum,
  fmt,
  type Locale,
} from "@/lib/i18n";

export default function ServiceOrder({
  slug,
  locale,
}: {
  slug: string;
  locale: Locale;
}) {
  const svc = getService(slug)!;
  const t = getDict(locale);
  const router = useRouter();

  const mpAvailable = localeConfig[locale].mpCurrency !== null;

  const [quality, setQuality] = useState<Quality>(
    svc.hasQuality ? "premium" : "global"
  );
  const [tierIdx, setTierIdx] = useState(svc.hasQuality ? 3 : 2);
  const [target, setTarget] = useState("");
  const [contact, setContact] = useState("");
  const [payment, setPayment] = useState<"mercadopago" | "tarjeta" | "usdt">(
    mpAvailable ? "mercadopago" : "usdt"
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const isFollowers = svc.kind === "followers";
  const platformLabel = platformInfo[svc.platform].label;

  const tier = svc.tiers[tierIdx];
  const price = priceFor(tier, quality);
  const bonus = bonusFor(tier, quality);
  const totalUnits = tier.quantity + bonus;
  // "3 cuotas sin interés" solo en los paquetes más grandes (los últimos 3 de la lista)
  const interestFree = tierIdx >= svc.tiers.length - 3;

  const cleanTarget = useMemo(() => target.trim().replace(/^@/, ""), [target]);
  const stepN = (n: number) => (svc.hasQuality ? n : n - 1);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!cleanTarget)
      return setError(isFollowers ? t.order.errUser : t.order.errLink);
    if (!contact.trim()) return setError(t.order.errContact);

    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: svc.slug,
          target: cleanTarget,
          contact: contact.trim(),
          quantity: tier.quantity,
          quality,
          payment,
          locale,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error");
      if (payment === "mercadopago" && data.init_point) {
        window.location.href = data.init_point;
      } else if (payment === "tarjeta") {
        router.push(`/${locale}/pagar-tarjeta?order=${data.orderId}`);
      } else {
        router.push(`/${locale}/gracias?order=${data.orderId}&method=${payment}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
      setSubmitting(false);
    }
  }

  const qkeys: Quality[] = ["global", "premium"];

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="mb-8 text-center">
        <div className="mb-2 text-4xl">{svc.emoji}</div>
        <h1 className="text-3xl font-bold md:text-4xl">
          {fmt(t.order.title, { svc: "" })}{" "}
          <span className="brand-text">{svc.title}</span>
        </h1>
        <p className="mt-2 text-muted">
          {fmt(t.order.sub, { platform: platformLabel })}
        </p>
        {isFollowers && (
          <p className="mx-auto mt-3 max-w-xl rounded-full border border-border bg-surface px-4 py-2 text-xs font-medium text-foreground">
            {t.order.followersBenefits}
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="grid gap-6 pb-24 lg:grid-cols-[1fr_380px] lg:pb-0">
        <div className="space-y-6">
          {svc.hasQuality && (
            <div className="rounded-2xl border border-border bg-surface p-6">
              <h2 className="mb-4 font-semibold">1. {t.order.quality}</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {qkeys.map((q) => (
                  <button
                    type="button"
                    key={q}
                    onClick={() => setQuality(q)}
                    className={`rounded-xl border p-4 text-left transition-all ${
                      quality === q
                        ? "border-brand bg-brand/10 ring-1 ring-brand"
                        : "border-border bg-surface-2 hover:border-brand/40"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">{t.quality[q].label}</span>
                      {q === "premium" && (
                        <span className="brand-gradient rounded-full px-2 py-0.5 text-[10px] font-bold text-white">
                          {t.order.recommended}
                        </span>
                      )}
                    </div>
                    <p className="mt-1.5 text-xs text-muted">{t.quality[q].desc}</p>
                    <p className="mt-2 text-xs text-accent">{t.quality[q].war}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-2xl border border-border bg-surface p-6">
            <h2 className="mb-4 font-semibold">
              {stepN(2)}. {t.order.quantity}
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {svc.tiers.map((tt, i) => {
                const pp = priceFor(tt, quality);
                const bb = bonusFor(tt, quality);
                return (
                  <button
                    type="button"
                    key={tt.quantity}
                    onClick={() => setTierIdx(i)}
                    className={`relative rounded-xl border p-3 text-center transition-all ${
                      tierIdx === i
                        ? "border-brand bg-brand/10 ring-1 ring-brand"
                        : "border-border bg-surface-2 hover:border-brand/40"
                    }`}
                  >
                    {bb > 0 && (
                      <span className="absolute -top-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-success px-2 py-0.5 text-[10px] font-bold text-black">
                        {fmt(t.order.free, { n: formatNum(bb, locale) })}
                      </span>
                    )}
                    <div className="text-lg font-bold">
                      {formatNum(tt.quantity, locale)}
                    </div>
                    <div className="text-xs text-muted">{svc.unit}</div>
                    <div className="mt-1.5 text-sm font-semibold text-accent">
                      {displayPrice(pp, locale)}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-surface p-6">
            <h2 className="mb-4 font-semibold">
              {stepN(3)}. {t.order.yourData}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm text-muted">
                  {isFollowers
                    ? fmt(t.order.userLabel, { platform: platformLabel })
                    : t.order.linkLabel}
                </label>
                {isFollowers ? (
                  <div className="flex items-center rounded-xl border border-border bg-surface-2 px-3 focus-within:border-brand">
                    <span className="text-muted">@</span>
                    <input
                      value={target}
                      onChange={(e) => setTarget(e.target.value)}
                      placeholder="usuario"
                      className="w-full bg-transparent px-2 py-3 outline-none"
                      autoCapitalize="none"
                    />
                  </div>
                ) : (
                  <input
                    value={target}
                    onChange={(e) => setTarget(e.target.value)}
                    placeholder="https://..."
                    className="w-full rounded-xl border border-border bg-surface-2 px-3 py-3 outline-none focus:border-brand"
                    autoCapitalize="none"
                  />
                )}
                <p className="mt-1.5 text-xs text-muted">{t.order.publicWarn}</p>
              </div>
              <div>
                <label className="mb-1.5 block text-sm text-muted">
                  {t.order.contactLabel}
                </label>
                <input
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder={t.order.contactPh}
                  className="w-full rounded-xl border border-border bg-surface-2 px-3 py-3 outline-none focus:border-brand"
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-surface p-6">
            <h2 className="mb-4 font-semibold">
              {stepN(4)}. {t.order.payment}
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {mpAvailable && (
                <button
                  type="button"
                  onClick={() => setPayment("mercadopago")}
                  className={`rounded-xl border p-4 text-left transition-all ${
                    payment === "mercadopago"
                      ? "border-brand bg-brand/10 ring-1 ring-brand"
                      : "border-border bg-surface-2 hover:border-brand/40"
                  }`}
                >
                  <div className="font-semibold">💳 MercadoPago</div>
                  <p className="mt-1 text-xs text-muted">{t.order.mpDesc}</p>
                  {interestFree && (
                    <p className="mt-1.5 text-xs font-semibold text-success">
                      {t.order.interestFree}
                    </p>
                  )}
                </button>
              )}
              {mpAvailable && (
                <button
                  type="button"
                  onClick={() => setPayment("tarjeta")}
                  className={`rounded-xl border p-4 text-left transition-all ${
                    payment === "tarjeta"
                      ? "border-brand bg-brand/10 ring-1 ring-brand"
                      : "border-border bg-surface-2 hover:border-brand/40"
                  }`}
                >
                  <div className="font-semibold">💳 {t.order.cardLabel}</div>
                  <p className="mt-1 text-xs text-muted">{t.order.cardDesc}</p>
                  <p className="mt-1.5 text-xs font-semibold text-success">
                    🎉 Hasta 3 cuotas sin interés
                  </p>
                </button>
              )}
              <button
                type="button"
                onClick={() => setPayment("usdt")}
                className={`rounded-xl border p-4 text-left transition-all ${
                  payment === "usdt"
                    ? "border-brand bg-brand/10 ring-1 ring-brand"
                    : "border-border bg-surface-2 hover:border-brand/40"
                }`}
              >
                <div className="font-semibold">₮ USDT</div>
                <p className="mt-1 text-xs text-muted">{t.order.usdtDesc}</p>
              </button>
            </div>
          </div>
        </div>

        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-border bg-surface p-6">
            <h2 className="mb-4 font-semibold">{t.order.summary}</h2>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted">{t.order.service}</dt>
                <dd className="font-medium">{svc.short}</dd>
              </div>
              {svc.hasQuality && (
                <div className="flex justify-between">
                  <dt className="text-muted">{t.order.qualityW}</dt>
                  <dd className="font-medium">{t.quality[quality].label}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-muted capitalize">{svc.unit}</dt>
                <dd className="font-medium">{formatNum(tier.quantity, locale)}</dd>
              </div>
              {bonus > 0 && (
                <div className="flex justify-between text-success">
                  <dt>{t.order.bonus}</dt>
                  <dd className="font-medium">+{formatNum(bonus, locale)}</dd>
                </div>
              )}
              <div className="flex justify-between border-t border-border pt-2">
                <dt className="text-muted">{t.order.total}</dt>
                <dd className="font-semibold text-accent">
                  {formatNum(totalUnits, locale)}
                </dd>
              </div>
            </dl>

            <div className="mt-4 flex items-end justify-between border-t border-border pt-4">
              <span className="text-muted">{t.order.price}</span>
              <span className="text-2xl font-extrabold">
                {displayPrice(price, locale)}
              </span>
            </div>

            {interestFree && (
              <p className="mt-3 rounded-lg bg-success/10 px-3 py-2 text-center text-xs font-semibold text-success">
                {t.order.interestFree}
              </p>
            )}

            {error && (
              <p className="mt-3 rounded-lg bg-warning/10 px-3 py-2 text-sm text-warning">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="brand-gradient mt-4 w-full rounded-full py-3.5 font-semibold text-white shadow-lg shadow-brand/30 transition-transform hover:scale-[1.02] disabled:opacity-60"
            >
              {submitting ? t.order.processing : t.order.pay}
            </button>
            <p className="mt-3 text-center text-xs text-muted">{t.order.secure}</p>
          </div>
        </div>

        {/* Barra fija de pago en MÓVIL (siempre visible para convertir mejor) */}
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 px-4 py-3 backdrop-blur lg:hidden">
          <div className="flex items-center gap-3 pr-14">
            <div className="leading-tight">
              <div className="text-[10px] uppercase text-muted">
                {t.order.price}
              </div>
              <div className="text-lg font-extrabold">
                {displayPrice(price, locale)}
              </div>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="brand-gradient ml-auto flex-1 rounded-full py-3 text-center font-semibold text-white shadow-lg shadow-brand/30 disabled:opacity-60"
            >
              {submitting ? t.order.processing : t.order.pay}
            </button>
          </div>
        </div>
      </form>

    </div>
  );
}
