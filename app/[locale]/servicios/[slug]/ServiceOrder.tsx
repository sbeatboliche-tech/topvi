"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getService,
  getAddonFor,
  closestTierIdx,
  platformInfo,
  priceFor,
  bonusFor,
  MAX_TARGETS,
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
import AccountCheck from "@/components/AccountCheck";

export default function ServiceOrder({
  slug,
  locale,
  initialQty,
  initialQuality,
}: {
  slug: string;
  locale: Locale;
  initialQty?: number;
  initialQuality?: Quality;
}) {
  const svc = getService(slug)!;
  const t = getDict(locale);
  const router = useRouter();

  const mpAvailable = localeConfig[locale].mpCurrency !== null;
  const isFollowers = svc.kind === "followers";
  const platformLabel = platformInfo[svc.platform].label;

  const defaultTierIdx = svc.hasQuality ? 3 : 2;
  const presetIdx = initialQty
    ? svc.tiers.findIndex((tt) => tt.quantity === initialQty)
    : -1;

  const [quality, setQuality] = useState<Quality>(
    initialQuality ?? (svc.hasQuality ? "premium" : "global")
  );
  const [tierIdx, setTierIdx] = useState(
    presetIdx >= 0 ? presetIdx : defaultTierIdx
  );
  // Multi-target: cuentas (seguidores) o links de posteo (likes/vistas/etc).
  const [targets, setTargets] = useState<string[]>([""]);
  const [contact, setContact] = useState("");
  const [payment, setPayment] = useState<"mercadopago" | "tarjeta" | "usdt">(
    mpAvailable ? "mercadopago" : "usdt"
  );

  // ---- Add-on / upsell cruzado ----
  const addonSvc = getAddonFor(svc.slug);
  const addonIsFollowers = addonSvc?.kind === "followers";
  const [addonOn, setAddonOn] = useState(false);
  const [addonTierIdx, setAddonTierIdx] = useState(0);
  const [addonTarget, setAddonTarget] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const firstTargetRef = useRef<HTMLInputElement>(null);
  const targetsRef = useRef<HTMLDivElement>(null);
  const contactRef = useRef<HTMLInputElement>(null);
  const addonTargetRef = useRef<HTMLInputElement>(null);

  const tier = svc.tiers[tierIdx];
  const price = priceFor(tier, quality);
  const bonus = bonusFor(tier, quality);
  const totalUnits = tier.quantity + bonus;
  const interestFree = tierIdx >= svc.tiers.length - 3;

  const addonTier = addonSvc?.tiers[addonTierIdx];
  const addonPrice = addonOn && addonTier ? priceFor(addonTier, "global") : 0;
  const total = price + addonPrice;

  const filledTargets = targets.map((x) => x.trim()).filter(Boolean);

  function enableAddon() {
    if (!addonSvc) return;
    setAddonTierIdx(closestTierIdx(addonSvc, tier.quantity));
    setAddonOn(true);
  }

  function setTarget(i: number, val: string) {
    setTargets((arr) => arr.map((x, idx) => (idx === i ? val : x)));
  }
  function addTarget() {
    setTargets((arr) => (arr.length < MAX_TARGETS ? [...arr, ""] : arr));
  }
  function removeTarget(i: number) {
    setTargets((arr) => (arr.length > 1 ? arr.filter((_, idx) => idx !== i) : arr));
  }

  function cleanTarget(v: string) {
    return isFollowers ? v.trim().replace(/^@/, "") : v.trim();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const cleaned = filledTargets.map(cleanTarget).filter(Boolean);
    if (cleaned.length === 0) {
      setError(isFollowers ? t.order.errUser : t.order.errLink);
      targetsRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      firstTargetRef.current?.focus();
      return;
    }
    if (addonOn && !addonTarget.trim()) {
      setError(
        addonIsFollowers
          ? "Ingresá la cuenta para los seguidores que agregaste."
          : "Pegá el link del posteo para los likes que agregaste."
      );
      addonTargetRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      addonTargetRef.current?.focus();
      return;
    }
    if (!contact.trim()) {
      setError(t.order.errContact);
      contactRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      contactRef.current?.focus();
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: svc.slug,
          targets: cleaned,
          contact: contact.trim(),
          quantity: tier.quantity,
          quality,
          payment,
          locale,
          addon:
            addonOn && addonSvc && addonTier
              ? {
                  slug: addonSvc.slug,
                  quantity: addonTier.quantity,
                  targets: [
                    addonIsFollowers
                      ? addonTarget.trim().replace(/^@/, "")
                      : addonTarget.trim(),
                  ],
                }
              : undefined,
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
  const stepN = (n: number) => (svc.hasQuality ? n : n - 1);
  // Numeración dinámica: el add-on (si existe) corre los pasos siguientes.
  const targetStep = stepN(3);
  const addonStep = stepN(4);
  const contactStep = addonSvc ? stepN(5) : stepN(4);
  const payStep = addonSvc ? stepN(6) : stepN(5);

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

      <form onSubmit={handleSubmit} className="grid gap-6 pb-28 lg:grid-cols-[1fr_380px] lg:pb-0">
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

          {/* Cantidad */}
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

          {/* Destinos: cuentas (seguidores) o posteos (likes/vistas) */}
          <div ref={targetsRef} className="rounded-2xl border border-border bg-surface p-6">
            <h2 className="mb-1 font-semibold">
              {targetStep}.{" "}
              {isFollowers
                ? "¿En qué cuentas querés los seguidores?"
                : "¿En qué posteos los querés?"}
            </h2>
            <p className="mb-4 text-sm text-muted">
              {isFollowers
                ? `Repartimos los ${formatNum(totalUnits, locale)} ${svc.unit} entre las cuentas que cargues (hasta ${MAX_TARGETS}).`
                : `Repartimos los ${formatNum(totalUnits, locale)} ${svc.unit} entre los posteos que cargues (hasta ${MAX_TARGETS}).`}
            </p>
            <div className="space-y-3">
              {targets.map((val, i) => (
                <div key={i}>
                  <div className="flex items-center gap-2">
                    <span className="w-5 shrink-0 text-center text-sm text-muted">
                      {i + 1}
                    </span>
                    {isFollowers ? (
                      <div className="flex w-full items-center rounded-xl border border-border bg-surface-2 px-3 focus-within:border-brand">
                        <span className="text-muted">@</span>
                        <input
                          ref={i === 0 ? firstTargetRef : undefined}
                          value={val}
                          onChange={(e) => setTarget(i, e.target.value)}
                          placeholder="usuario"
                          className="w-full bg-transparent px-2 py-3 outline-none"
                          autoCapitalize="none"
                          autoCorrect="off"
                          spellCheck={false}
                        />
                      </div>
                    ) : (
                      <input
                        ref={i === 0 ? firstTargetRef : undefined}
                        value={val}
                        onChange={(e) => setTarget(i, e.target.value)}
                        placeholder="https://instagram.com/..."
                        className="w-full rounded-xl border border-border bg-surface-2 px-3 py-3 outline-none focus:border-brand"
                        autoCapitalize="none"
                        autoCorrect="off"
                        spellCheck={false}
                        inputMode="url"
                      />
                    )}
                    {targets.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTarget(i)}
                        className="shrink-0 rounded-lg border border-border px-3 py-2 text-muted hover:bg-surface-2"
                        aria-label="Quitar"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                  {isFollowers && svc.platform === "instagram" && (
                    <div className="pl-7">
                      <AccountCheck username={val} />
                    </div>
                  )}
                </div>
              ))}
            </div>
            {targets.length < MAX_TARGETS && (
              <button
                type="button"
                onClick={addTarget}
                className="mt-3 rounded-full border border-border px-4 py-2 text-sm font-medium hover:bg-surface-2"
              >
                {isFollowers ? "+ Agregar otra cuenta" : "+ Agregar otro posteo"}
              </button>
            )}
            <p className="mt-3 text-xs text-muted">{t.order.publicWarn}</p>
          </div>

          {/* Add-on / upsell cruzado */}
          {addonSvc && addonTier && (
            <div
              className={`rounded-2xl border p-6 transition-all ${
                addonOn ? "border-brand bg-brand/5" : "border-dashed border-brand/50 bg-surface"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-semibold">
                    {addonStep}. 🔥 Sumá {addonSvc.short} y potenciá el resultado
                  </h2>
                  <p className="mt-1 text-sm text-muted">
                    {addonIsFollowers
                      ? "Reforzá tu perfil con seguidores además de los likes."
                      : "Tus seguidores rinden más si tus posteos tienen likes."}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => (addonOn ? setAddonOn(false) : enableAddon())}
                  className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                    addonOn
                      ? "border border-border bg-surface-2"
                      : "brand-gradient text-white"
                  }`}
                >
                  {addonOn ? "Quitar" : "Agregar"}
                </button>
              </div>

              {addonOn && (
                <div className="mt-4 space-y-4">
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {addonSvc.tiers.map((tt, i) => (
                      <button
                        type="button"
                        key={tt.quantity}
                        onClick={() => setAddonTierIdx(i)}
                        className={`rounded-lg border p-2 text-center text-sm transition-all ${
                          addonTierIdx === i
                            ? "border-brand bg-brand/10 ring-1 ring-brand"
                            : "border-border bg-surface-2 hover:border-brand/40"
                        }`}
                      >
                        <div className="font-bold">{formatNum(tt.quantity, locale)}</div>
                        <div className="text-xs text-accent">
                          {displayPrice(priceFor(tt, "global"), locale)}
                        </div>
                      </button>
                    ))}
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm text-muted">
                      {addonIsFollowers
                        ? `Cuenta de ${platformLabel} para los seguidores`
                        : "Link del posteo para los likes"}
                    </label>
                    {addonIsFollowers ? (
                      <div className="flex items-center rounded-xl border border-border bg-surface-2 px-3 focus-within:border-brand">
                        <span className="text-muted">@</span>
                        <input
                          ref={addonTargetRef}
                          value={addonTarget}
                          onChange={(e) => setAddonTarget(e.target.value)}
                          placeholder="usuario"
                          className="w-full bg-transparent px-2 py-3 outline-none"
                          autoCapitalize="none"
                          autoCorrect="off"
                          spellCheck={false}
                        />
                      </div>
                    ) : (
                      <input
                        ref={addonTargetRef}
                        value={addonTarget}
                        onChange={(e) => setAddonTarget(e.target.value)}
                        placeholder="https://instagram.com/..."
                        className="w-full rounded-xl border border-border bg-surface-2 px-3 py-3 outline-none focus:border-brand"
                        autoCapitalize="none"
                        autoCorrect="off"
                        spellCheck={false}
                        inputMode="url"
                      />
                    )}
                    {addonIsFollowers && addonSvc.platform === "instagram" && (
                      <AccountCheck username={addonTarget} />
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Contacto */}
          <div className="rounded-2xl border border-border bg-surface p-6">
            <h2 className="mb-4 font-semibold">
              {contactStep}. {t.order.yourData}
            </h2>
            <label className="mb-1.5 block text-sm text-muted">
              {t.order.contactLabel}
            </label>
            <input
              ref={contactRef}
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder={t.order.contactPh}
              className="w-full rounded-xl border border-border bg-surface-2 px-3 py-3 outline-none focus:border-brand"
              inputMode="email"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
            />
          </div>

          {/* Pago */}
          <div className="rounded-2xl border border-border bg-surface p-6">
            <h2 className="mb-4 font-semibold">
              {payStep}. {t.order.payment}
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
                    💳 Hasta 3 cuotas sin interés
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
                <div className="font-semibold">🪙 Crypto</div>
                <p className="mt-1 text-xs text-muted">{t.order.usdtDesc}</p>
              </button>
            </div>
          </div>
        </div>

        {/* Resumen */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-border bg-surface p-6">
            <h2 className="mb-4 font-semibold">{t.order.summary}</h2>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted">{svc.short}</dt>
                <dd className="font-medium">{formatNum(totalUnits, locale)}</dd>
              </div>
              {filledTargets.length > 1 && (
                <div className="flex justify-between text-xs">
                  <dt className="text-muted">
                    {isFollowers ? "Cuentas" : "Posteos"}
                  </dt>
                  <dd className="font-medium">{filledTargets.length}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-muted">{svc.short}</dt>
                <dd className="font-medium">{displayPrice(price, locale)}</dd>
              </div>
              {addonOn && addonTier && (
                <div className="flex justify-between text-accent">
                  <dt>
                    + {formatNum(addonTier.quantity, locale)} {addonSvc!.short}
                  </dt>
                  <dd className="font-medium">{displayPrice(addonPrice, locale)}</dd>
                </div>
              )}
            </dl>

            <div className="mt-4 flex items-end justify-between border-t border-border pt-4">
              <span className="text-muted">{t.order.price}</span>
              <span className="text-2xl font-extrabold">
                {displayPrice(total, locale)}
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

        {/* Barra fija de pago en MÓVIL */}
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 px-4 py-3 backdrop-blur lg:hidden">
          {error && (
            <p className="mb-2 rounded-lg bg-warning/10 px-3 py-1.5 text-center text-xs font-medium text-warning">
              {error}
            </p>
          )}
          <div className="flex items-center gap-3 pr-14">
            <div className="leading-tight">
              <div className="text-[10px] uppercase text-muted">
                {t.order.price}
              </div>
              <div className="text-lg font-extrabold">
                {displayPrice(total, locale)}
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
