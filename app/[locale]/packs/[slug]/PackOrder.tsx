"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getPack,
  MAX_PACK_POSTS,
  applyPaymentDiscount,
  CRYPTO_DISCOUNT,
} from "@/lib/config";
import { displayPrice, formatNum, localeConfig, localAmount, type Locale } from "@/lib/i18n";
import { fbqTrack } from "@/lib/fbq";

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
  // Sin método preseleccionado cuando hay varias opciones: el cliente elige.
  const [payment, setPayment] = useState<"mercadopago" | "tarjeta" | "usdt" | "">(
    mpAvailable ? "" : "usdt"
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const userRef = useRef<HTMLInputElement>(null);
  const postsRef = useRef<HTMLDivElement>(null);
  const contactRef = useRef<HTMLInputElement>(null);

  const filledPosts = posts.map((p) => p.trim()).filter(Boolean);
  // Total a pagar (con descuento si elige cripto). Se recalcula en el server.
  const payTotal = applyPaymentDiscount(pack.price, payment);

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
        service: pack.slug,
        source: "pack",
      }),
    }).catch(() => {});
  }

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
    { emoji: "👥", label: "Seguidores", n: pack.followers },
    { emoji: "❤️", label: "Likes", n: pack.likes },
    { emoji: "▶️", label: "Vistas", n: pack.views },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="mb-8 text-center">
        <div className="mb-2 text-4xl">{pack.emoji}</div>
        <h1 className="text-3xl font-bold md:text-4xl">
          {pack.name}
        </h1>
        <p className="mt-2 text-muted">
          Instagram · Entrega rápida · Sin contraseña
        </p>
        {pack.badge && (
          <span className="mt-3 inline-block rounded-full bg-brand px-3 py-1 text-xs font-bold text-white">
            🔥 {pack.badge}
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit} className="grid gap-6 pb-28 lg:grid-cols-[1fr_380px] lg:pb-0">
        <div className="space-y-6">
          {/* Qué incluye */}
          <div className="rounded-2xl border border-border bg-surface p-6">
            <h2 className="mb-4 font-semibold">El pack incluye</h2>
            <div className="grid grid-cols-3 gap-3">
              {includes.map((it) => (
                <div
                  key={it.label}
                  className="rounded-xl border border-border bg-surface-2 p-3 text-center"
                >
                  <div className="text-2xl">{it.emoji}</div>
                  <div className="mt-1 text-lg font-bold">
                    {formatNum(it.n, locale)}
                  </div>
                  <div className="text-xs text-muted">{it.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* 1. Usuario */}
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
              ⚠️ Importante: tu cuenta debe estar en PÚBLICO mientras hacemos la
              entrega. Apenas termina, podés volver a ponerla en privado sin
              problema.
            </div>
          </div>

          {/* 2. Posteos para likes/vistas */}
          <div ref={postsRef} className="rounded-2xl border border-border bg-surface p-6">
            <h2 className="mb-1 font-semibold">
              2. ¿En qué posteos querés los likes y vistas?
            </h2>
            <p className="mb-4 text-sm text-muted">
              Repartimos los {formatNum(pack.likes, locale)} likes y{" "}
              {formatNum(pack.views, locale)} vistas entre los links que cargues
              (hasta {MAX_PACK_POSTS}). Pegá reels o publicaciones.
            </p>
            <div className="space-y-3">
              {posts.map((post, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="w-5 shrink-0 text-center text-sm text-muted">
                    {i + 1}
                  </span>
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

          {/* 3. Contacto */}
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

          {/* 4. Pago */}
          <div className="rounded-2xl border border-border bg-surface p-6">
            <h2 className="mb-4 font-semibold">4. Método de pago</h2>
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
                  <p className="mt-1 text-xs text-muted">
                    Tarjeta o dinero en cuenta. Pagá en cuotas.
                  </p>
                  <p className="mt-1.5 text-xs font-semibold text-success">
                    💳 3 cuotas SIN interés
                  </p>
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
                  <p className="mt-1 text-xs text-muted">
                    Pagá con tu tarjeta acá mismo, sin salir de la web.
                  </p>
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
                <p className="mt-1 text-xs text-muted">
                  Pago en cripto (USDT). Te pasamos la wallet al confirmar.
                </p>
              </button>
            </div>
          </div>
        </div>

        {/* Resumen */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-border bg-surface p-6">
            <h2 className="mb-4 font-semibold">Resumen</h2>
            <dl className="space-y-2 text-sm">
              {includes.map((it) => (
                <div key={it.label} className="flex justify-between">
                  <dt className="text-muted">
                    {it.emoji} {it.label}
                  </dt>
                  <dd className="font-medium">{formatNum(it.n, locale)}</dd>
                </div>
              ))}
              <div className="flex justify-between border-t border-border pt-2">
                <dt className="text-muted">Posteos cargados</dt>
                <dd className="font-medium">{filledPosts.length}</dd>
              </div>
            </dl>

            <div className="mt-4 flex items-end justify-between border-t border-border pt-4">
              <div>
                <span className="block text-xs text-muted line-through">
                  {displayPrice(pack.originalPrice, locale)}
                </span>
                <span className="text-muted">Precio</span>
              </div>
              <span className="text-2xl font-extrabold">
                {displayPrice(payTotal, locale)}
              </span>
            </div>
            {payment === "usdt" && (
              <p className="mt-1 text-right text-xs font-semibold text-success">
                −{Math.round(CRYPTO_DISCOUNT * 100)}% pagando en cripto 🪙
              </p>
            )}

            {error && (
              <p className="mt-3 rounded-lg bg-warning/10 px-3 py-2 text-sm text-warning">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting || !payment}
              className="brand-gradient mt-4 w-full rounded-full py-3.5 font-semibold text-white shadow-lg shadow-brand/30 transition-transform hover:scale-[1.02] disabled:opacity-60"
            >
              {submitting ? "Procesando..." : !payment ? "Elegí un método de pago" : "Pagar y comprar"}
            </button>
            <p className="mt-3 text-center text-xs text-muted">
              🔒 Pago seguro · Sin contraseña · Garantía incluida
            </p>
          </div>
        </div>

        {/* Barra fija mobile */}
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 px-4 py-3 backdrop-blur lg:hidden">
          {error && (
            <p className="mb-2 rounded-lg bg-warning/10 px-3 py-1.5 text-center text-xs font-medium text-warning">
              {error}
            </p>
          )}
          <div className="flex items-center gap-3">
            <div className="leading-tight">
              <div className="text-[10px] uppercase text-muted">Precio</div>
              <div className="text-lg font-extrabold">
                {displayPrice(payTotal, locale)}
              </div>
            </div>
            <button
              type="submit"
              disabled={submitting || !payment}
              className="brand-gradient ml-auto flex-1 rounded-full py-3 text-center font-semibold text-white shadow-lg shadow-brand/30 disabled:opacity-60"
            >
              {submitting ? "Procesando..." : !payment ? "Elegí un método de pago" : "Pagar y comprar"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
