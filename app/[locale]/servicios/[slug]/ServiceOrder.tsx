"use client";

import { useState, useEffect, useRef } from "react";
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
import Countdown from "@/components/Countdown";

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

  const defaultTierIdx = -1;
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
  const [payment, setPayment] = useState<"mercadopago" | "tarjeta" | "usdt" | "transferencia" | "">(
    mpAvailable ? "mercadopago" : "transferencia"
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
  const [pickedIdx, setPickedIdx] = useState<number | null>(null);
  const autoAdvanceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ---- Wizard ----
  const steps: StepKey[] = [
    ...(svc.hasQuality ? (["quality"] as StepKey[]) : []),
    "quantity",
    "targets",
    "contact",
    "payment",
  ];
  const [step, setStep] = useState(0);
  const current = steps[step];
  const isLast = step === steps.length - 1;

  // Tracking de embudo: entró al checkout / llegó al pago.
  useEffect(() => {
    const track = (stage: string) =>
      fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage }),
      }).catch(() => {});
    track(current === "payment" ? "payment" : "checkout");
  }, [current === "payment"]); // eslint-disable-line react-hooks/exhaustive-deps

  const tier = svc.tiers[tierIdx >= 0 ? tierIdx : 0];
  const price = tierIdx >= 0 ? priceFor(tier, quality) : 0;
  const bonus = tierIdx >= 0 ? bonusFor(tier, quality) : 0;
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

  // Captura automática: apenas terminan de escribir un email válido,
  // sin depender de que hagan clic en Continuar ni que lleguen al pago.
  useEffect(() => {
    const email = contact.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return;
    const id = setTimeout(() => captureEmail(), 900);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contact]);

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

  // Scroll al tope del wizard al cambiar de paso (después del render).
  const topRef = useRef<HTMLDivElement>(null);
  const firstStepRender = useRef(true);
  useEffect(() => {
    if (firstStepRender.current) {
      firstStepRender.current = false;
      return;
    }
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [step]);

  function goTo(n: number) {
    setError("");
    setPickedIdx(null);
    setStep(n);
  }

  function autoAdvance(delay = 280) {
    if (autoAdvanceRef.current) clearTimeout(autoAdvanceRef.current);
    autoAdvanceRef.current = setTimeout(() => {
      setError("");
      setPickedIdx(null);
      setStep((s) => Math.min(s + 1, steps.length - 1));
    }, delay);
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
  // Acento por plataforma del servicio (IG magenta / TikTok cyan).
  const accent = svc.platform === "tiktok" ? "#25f4ee" : "#e1306c";

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
    <div ref={topRef} className="mx-auto max-w-2xl scroll-mt-20 px-4 pb-32 pt-6">
      {/* Encabezado compacto */}
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">{svc.emoji}</span>
          <h1 className="text-base font-bold leading-tight">{svc.title}</h1>
        </div>
        {couponPct > 0 ? (
          <span className="shrink-0 rounded-full border border-success/40 bg-success/10 px-2.5 py-1 text-xs font-semibold text-success">
            −{Math.round(couponPct * 100)}%
          </span>
        ) : (
          <span className="shrink-0 text-xs font-semibold text-warning">
            🔥 <Countdown />
          </span>
        )}
      </div>

      {/* Trust strip compacto — horizontal, sin scroll */}
      <div className="mb-3 flex items-center justify-between gap-1 rounded-xl border border-border bg-surface/50 px-3 py-2 text-xs">
        {[
          { icon: "⚡", label: "Entrega en 2 hs" },
          { icon: "🛡️", label: "Garantía 90 días" },
          { icon: "🔒", label: "Sin contraseña" },
        ].map((item, i) => (
          <div key={item.label} className={`flex items-center gap-1.5 ${i > 0 ? "border-l border-border pl-2" : ""}`}>
            <span>{item.icon}</span>
            <span className="text-white/60">{item.label}</span>
          </div>
        ))}
      </div>

      {/* Stepper: progreso + total en vivo */}
      <div className="mb-4 rounded-2xl border border-border bg-surface/70 p-3 backdrop-blur">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="text-xs font-semibold text-muted">
            Paso {step + 1}/{steps.length} · {stepTitles[current]}
          </span>
          <span className="text-base font-extrabold">
            {displayPrice(payTotal, locale)}
          </span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
          <div
            className="brand-gradient h-full rounded-full shadow-[0_0_8px_rgba(255,255,255,0.4)] transition-all duration-700 ease-out"
            style={{ width: `${((step + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>

      <form id="service-order-form" onSubmit={handleSubmit}>
        <div key={step} className="step-enter rounded-2xl border border-border bg-surface p-4 sm:p-6">
          {/* ───── Paso: Calidad ───── */}
          {current === "quality" && (
            <div>
              <h2 className="mb-4 font-semibold">{t.order.quality}</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {qkeys.map((q) => (
                  <button
                    type="button"
                    key={q}
                    onClick={() => { setQuality(q); autoAdvance(); }}
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
              <h2 className="mb-2 font-semibold">{t.order.quantity} <span className="text-xs font-normal text-muted">· más = mejor precio 🎁</span></h2>
              <div className="reveal grid grid-cols-2 gap-2 sm:grid-cols-3">
                {svc.tiers.map((tt, i) => {
                  const pp = priceFor(tt, quality);
                  const bb = bonusFor(tt, quality);
                  const selected = tierIdx === i;
                  const popular = tt.quantity === 5000;
                  return (
                    <button
                      type="button"
                      key={tt.quantity}
                      onClick={() => { setTierIdx(i); setPickedIdx(i); autoAdvance(); }}
                      className={`relative flex flex-col items-center rounded-2xl border p-3 text-center transition-all duration-200 active:scale-[0.97] ${
                        selected
                          ? `border-white/40 bg-white/[0.08] ${pickedIdx === i ? "card-pick" : "shadow-xl"}`
                          : "border-border bg-surface-2 hover:border-white/20 hover:bg-surface"
                      }`}
                      style={selected && pickedIdx !== i ? { boxShadow: "0 0 24px rgba(255,255,255,0.12)" } : {}}
                    >
                      {/* Badge top */}
                      {popular ? (
                        <span className="shimmer absolute -top-2.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-white px-2.5 py-0.5 text-[10px] font-bold text-[#0a0a0b] shadow">
                          ⭐ MÁS ELEGIDO
                        </span>
                      ) : bb > 0 ? (
                        <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-success px-2.5 py-0.5 text-[10px] font-bold text-black shadow">
                          +{fmt(t.order.free, { n: formatNum(bb, locale) })}
                        </span>
                      ) : null}

                      {/* Check seleccionado */}
                      {selected && (
                        <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-white text-[10px] font-bold text-[#0a0a0b]">
                          ✓
                        </span>
                      )}

                      {/* Cantidad */}
                      <div className={`mt-1 text-xl font-extrabold tracking-tight ${selected ? "text-white" : "text-white/90"}`}>
                        {formatNum(tt.quantity, locale)}
                      </div>
                      <div className="text-[10px] text-muted">{svc.unit}</div>

                      {/* Precio */}
                      <div className="mt-2 w-full rounded-xl border border-white/8 bg-white/5 py-1.5">
                        <div className="text-[9px] text-white/35 line-through leading-tight">
                          {displayPrice(anchorPrice(pp), locale)}
                        </div>
                        <div className={`text-sm font-extrabold leading-tight ${selected ? "text-white" : "text-accent"}`}>
                          {displayPrice(pp, locale)}
                        </div>
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
              {/* Counter animado */}
              <TargetsHeader totalUnits={totalUnits} unit={svc.unit} isFollowers={isFollowers} onBack={back} locale={locale} />
              <h2 className="mb-1 font-semibold">{stepTitles.targets}</h2>
              <p className="mb-4 text-sm text-muted">
                {isFollowers
                  ? `Repartimos los ${formatNum(totalUnits, locale)} ${svc.unit} entre las cuentas que cargues (hasta ${MAX_TARGETS}).`
                  : `Repartimos los ${formatNum(totalUnits, locale)} ${svc.unit} entre los posteos que cargues (hasta ${MAX_TARGETS}).`}
              </p>

              {/* Aviso perfil público */}
              <div className="mb-4 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/70">
                ℹ️ Tu {isFollowers ? "perfil" : "posteo"} debe estar en <strong className="text-white">público</strong> para recibir los {svc.unit}. Podés volver a privado después.
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
              <button
                type="button"
                onClick={next}
                className="brand-gradient mt-5 w-full rounded-2xl py-4 text-base font-bold shadow-lg"
              >
                Continuar →
              </button>
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

              {/* MercadoPago: DESTACADO */}
              {mpAvailable && (
                <button
                  type="button"
                  onClick={() => setPayment("mercadopago")}
                  className={`w-full rounded-xl border-2 p-4 text-left transition-all ${
                    payment === "mercadopago"
                      ? "border-[#009ee3] bg-[#009ee3]/10 ring-2 ring-[#009ee3]"
                      : "border-[#009ee3]/50 bg-[#009ee3]/5 hover:border-[#009ee3]"
                  }`}
                >
                  <div className="font-semibold">💳 MercadoPago</div>
                  <p className="mt-1 text-xs text-muted">{t.order.mpDesc}</p>
                  <span className="mt-2 inline-block rounded-full bg-[#009ee3] px-2.5 py-0.5 text-[10px] font-bold text-white">
                    RECOMENDADO · Pago instantáneo
                  </span>
                </button>
              )}

              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                <button
                  type="button"
                  onClick={() => setPayment("transferencia")}
                  className={`rounded-xl border p-4 text-left transition-all ${
                    payment === "transferencia"
                      ? "border-success bg-success/10 ring-1 ring-success"
                      : "border-border bg-surface-2 hover:border-success/40"
                  }`}
                >
                  <div className="font-semibold">🏦 Transferencia</div>
                  <p className="mt-1 text-xs text-muted">CBU/alias. Confirmación manual.</p>
                  <span className="mt-2 inline-block rounded-full bg-success/20 px-2.5 py-0.5 text-[10px] font-bold text-success">
                    5% OFF
                  </span>
                </button>
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
                  <span className="mt-2 inline-block rounded-full bg-success/20 px-2.5 py-0.5 text-[10px] font-bold text-success">
                    5% OFF
                  </span>
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
                    {(payment === "usdt" || payment === "transferencia") && (
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
                {payment === "transferencia" && (
                  <p className="mt-1 text-right text-xs font-semibold text-success">
                    −5% pagando por transferencia 🏦
                  </p>
                )}
              </div>

              {/* Garantía de reposición */}
              <div className="mt-3 flex items-center gap-2 rounded-xl border border-success/30 bg-success/5 px-4 py-3 text-sm font-semibold text-success">
                🛡️ Garantía de reposición 90 días incluida
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
      </form>

      {/* Barra de navegación fija — siempre visible */}
      <div className="nav-slide-up fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-[#0a0a0b]/95 px-4 pb-safe pt-3 pb-4 backdrop-blur-xl">
        <div className="mx-auto flex max-w-2xl items-center gap-3">
          {/* Atrás */}
          {step > 0 ? (
            <button
              type="button"
              onClick={back}
              className="rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-white/60 hover:border-white/30 hover:text-white"
            >
              ← Atrás
            </button>
          ) : (
            <div className="w-2" />
          )}

          {/* Derecha: precio + acción */}
          <div className="ml-auto flex items-center gap-3">
            {/* Precio — siempre visible */}
            <div className="text-right">
              <div className="text-[10px] font-medium text-white/40">Total</div>
              <div className="text-base font-extrabold leading-none">{displayPrice(payTotal, locale)}</div>
            </div>

            {/* Botón: en pasos de auto-avance muestra hint; en otros, la acción */}
            {current === "quantity" || current === "quality" ? (
              <div className="rounded-full border border-white/15 px-5 py-3 text-sm text-white/40">
                Tocá un precio →
              </div>
            ) : !isLast ? (
              <button
                type="button"
                onClick={next}
                className="brand-gradient rounded-full px-7 py-3 font-semibold shadow-lg shadow-brand/30"
              >
                Continuar →
              </button>
            ) : (
              <button
                type="submit"
                form="service-order-form"
                disabled={submitting || !payment}
                onClick={(e) => { e.preventDefault(); const form = document.getElementById("service-order-form") as HTMLFormElement; form?.requestSubmit(); }}
                className="brand-gradient rounded-full px-7 py-3 font-semibold shadow-lg shadow-brand/30 disabled:opacity-50"
              >
                {submitting ? t.order.processing : !payment ? "Elegí método" : t.order.pay}
              </button>
            )}
          </div>
        </div>
        {isLast && (
          <p className="mt-2 text-center text-xs text-white/30">{t.order.secure}</p>
        )}
      </div>

      {/* Mini FAQ — objeciones comunes */}
      <div className="mt-8 space-y-2">
        {[
          {
            q: "¿Los seguidores interactúan con mi cuenta?",
            a: "Los seguidores aumentan tu número de seguidores y mejoran tu credibilidad social. Para interacciones reales, combiná con likes en tus posteos.",
          },
          {
            q: "¿Me puede banear Instagram?",
            a: "En más de 5 años y miles de órdenes, nunca tuvimos un solo caso de baneo. Entregamos de forma gradual y dentro de los límites de Instagram.",
          },
          {
            q: "¿Cuándo llegan los seguidores?",
            a: "Empiezan a llegar entre 10 minutos y 2 horas después de confirmar el pago. El proceso es gradual para que se vea natural.",
          },
          {
            q: "¿Qué pasa si se caen?",
            a: "Incluimos garantía de reposición por 90 días. Si baja la cantidad, te reponemos gratis sin preguntas.",
          },
        ].map((item) => (
          <FaqItem key={item.q} q={item.q} a={item.a} />
        ))}
      </div>
    </div>
  );
}

function useCountUp(target: number, duration = 600) {
  const [count, setCount] = useState(target);
  const prevRef = useRef(target);
  useEffect(() => {
    if (prevRef.current === target) return;
    const start = prevRef.current;
    prevRef.current = target;
    const startTime = performance.now();
    const animate = (now: number) => {
      const t = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setCount(Math.round(start + (target - start) * eased));
      if (t < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [target, duration]);
  return count;
}

function TargetsHeader({
  totalUnits,
  unit,
  isFollowers,
  onBack,
  locale,
}: {
  totalUnits: number;
  unit: string;
  isFollowers: boolean;
  onBack: () => void;
  locale: string;
}) {
  const count = useCountUp(totalUnits);
  return (
    <div className="mb-5">
      <button
        type="button"
        onClick={onBack}
        className="mb-3 flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/50 hover:border-white/20 hover:text-white/80"
      >
        ← Cambiar cantidad
      </button>
      <div className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#e1306c]/10 text-xl">
          {isFollowers ? "👥" : "❤️"}
        </div>
        <div>
          <div className="text-xs text-white/40">Vas a recibir</div>
          <div className="text-xl font-extrabold tabular-nums text-white">
            {formatNum(count, locale as import("@/lib/i18n").Locale)}{" "}
            <span className="text-base font-semibold text-white/60">{unit}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-border bg-surface/50">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium"
      >
        <span>{q}</span>
        <span className="ml-2 shrink-0 text-muted">{open ? "−" : "+"}</span>
      </button>
      {open && (
        <p className="border-t border-border px-4 pb-3 pt-2 text-sm text-muted">{a}</p>
      )}
    </div>
  );
}
