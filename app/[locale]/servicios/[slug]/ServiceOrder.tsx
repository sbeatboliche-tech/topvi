"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  getService,
  getAddonFor,
  closestTierIdx,
  platformInfo,
  priceFor,
  bonusFor,
  anchorPrice,
  applyPaymentDiscount,
  applyCoupon,
  couponDiscount,
  CRYPTO_DISCOUNT,
  MAX_TARGETS,
  type Quality,
} from "@/lib/config";
import {
  getDict,
  localeConfig,
  localAmount,
  displayPrice,
  formatNum,
  fmt,
  type Locale,
} from "@/lib/i18n";
import { fbqTrack } from "@/lib/fbq";

type StepKey = "quality" | "quantity" | "targets" | "addon" | "contact" | "payment";

export default function ServiceOrder({
  slug,
  locale,
  initialQty,
  initialQuality,
  coupon: couponProp,
}: {
  slug: string;
  locale: Locale;
  initialQty?: number;
  initialQuality?: Quality;
  coupon?: string;
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
  // Sin método preseleccionado cuando hay varias opciones: el cliente elige.
  // (Si no hay MercadoPago, solo queda Crypto → lo dejamos elegido.)
  const [payment, setPayment] = useState<"mercadopago" | "tarjeta" | "usdt" | "">(
    mpAvailable ? "" : "usdt"
  );

  // ---- Add-on / upsell cruzado ----
  const addonSvc = getAddonFor(svc.slug);
  const addonIsFollowers = addonSvc?.kind === "followers";
  const [addonOn, setAddonOn] = useState(false);
  const [addonTierIdx, setAddonTierIdx] = useState(0);
  // Multi-target del extra: igual que el principal, hasta MAX_TARGETS.
  const [addonTargets, setAddonTargets] = useState<string[]>([""]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // ---- Wizard ----
  const steps: StepKey[] = [
    ...(svc.hasQuality ? (["quality"] as StepKey[]) : []),
    "quantity",
    "targets",
    ...(addonSvc ? (["addon"] as StepKey[]) : []),
    "contact",
    "payment",
  ];
  const [step, setStep] = useState(0);
  const current = steps[step];
  const isLast = step === steps.length - 1;

  const tier = svc.tiers[tierIdx];
  const price = priceFor(tier, quality);
  const bonus = bonusFor(tier, quality);
  const totalUnits = tier.quantity + bonus;

  const addonTier = addonSvc?.tiers[addonTierIdx];
  const addonPrice = addonOn && addonTier ? priceFor(addonTier, "global") : 0;
  const total = price + addonPrice;
  // Cupón de remarketing (llega por ?promo= en el link del mail de descuento).
  const coupon = (couponProp ?? "").trim().toUpperCase();
  const couponPct = couponDiscount(coupon);
  const totalWithCoupon = applyCoupon(total, coupon);
  // Total a pagar (cupón + descuento cripto). Se recalcula igual en el server.
  const payTotal = applyPaymentDiscount(totalWithCoupon, payment);

  const filledTargets = targets.map((x) => x.trim()).filter(Boolean);
  const filledAddonTargets = addonTargets.map((x) => x.trim()).filter(Boolean);

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

  function setAddonTarget(i: number, val: string) {
    setAddonTargets((arr) => arr.map((x, idx) => (idx === i ? val : x)));
  }
  function addAddonTarget() {
    setAddonTargets((arr) => (arr.length < MAX_TARGETS ? [...arr, ""] : arr));
  }
  function removeAddonTarget(i: number) {
    setAddonTargets((arr) => (arr.length > 1 ? arr.filter((_, idx) => idx !== i) : arr));
  }

  function cleanTarget(v: string) {
    return isFollowers ? v.trim().replace(/^@/, "") : v.trim();
  }

  // Captura el email para remarketing apenas lo escriben (aunque no compren).
  function captureEmail() {
    const email = contact.trim();
    if (!email.includes("@")) return;
    fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contact: email,
        locale,
        service: svc.slug,
        source: "checkout",
      }),
    }).catch(() => {});
  }

  // Valida el paso actual. Devuelve mensaje de error o null si está OK.
  function validateStep(s: StepKey): string | null {
    if (s === "targets" && filledTargets.length === 0) {
      return isFollowers ? t.order.errUser : t.order.errLink;
    }
    if (s === "addon" && addonOn && filledAddonTargets.length === 0) {
      return addonIsFollowers
        ? "Ingresá la cuenta para los seguidores que agregaste."
        : "Pegá el link del posteo para los likes que agregaste.";
    }
    if (s === "contact" && !contact.trim()) {
      return t.order.errContact;
    }
    return null;
  }

  function goTo(n: number) {
    setError("");
    setStep(n);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function next() {
    const err = validateStep(current);
    if (err) {
      setError(err);
      return;
    }
    if (current === "contact") captureEmail();
    goTo(Math.min(step + 1, steps.length - 1));
  }
  function back() {
    goTo(Math.max(step - 1, 0));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Enter en un input no debe saltear pasos: si no es el último, avanzá.
    if (!isLast) {
      next();
      return;
    }
    setError("");

    if (!payment) {
      setError("Elegí un método de pago para continuar.");
      return;
    }

    // Revalidación de seguridad de todos los pasos con datos obligatorios.
    for (const s of steps) {
      const err = validateStep(s);
      if (err) {
        setError(err);
        const idx = steps.indexOf(s);
        if (idx >= 0) setStep(idx);
        return;
      }
    }

    const cleaned = filledTargets.map(cleanTarget).filter(Boolean);

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
          coupon: couponPct > 0 ? coupon : undefined,
          addon:
            addonOn && addonSvc && addonTier
              ? {
                  slug: addonSvc.slug,
                  quantity: addonTier.quantity,
                  targets: filledAddonTargets.map((x) =>
                    addonIsFollowers ? x.replace(/^@/, "") : x
                  ),
                }
              : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error");
      fbqTrack("InitiateCheckout", {
        value: localAmount(payTotal, locale),
        currency: localeConfig[locale].currency.code,
      });
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

  const stepTitles: Record<StepKey, string> = {
    quality: t.order.quality,
    quantity: t.order.quantity,
    targets: isFollowers
      ? "¿En qué cuentas los querés?"
      : "¿En qué posteos los querés?",
    addon: `Sumá ${addonSvc?.short ?? ""}`,
    contact: t.order.yourData,
    payment: t.order.payment,
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      {/* Encabezado */}
      <div className="mb-6 text-center">
        <div className="mb-2 text-3xl">{svc.emoji}</div>
        <h1 className="text-2xl font-bold md:text-3xl">
          {fmt(t.order.title, { svc: "" })}{" "}
          <span className="brand-text">{svc.title}</span>
        </h1>
        <p className="mt-1.5 text-sm text-muted">
          {fmt(t.order.sub, { platform: platformLabel })}
        </p>
        {couponPct > 0 && (
          <div className="mx-auto mt-3 inline-flex items-center gap-2 rounded-full border border-success/40 bg-success/10 px-4 py-1.5 text-sm font-semibold text-success">
            🎁 Cupón {coupon} aplicado · −{Math.round(couponPct * 100)}%
          </div>
        )}
      </div>

      {/* Stepper: progreso + total en vivo */}
      <div className="mb-6 rounded-2xl border border-border bg-surface/70 p-4 backdrop-blur">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-semibold">
            Paso {step + 1} de {steps.length}
            <span className="ml-2 font-normal text-muted">
              · {stepTitles[current]}
            </span>
          </span>
          <span className="text-right leading-tight">
            <span className="block text-[10px] uppercase tracking-wide text-muted">
              {t.order.price}
            </span>
            <span className="text-lg font-extrabold">
              {displayPrice(payTotal, locale)}
            </span>
          </span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
          <div
            className="brand-gradient h-full rounded-full transition-all duration-300"
            style={{ width: `${((step + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="rounded-2xl border border-border bg-surface p-6">
          {/* ───── Paso: Calidad ───── */}
          {current === "quality" && (
            <div>
              <h2 className="mb-4 font-semibold">{t.order.quality}</h2>
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
                        <span className="brand-gradient rounded-full px-2 py-0.5 text-[10px] font-bold">
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

          {/* ───── Paso: Cantidad ───── */}
          {current === "quantity" && (
            <div>
              <h2 className="mb-4 font-semibold">{t.order.quantity}</h2>
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
                      <div className="mt-1.5 text-[11px] text-muted line-through">
                        {displayPrice(anchorPrice(pp), locale)}
                      </div>
                      <div className="text-sm font-semibold text-accent">
                        {displayPrice(pp, locale)}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ───── Paso: Destinos ───── */}
          {current === "targets" && (
            <div>
              <h2 className="mb-1 font-semibold">{stepTitles.targets}</h2>
              <p className="mb-4 text-sm text-muted">
                {isFollowers
                  ? `Repartimos los ${formatNum(totalUnits, locale)} ${svc.unit} entre las cuentas que cargues (hasta ${MAX_TARGETS}).`
                  : `Repartimos los ${formatNum(totalUnits, locale)} ${svc.unit} entre los posteos que cargues (hasta ${MAX_TARGETS}).`}
              </p>

              {/* Aviso destacado: la cuenta/posteo tiene que estar en público */}
              <div className="mb-4 rounded-xl border border-warning/40 bg-warning/10 px-4 py-3 text-sm font-medium text-warning">
                {t.order.publicWarn}
              </div>
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
            </div>
          )}

          {/* ───── Paso: Add-on / upsell ───── */}
          {current === "addon" && addonSvc && addonTier && (
            <div>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-semibold">
                    🔥 Sumá {addonSvc.short} y potenciá el resultado
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
                      : "brand-gradient"
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
                        ? `Cuenta${addonTargets.length > 1 ? "s" : ""} de ${platformLabel} para repartir los ${formatNum(addonTier.quantity, locale)} ${addonSvc.short.toLowerCase()}`
                        : `Posteo${addonTargets.length > 1 ? "s" : ""} donde repartir los ${formatNum(addonTier.quantity, locale)} ${addonSvc.short.toLowerCase()}`}
                    </label>
                    <div className="space-y-2">
                      {addonTargets.map((val, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <span className="w-5 shrink-0 text-center text-sm text-muted">
                            {i + 1}
                          </span>
                          {addonIsFollowers ? (
                            <div className="flex w-full items-center rounded-xl border border-border bg-surface-2 px-3 focus-within:border-brand">
                              <span className="text-muted">@</span>
                              <input
                                value={val}
                                onChange={(e) => setAddonTarget(i, e.target.value)}
                                placeholder="usuario"
                                className="w-full bg-transparent px-2 py-3 outline-none"
                                autoCapitalize="none"
                                autoCorrect="off"
                                spellCheck={false}
                              />
                            </div>
                          ) : (
                            <input
                              value={val}
                              onChange={(e) => setAddonTarget(i, e.target.value)}
                              placeholder="https://instagram.com/..."
                              className="w-full rounded-xl border border-border bg-surface-2 px-3 py-3 outline-none focus:border-brand"
                              autoCapitalize="none"
                              autoCorrect="off"
                              spellCheck={false}
                              inputMode="url"
                            />
                          )}
                          {addonTargets.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeAddonTarget(i)}
                              className="shrink-0 rounded-lg border border-border px-3 py-2 text-muted hover:bg-surface-2"
                              aria-label="Quitar"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    {addonTargets.length < MAX_TARGETS && (
                      <button
                        type="button"
                        onClick={addAddonTarget}
                        className="mt-2 rounded-full border border-border px-4 py-2 text-sm font-medium hover:bg-surface-2"
                      >
                        {addonIsFollowers ? "+ Agregar otra cuenta" : "+ Agregar otro posteo"}
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-warning">{t.order.publicWarn}</p>
                </div>
              )}

              {!addonOn && (
                <p className="mt-4 text-xs text-muted">
                  Es opcional. Podés continuar sin agregar nada.
                </p>
              )}
            </div>
          )}

          {/* ───── Paso: Contacto ───── */}
          {current === "contact" && (
            <div>
              <h2 className="mb-4 font-semibold">{t.order.yourData}</h2>
              <label className="mb-1.5 block text-sm text-muted">
                {t.order.contactLabel}
              </label>
              <input
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                onBlur={captureEmail}
                placeholder={t.order.contactPh}
                className="w-full rounded-xl border border-border bg-surface-2 px-3 py-3 outline-none focus:border-brand"
                inputMode="email"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
              />
            </div>
          )}

          {/* ───── Paso: Pago + resumen ───── */}
          {current === "payment" && (
            <div>
              <h2 className="mb-4 font-semibold">{t.order.payment}</h2>
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

              {/* Resumen final */}
              <div className="mt-6 rounded-xl border border-border bg-surface-2 p-4">
                <h3 className="mb-3 text-sm font-semibold">{t.order.summary}</h3>
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
                <div className="mt-3 flex items-end justify-between border-t border-border pt-3">
                  <span className="text-muted">{t.order.price}</span>
                  <span>
                    {payment === "usdt" && (
                      <span className="mr-2 text-sm text-muted line-through">
                        {displayPrice(total, locale)}
                      </span>
                    )}
                    <span className="text-2xl font-extrabold">
                      {displayPrice(payTotal, locale)}
                    </span>
                  </span>
                </div>
                {payment === "usdt" && (
                  <p className="mt-1 text-right text-xs font-semibold text-success">
                    −{Math.round(CRYPTO_DISCOUNT * 100)}% pagando en cripto 🪙
                  </p>
                )}
                {payment === "tarjeta" && (
                  <p className="mt-3 rounded-lg bg-success/10 px-3 py-2 text-center text-xs font-semibold text-success">
                    {t.order.interestFree}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <p className="mt-4 rounded-lg bg-warning/10 px-3 py-2 text-sm text-warning">
            {error}
          </p>
        )}

        {/* Navegación */}
        <div className="mt-5 flex items-center gap-3">
          {step > 0 && (
            <button
              type="button"
              onClick={back}
              className="rounded-full border border-border px-6 py-3 text-sm font-semibold text-muted transition-colors hover:bg-surface-2"
            >
              ← Atrás
            </button>
          )}
          {!isLast ? (
            <button
              type="button"
              onClick={next}
              className="brand-gradient ml-auto flex-1 rounded-full py-3.5 font-semibold shadow-lg shadow-brand/30 transition-transform hover:scale-[1.02] sm:flex-none sm:px-12"
            >
              Continuar →
            </button>
          ) : (
            <button
              type="submit"
              disabled={submitting || !payment}
              className="brand-gradient ml-auto flex-1 rounded-full py-3.5 font-semibold shadow-lg shadow-brand/30 transition-transform hover:scale-[1.02] disabled:opacity-60 sm:flex-none sm:px-12"
            >
              {submitting ? t.order.processing : !payment ? "Elegí un método de pago" : t.order.pay}
            </button>
          )}
        </div>
        {isLast && (
          <p className="mt-3 text-center text-xs text-muted">{t.order.secure}</p>
        )}
      </form>
    </div>
  );
}
