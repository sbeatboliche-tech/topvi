"use client";

import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  getPack,
  MAX_PACK_POSTS,
  applyPaymentDiscount,
  CRYPTO_DISCOUNT,
} from "@/lib/config";
import { displayPrice, formatNum, localeConfig, localAmount, type Locale } from "@/lib/i18n";
import { fbqTrack } from "@/lib/fbq";
import Countdown from "@/components/Countdown";

export default function PackOrder({
  slug,
  locale,
}: {
  slug: string;
  locale: Locale;
}) {
  const pack = getPack(slug)!;
  const router = useRouter();
  const mpAvailable = localeConfig[locale].mpCurrency !== null;

  const [username, setUsername] = useState("");
  const [posts, setPosts] = useState<string[]>([""]);
  const [contact, setContact] = useState("");
  const [payment, setPayment] = useState<"mercadopago" | "tarjeta" | "usdt" | "transferencia" | "">(
    mpAvailable ? "" : "transferencia"
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const userRef = useRef<HTMLInputElement>(null);
  const postsRef = useRef<HTMLDivElement>(null);
  const contactRef = useRef<HTMLInputElement>(null);

  const filledPosts = posts.map((p) => p.trim()).filter(Boolean);
  const payTotal = applyPaymentDiscount(pack.price, payment);
  const discount = Math.round(((pack.originalPrice - pack.price) / pack.originalPrice) * 100);

  function captureEmail() {
    const email = contact.trim();
    if (!email.includes("@")) return;
    fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contact: email, locale, service: pack.slug, source: "pack" }),
    }).catch(() => {});
  }

  useEffect(() => {
    const email = contact.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return;
    const id = setTimeout(() => captureEmail(), 900);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contact]);

  function setPost(i: number, val: string) {
    setPosts((arr) => arr.map((p, idx) => (idx === i ? val : p)));
  }
  function addPost() {
    setPosts((arr) => (arr.length < MAX_PACK_POSTS ? [...arr, ""] : arr));
  }
  function removePost(i: number) {
    setPosts((arr) => (arr.length > 1 ? arr.filter((_, idx) => idx !== i) : arr));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const cleanUser = username.trim().replace(/^@/, "");
    if (!cleanUser) {
      setError("Ingresá tu usuario para los seguidores.");
      userRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      userRef.current?.focus();
      return;
    }
    if (filledPosts.length === 0) {
      setError("Cargá al menos un link de posteo para los likes y vistas.");
      postsRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    if (!contact.trim()) {
      setError("Dejanos un email para avisarte.");
      contactRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      contactRef.current?.focus();
      return;
    }
    if (!payment) {
      setError("Elegí un método de pago para continuar.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pack: pack.slug,
          target: cleanUser,
          posts: filledPosts,
          contact: contact.trim(),
          payment,
          locale,
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

  const includes = [
    { emoji: "👥", label: "Seguidores", n: pack.followers, color: "#e1306c" },
    { emoji: "❤️", label: "Likes",      n: pack.likes,     color: "#f59e0b" },
    { emoji: "▶️", label: "Vistas",     n: pack.views,     color: "#8b5cf6" },
  ];

  return (
    <div className="page-enter mx-auto max-w-6xl px-4 py-10">

      {/* ── Hero del pack ── */}
      <div className="mb-8 text-center">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-medium text-white/80">
          🔥 Precio de lanzamiento · termina en <Countdown />
        </div>
        <div className="mb-3 text-5xl">{pack.emoji}</div>
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{pack.name}</h1>
        <p className="mt-2 text-sm text-muted">Instagram · Entrega inmediata · Sin contraseña</p>

        {/* Precio destacado */}
        <div className="mt-5 flex items-center justify-center gap-3">
          <span className="text-lg text-muted line-through">{displayPrice(pack.originalPrice, locale)}</span>
          <span className="text-4xl font-extrabold">{displayPrice(pack.price, locale)}</span>
          <span className="rounded-full bg-success px-3 py-1 text-sm font-bold text-black">
            −{discount}%
          </span>
        </div>

        {pack.badge && (
          <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-bold text-white">
            🏆 {pack.badge}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="grid gap-6 pb-28 lg:grid-cols-[1fr_380px] lg:pb-0">
        <div className="space-y-5">

          {/* ── Qué incluye ── */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
            <h2 className="mb-5 text-center text-sm font-semibold uppercase tracking-widest text-white/50">
              Todo lo que recibís
            </h2>
            <div className="grid grid-cols-3 gap-3">
              {includes.map((it) => (
                <div
                  key={it.label}
                  className="flex flex-col items-center gap-2 rounded-2xl border border-white/10 p-4"
                  style={{ background: `${it.color}12` }}
                >
                  <span
                    className="flex h-12 w-12 items-center justify-center rounded-xl text-2xl"
                    style={{ background: `${it.color}22` }}
                  >
                    {it.emoji}
                  </span>
                  <span className="text-2xl font-extrabold leading-tight">
                    {formatNum(it.n, locale)}
                  </span>
                  <span className="text-xs font-medium text-muted">{it.label}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap justify-center gap-2 text-xs text-white/50">
              <span>✓ Garantía de reposición</span>
              <span>·</span>
              <span>✓ Entrega inmediata</span>
              <span>·</span>
              <span>✓ Perfil en público mientras dura</span>
            </div>
          </div>

          {/* ── 1. Usuario ── */}
          <div className="rounded-2xl border border-border bg-surface p-6">
            <h2 className="mb-1 font-semibold">1. Tu usuario de Instagram</h2>
            <p className="mb-4 text-sm text-muted">
              Acá van los {formatNum(pack.followers, locale)} seguidores.
            </p>
            <div className="flex items-center rounded-xl border border-border bg-surface-2 px-3 focus-within:border-brand">
              <span className="text-muted">@</span>
              <input
                ref={userRef}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="usuario"
                className="w-full bg-transparent px-2 py-3 outline-none"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
              />
            </div>
            <div className="mt-3 rounded-xl border border-warning/40 bg-warning/10 px-4 py-3 text-sm font-medium text-warning">
              ⚠️ Tu cuenta debe estar en PÚBLICO durante la entrega. Después podés pasarla a privado sin problema.
            </div>
          </div>

          {/* ── 2. Posteos ── */}
          <div ref={postsRef} className="rounded-2xl border border-border bg-surface p-6">
            <h2 className="mb-1 font-semibold">2. ¿En qué posteos querés los likes y vistas?</h2>
            <p className="mb-4 text-sm text-muted">
              Pegá links de reels o publicaciones. Repartimos los {formatNum(pack.likes, locale)} likes
              y {formatNum(pack.views, locale)} vistas entre los que cargues (hasta {MAX_PACK_POSTS}).
            </p>
            <div className="space-y-3">
              {posts.map((post, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="w-5 shrink-0 text-center text-sm text-muted">{i + 1}</span>
                  <input
                    value={post}
                    onChange={(e) => setPost(i, e.target.value)}
                    placeholder="https://instagram.com/..."
                    className="w-full rounded-xl border border-border bg-surface-2 px-3 py-3 outline-none focus:border-brand"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    inputMode="url"
                  />
                  {posts.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removePost(i)}
                      className="shrink-0 rounded-lg border border-border px-3 py-2 text-muted hover:bg-surface-2"
                      aria-label="Quitar"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
            {posts.length < MAX_PACK_POSTS && (
              <button
                type="button"
                onClick={addPost}
                className="mt-3 rounded-full border border-border px-4 py-2 text-sm font-medium hover:bg-surface-2"
              >
                + Agregar otro posteo
              </button>
            )}
          </div>

          {/* ── 3. Contacto ── */}
          <div className="rounded-2xl border border-border bg-surface p-6">
            <h2 className="mb-4 font-semibold">3. ¿Dónde te avisamos?</h2>
            <input
              ref={contactRef}
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              onBlur={captureEmail}
              placeholder="tu@email.com"
              className="w-full rounded-xl border border-border bg-surface-2 px-3 py-3 outline-none focus:border-brand"
              inputMode="email"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
            />
          </div>

          {/* ── 4. Pago ── */}
          <div className="rounded-2xl border border-border bg-surface p-6">
            <h2 className="mb-4 font-semibold">4. Método de pago</h2>

            {/* Transferencia destacada */}
            <button
              type="button"
              onClick={() => setPayment("transferencia")}
              className={`mb-3 w-full rounded-xl border-2 p-4 text-left transition-all ${
                payment === "transferencia"
                  ? "border-success bg-success/10 ring-2 ring-success"
                  : "border-success/50 bg-success/5 hover:border-success"
              }`}
            >
              <div className="font-semibold">🏦 Transferencia bancaria</div>
              <p className="mt-1 text-xs text-muted">
                La opción más rápida. Pagás por CBU/alias y te mandamos el servicio pedido al confirmar el pago.
              </p>
              <span className="mt-2 inline-block rounded-full bg-success px-2.5 py-0.5 text-[10px] font-bold text-black">
                5% OFF · RECOMENDADO
              </span>
            </button>

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
                  <p className="mt-1 text-xs text-muted">Tarjeta o dinero en cuenta. Pagá en cuotas.</p>
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
                  <div className="font-semibold">💳 Tarjeta de crédito</div>
                  <p className="mt-1 text-xs text-muted">Pagá con tu tarjeta sin salir de la web.</p>
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
                <div className="font-semibold">🪙 Crypto (USDT)</div>
                <p className="mt-1 text-xs text-muted">
                  −{Math.round(CRYPTO_DISCOUNT * 100)}% de descuento. Te pasamos la wallet.
                </p>
              </button>
            </div>

            {/* Mini reseñas */}
            <div className="mt-5 space-y-2">
              {[
                { n: "Caro M.", t: "Compré el pack y en 2 horas tenía todo. Increíble 🙌" },
                { n: "Tomás R.", t: "Pensé que era chanta pero cumplieron al 100% 💯" },
              ].map((r) => (
                <div key={r.n} className="rounded-xl border border-border bg-surface-2 p-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-yellow-400">★★★★★</span>
                    <span className="font-semibold">{r.n}</span>
                    <span className="text-success">· Compra verificada</span>
                  </div>
                  <p className="mt-1 text-muted">{r.t}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Resumen lateral (desktop) ── */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
            <h2 className="mb-4 font-semibold">Resumen del pedido</h2>
            <dl className="space-y-2 text-sm">
              {includes.map((it) => (
                <div key={it.label} className="flex justify-between">
                  <dt className="text-muted">{it.emoji} {it.label}</dt>
                  <dd className="font-semibold">{formatNum(it.n, locale)}</dd>
                </div>
              ))}
              {filledPosts.length > 0 && (
                <div className="flex justify-between text-xs">
                  <dt className="text-muted">Posteos cargados</dt>
                  <dd className="font-medium">{filledPosts.length}</dd>
                </div>
              )}
            </dl>

            <div className="mt-4 border-t border-white/10 pt-4">
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-xs text-muted line-through">{displayPrice(pack.originalPrice, locale)}</div>
                  <div className="text-xs text-muted">Total a pagar</div>
                </div>
                <div className="text-right">
                  {(payment === "usdt" || payment === "transferencia") && payTotal < pack.price && (
                    <div className="text-xs line-through text-muted">{displayPrice(pack.price, locale)}</div>
                  )}
                  <div className="text-3xl font-extrabold">{displayPrice(payTotal, locale)}</div>
                </div>
              </div>
              {payment === "transferencia" && (
                <p className="mt-1 text-right text-xs font-semibold text-success">−5% por transferencia 🏦</p>
              )}
              {payment === "usdt" && (
                <p className="mt-1 text-right text-xs font-semibold text-success">
                  −{Math.round(CRYPTO_DISCOUNT * 100)}% pagando en cripto 🪙
                </p>
              )}
            </div>

            {/* Garantía */}
            <div className="mt-4 rounded-xl border border-success/30 bg-success/5 p-4">
              <p className="flex items-center gap-2 text-sm font-semibold text-success">
                🛡️ Garantía de reposición incluida
              </p>
              <p className="mt-1 text-xs text-muted">
                Si algo cae, lo reponemos sin costo. 🔒 Pago seguro · Nunca pedimos tu contraseña.
              </p>
            </div>

            {error && (
              <p className="mt-3 rounded-lg bg-warning/10 px-3 py-2 text-sm text-warning">{error}</p>
            )}

            <button
              type="submit"
              disabled={submitting || !payment}
              className="brand-gradient mt-4 w-full rounded-full py-4 text-base font-bold shadow-lg shadow-brand/30 transition-transform hover:scale-[1.02] disabled:opacity-60"
            >
              {submitting ? "Procesando..." : !payment ? "Elegí un método de pago" : "Comprar YA →"}
            </button>
            <p className="mt-3 text-center text-xs text-muted">
              🔒 Pago seguro · Garantía incluida · Sin contraseña
            </p>
          </div>
        </div>

        {/* ── Barra fija mobile ── */}
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-[#0a0a0b]/95 px-4 py-3 backdrop-blur lg:hidden">
          {error && (
            <p className="mb-2 rounded-lg bg-warning/10 px-3 py-1.5 text-center text-xs font-medium text-warning">
              {error}
            </p>
          )}
          <div className="flex items-center gap-3">
            <div className="leading-tight">
              <div className="text-[10px] text-muted line-through">{displayPrice(pack.originalPrice, locale)}</div>
              <div className="text-lg font-extrabold">{displayPrice(payTotal, locale)}</div>
            </div>
            <button
              type="submit"
              disabled={submitting || !payment}
              className="brand-gradient ml-auto flex-1 rounded-full py-3 text-center font-bold shadow-lg disabled:opacity-60"
            >
              {submitting ? "Procesando..." : !payment ? "Elegí método de pago" : "Comprar YA →"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
