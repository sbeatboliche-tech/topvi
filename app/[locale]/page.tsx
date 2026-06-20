import Link from "next/link";
import { site, getService, packs } from "@/lib/config";
import { isLocale, displayPrice, formatNum, type Locale } from "@/lib/i18n";
import { getHomeCopy } from "@/lib/home-copy";
import { notFound } from "next/navigation";
import LiveFeed from "@/components/LiveFeed";
import Track from "@/components/Track";
import { Star } from "lucide-react";

// ── Prueba social / algoritmo ─────────────────────────────────
const PROOF_ITEMS = [
  {
    emoji: "🧲",
    title: "Efecto Arrastre",
    desc: "La gente sigue cuentas que ya sigue mucha gente. Un perfil con seguidores atrae más seguidores orgánicos solo.",
  },
  {
    emoji: "📈",
    title: "Visibilidad",
    desc: "Más interacción = más alcance. Instagram y TikTok muestran tu contenido a más personas cuando tenés números.",
  },
  {
    emoji: "🤝",
    title: "Confianza",
    desc: "Antes de comprarte, te stalkean. Un perfil con miles de seguidores transmite seriedad y cierra ventas.",
  },
  {
    emoji: "❄️",
    title: "Efecto Bola de Nieve",
    desc: "El crecimiento inicial genera crecimiento orgánico sostenido. Los números impulsan el algoritmo de forma exponencial.",
  },
];

// ── Colores para avatares de testimonios ─────────────────────
const AVATAR_COLORS = ["#e0457b", "#7c3aed", "#0891b2", "#16a34a", "#ea580c", "#f59e0b"];

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: l } = await params;
  if (!isLocale(l)) notFound();
  const locale = l as Locale;
  const c = getHomeCopy(locale);
  const p = (path: string) => `/${locale}${path}`;

  const followers = getService("instagram-seguidores")!;
  const from = displayPrice(followers.tiers[0].price, locale);

  // Tonos oscuros alternados para dar ritmo sin romper la unidad.
  const dark1 = "bg-[#0a0a0b]";
  const dark2 = "bg-[#0f0f11]";
  const card = "rounded-2xl border border-white/10 bg-white/[0.04]";

  return (
    <div className="bg-[#0a0a0b]">
      <Track stage="home" />
      {/* ════════════════════════════════════════
          HERO
      ════════════════════════════════════════ */}
      <section className="hero-bg relative overflow-hidden px-4 pb-20 pt-14 text-center">
        {/* Glows IG — más grandes y saturados para dar identidad de marca */}
        <div aria-hidden className="pointer-events-none absolute -left-48 -top-10 h-[500px] w-[500px] rounded-full bg-[#e1306c] opacity-[0.13] blur-[100px]" />
        <div aria-hidden className="pointer-events-none absolute -right-40 bottom-10 h-[420px] w-[420px] rounded-full bg-[#833ab4] opacity-[0.11] blur-[90px]" />
        <div aria-hidden className="pointer-events-none absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-[#5851db] opacity-[0.06] blur-[70px]" />
        <div className="relative mx-auto max-w-3xl">
          {/* Eyebrow con el motivo ▲ de la marca */}
          <div
            className="reveal mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/[0.06] px-4 py-1.5 text-xs font-semibold text-white/90 backdrop-blur-md shadow-sm"
            style={{ animationDelay: "0ms" }}
          >
            <span className="flex h-1.5 w-1.5 rounded-full bg-green-400 shadow-[0_0_6px_rgba(74,222,128,0.8)]" />
            🇦🇷 Crecimiento real en Instagram & TikTok
          </div>

          {/* Rating */}
          <div
            className="reveal mb-6 flex items-center justify-center gap-2 text-sm text-white/70"
            style={{ animationDelay: "70ms" }}
          >
            <span className="flex gap-0.5 text-yellow-400">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-3.5 w-3.5 fill-current" />
              ))}
            </span>
            4.9/5 · +570 reseñas reales
          </div>

          {/* Headline */}
          <h1
            className="reveal text-balance text-5xl font-bold leading-[1.02] tracking-tight text-white md:text-7xl"
            style={{ animationDelay: "140ms" }}
          >
            Más seguidores,{" "}
            <br className="hidden md:block" />
            más confianza,{" "}
            <span className="ig-gradient-text">más ventas.</span>
          </h1>

          {/* Subheadline */}
          <p
            className="reveal mx-auto mt-5 max-w-xl text-lg leading-relaxed text-white/60"
            style={{ animationDelay: "210ms" }}
          >
            Un perfil con volumen genera confianza al instante y convierte visitas en clientes. Sin contraseñas, sin riesgo.
          </p>

          {/* CTAs */}
          <div
            className="reveal mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
            style={{ animationDelay: "280ms" }}
          >
            <Link
              href={p("/servicios")}
              className="cta-pulse inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-9 py-4 text-lg font-extrabold text-gray-900 shadow-lg transition-transform hover:scale-[1.03] sm:w-auto"
            >
              Comprar YA →
            </Link>
            <Link
              href={p("/como-funciona")}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/20 px-8 py-4 text-base font-semibold text-white transition-colors hover:bg-white/10 sm:w-auto"
            >
              ¿Cómo funciona?
            </Link>
          </div>
          <p className="mt-4 text-xs text-white/40">
            Sin contraseña · Pago 100% seguro · Desde {from}
          </p>

          {/* Stats grid — cuatro números grandes con peso visual */}
          <div
            className="reveal mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4"
            style={{ animationDelay: "350ms" }}
          >
            {[
              { num: "+700", label: "Clientes activos" },
              { num: "7.500+", label: "Órdenes completadas" },
              { num: "+570", label: "Reseñas verificadas" },
              { num: "10 min", label: "Entrega promedio" },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-center"
              >
                <div className="text-2xl font-extrabold tracking-tight text-white">{s.num}</div>
                <div className="mt-1 text-xs text-white/45">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          PENSADO PARA CADA NICHO
      ════════════════════════════════════════ */}
      <section className={`${dark2} border-y border-white/5 px-4 py-12 md:py-16`}>
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-2 text-center text-3xl font-bold text-white">
            {c.niches.title}
          </h2>
          <p className="mb-8 text-center text-white/55">{c.niches.sub}</p>
          <div className="no-scrollbar grid grid-flow-col grid-rows-2 gap-2 overflow-x-auto pb-2 md:flex md:flex-wrap md:justify-center md:overflow-visible">
            {c.niches.items.map((n) => (
              <span
                key={n}
                className="whitespace-nowrap rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/75"
              >
                {n}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          TRES PASOS
      ════════════════════════════════════════ */}
      <section className={`${dark1} px-4 py-12 md:py-16`}>
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-2 text-center text-3xl font-bold text-white">
            {c.steps.title}
          </h2>
          <p className="mb-10 text-center text-white/55">{c.steps.sub}</p>
          <div className="grid gap-6 md:grid-cols-3">
            {c.steps.items.map((step, i) => (
              <div key={step.title} className={`relative ${card} p-6 text-center`}>
                <div
                  className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white"
                  style={{ background: "linear-gradient(135deg, #e1306c, #833ab4)" }}
                >
                  {i + 1}
                </div>
                <div className="mb-2 text-3xl">{step.emoji}</div>
                <h3 className="font-bold text-white">{step.title}</h3>
                <p className="mt-1.5 text-sm text-white/55">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          ANTES / DESPUÉS
      ════════════════════════════════════════ */}
      <section className={`${dark2} border-y border-white/5 px-4 py-12 md:py-16`}>
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-2 text-center text-3xl font-bold text-white">
            La diferencia se nota
          </h2>
          <p className="mb-8 text-center text-white/55">
            Lo que cambia en tu perfil cuando dejás de pasar desapercibido.
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            {/* Antes */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white/60">
                Antes
              </div>
              <ul className="flex flex-col gap-3">
                {[
                  "Perfil con pocos seguidores y poca credibilidad",
                  "Publicaciones con 4 o 5 likes",
                  "El algoritmo no te muestra a nadie nuevo",
                  "Clientes que dudan antes de escribirte",
                ].map((t) => (
                  <li key={t} className="flex items-start gap-2.5 text-sm text-white/50">
                    <span className="mt-0.5 text-red-400">✕</span> {t}
                  </li>
                ))}
              </ul>
            </div>
            {/* Después — gradient border premium */}
            <div
              className="relative rounded-2xl p-px shadow-2xl"
              style={{ background: "linear-gradient(135deg, #e1306c, #833ab4, #5851db)" }}
            >
              <div className="h-full rounded-2xl bg-[#0f0f11] p-6">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide text-white" style={{ background: "linear-gradient(135deg, #e1306c, #833ab4)" }}>
                  ▲ Con {site.name}
                </div>
                <ul className="flex flex-col gap-3">
                  {[
                    "Perfil con volumen que impone respeto",
                    "Publicaciones con interacción real",
                    "Más alcance: el algoritmo te impulsa",
                    "Clientes que confían y te compran",
                  ].map((t) => (
                    <li key={t} className="flex items-start gap-2.5 text-sm font-medium text-white">
                      <span className="mt-0.5 text-green-400">✓</span> {t}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          PACKS DE CREDIBILIDAD
      ════════════════════════════════════════ */}
      <section className={`${dark1} px-4 py-12 md:py-16`}>
        <div className="mx-auto max-w-5xl">
          <div className="mb-2 text-center text-xs font-semibold uppercase tracking-widest text-green-400">
            ⚡ 65% de descuento por tiempo limitado
          </div>
          <h2 className="mb-2 text-center text-3xl font-bold text-white">
            Packs de credibilidad
          </h2>
          <p className="mb-10 text-center text-white/55">
            Instagram · Seguidores + Likes + Vistas. Todo lo que necesitás para dominar el feed.
          </p>
          <div className="grid gap-6 md:grid-cols-3">
            {packs.map((bundle) => {
              const isPro = !!bundle.badge;
              const discount = Math.round(((bundle.originalPrice - bundle.price) / bundle.originalPrice) * 100);
              const savings = bundle.originalPrice - bundle.price;
              // Color de acento por tier
              const accent =
                bundle.slug === "pack-starter" ? "#6366f1"
                : bundle.slug === "pack-pro"   ? "#e1306c"
                : "#f59e0b";
              const items = [
                { icon: "👥", label: `${formatNum(bundle.followers, locale)} Seguidores`, color: "#e1306c" },
                { icon: "❤️", label: `${formatNum(bundle.likes, locale)} Likes`,          color: "#f59e0b" },
                { icon: "▶️", label: `${formatNum(bundle.views, locale)} Vistas Reels`,  color: "#8b5cf6" },
              ];
              return (
                <div
                  key={bundle.slug}
                  className={`relative flex flex-col rounded-2xl border p-6 transition-all duration-300 hover:-translate-y-1 ${
                    isPro
                      ? "border-white/30 bg-white/[0.07] shadow-2xl shadow-black/50"
                      : "border-white/10 bg-white/[0.04]"
                  }`}
                  style={isPro ? { boxShadow: `0 0 40px ${accent}22, 0 20px 60px rgba(0,0,0,0.5)` } : {}}
                >
                  {/* Barra de color superior */}
                  <div
                    className="absolute inset-x-0 top-0 h-1 rounded-t-2xl"
                    style={{ background: `linear-gradient(90deg, ${accent}99, ${accent}33)` }}
                  />

                  {/* Badge */}
                  {isPro && (
                    <div
                      className="shimmer absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-4 py-1 text-xs font-bold text-white"
                      style={{ background: accent }}
                    >
                      🔥 {bundle.badge}
                    </div>
                  )}

                  {/* Header */}
                  <div className="mb-4 flex items-center gap-3 pt-2">
                    <span
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl"
                      style={{ background: `${accent}22` }}
                    >
                      {bundle.emoji}
                    </span>
                    <div>
                      <h3 className="font-bold text-white">{bundle.name}</h3>
                      <span
                        className="text-xs font-semibold"
                        style={{ color: accent }}
                      >
                        −{discount}% OFF
                      </span>
                    </div>
                  </div>

                  {/* Items */}
                  <ul className="flex flex-col gap-2">
                    {items.map((it) => (
                      <li key={it.label} className="flex items-center gap-2.5 text-sm">
                        <span
                          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-xs"
                          style={{ background: `${it.color}22` }}
                        >
                          {it.icon}
                        </span>
                        <span className="font-medium text-white/85">{it.label}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Precio */}
                  <div className="mt-5 border-t border-white/10 pt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white/35 line-through">
                        {displayPrice(bundle.originalPrice, locale)}
                      </span>
                      <span className="rounded-full bg-success/20 px-2 py-0.5 text-xs font-bold text-success">
                        Ahorrás {displayPrice(savings, locale)}
                      </span>
                    </div>
                    <div className="mt-1 text-3xl font-extrabold text-white">
                      {displayPrice(bundle.price, locale)}
                    </div>
                  </div>

                  {/* CTA */}
                  <Link
                    href={p(`/packs/${bundle.slug}`)}
                    className="mt-4 block rounded-full py-3.5 text-center text-sm font-bold transition-all hover:scale-[1.02]"
                    style={{
                      background: isPro ? accent : `${accent}22`,
                      color: isPro ? "#fff" : accent,
                      border: isPro ? "none" : `1.5px solid ${accent}44`,
                    }}
                  >
                    Quiero este pack →
                  </Link>
                </div>
              );
            })}
          </div>
          <p className="mt-6 text-center text-xs text-white/40">
            ✓ Incluye garantía de reposición · ✓ Sin contraseña · ✓ Entrega total en inmediata (10 min - 2 hs)
          </p>
        </div>
      </section>

      {/* ════════════════════════════════════════
          CONFIANZA (4 PILARES)
      ════════════════════════════════════════ */}
      <section className={`${dark2} border-y border-white/5 px-4 py-12 md:py-16`}>
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-10 text-center text-3xl font-bold text-white">
            {c.trust.title}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {c.trust.items.map((item) => (
              <div key={item.title} className={`${card} p-5`}>
                <div className="mb-3 text-3xl">{item.emoji}</div>
                <h3 className="font-bold text-white">{item.title}</h3>
                <p className="mt-1.5 text-sm text-white/55">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          TESTIMONIOS
      ════════════════════════════════════════ */}
      <section className={`${dark1} px-4 py-12 md:py-16`}>
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-2 text-center text-3xl font-bold text-white">
            {c.reviews.title}
          </h2>
          <p className="mb-10 text-center text-white/55">{c.reviews.sub}</p>
          <div className="grid gap-5 md:grid-cols-3">
            {c.reviews.items.map((r, i) => (
              <div key={r.name} className={`${card} relative p-5`}>
                {/* Quote mark decorativo */}
                <div aria-hidden className="pointer-events-none absolute right-4 top-2 select-none text-7xl font-bold leading-none text-white/[0.055]">&ldquo;</div>
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                    style={{ backgroundColor: AVATAR_COLORS[i % AVATAR_COLORS.length] }}
                  >
                    {r.name[0]}
                  </div>
                  <div>
                    <div className="font-semibold text-white">{r.name}</div>
                    <div className="text-xs text-white/50">
                      {r.city} · {r.service}
                    </div>
                  </div>
                </div>
                <div className="mt-3 text-yellow-400">★★★★★</div>
                <p className="mt-2 text-sm leading-relaxed text-white/75">"{r.text}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          NO ES MAGIA. ES PRUEBA SOCIAL.
      ════════════════════════════════════════ */}
      <section className={`${dark2} border-y border-white/5 px-4 py-12 md:py-16`}>
        <div className="mx-auto max-w-5xl">
          <div className="mb-2 text-center text-xs font-semibold uppercase tracking-widest text-green-400">
            La ciencia detrás del crecimiento
          </div>
          <h2 className="mb-2 text-center text-3xl font-bold text-white">
            No es magia. Es prueba social.
          </h2>
          <p className="mb-10 text-center text-white/55">
            Así es exactamente cómo funciona el algoritmo y la psicología del seguidor.
          </p>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {PROOF_ITEMS.map((item) => (
              <div key={item.title} className={`${card} p-5`}>
                <div className="mb-3 text-3xl">{item.emoji}</div>
                <h3 className="font-bold text-white">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/55">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          FAQ
      ════════════════════════════════════════ */}
      <section className={`${dark1} px-4 py-12 md:py-16`}>
        <div className="mx-auto max-w-2xl">
          <h2 className="mb-8 text-center text-3xl font-bold text-white">
            {c.faq.title}
          </h2>
          <div className="flex flex-col gap-2">
            {c.faq.items.map((f) => (
              <details
                key={f.q}
                className="group rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 open:border-white/20"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between font-semibold text-white [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <span className="ml-4 text-white/40 transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-white/55">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          CTA FINAL — tarjeta blanca con glow dramático
      ════════════════════════════════════════ */}
      <section className={`${dark1} relative px-4 py-14 md:py-20`}>
        {/* Glow IG detrás del card — da drama sin romper el blanco */}
        <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-[0.13] blur-[80px]" style={{ background: "linear-gradient(135deg, #e1306c, #833ab4)" }} />
        <div className="relative mx-auto max-w-2xl rounded-3xl bg-white px-6 py-12 text-center text-gray-900 shadow-2xl ring-1 ring-white/20 sm:px-8 sm:py-14">
          <h2 className="text-3xl font-extrabold md:text-4xl">
            {c.finalCta.title}
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-gray-500">{c.finalCta.sub}</p>
          <Link
            href={p("/servicios")}
            className="mt-8 inline-block rounded-full bg-gray-900 px-10 py-4 text-lg font-bold text-white transition-colors hover:bg-gray-800"
          >
            {c.finalCta.cta} →
          </Link>
          <p className="mt-3 text-xs text-gray-400">
            Sin contraseña · Entrega total en inmediata (10 min - 2 hs) · Garantía incluida
          </p>
        </div>
      </section>

      {/* ════════════════════════════════════════
          BARRA FIJA MÓVIL
      ════════════════════════════════════════ */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#0a0a0b]/95 px-4 py-3 backdrop-blur md:hidden">
        <div className="flex items-center gap-3">
          <div className="leading-tight">
            <div className="text-[10px] text-yellow-400">★★★★★ 4.9</div>
            <div className="text-base font-extrabold text-white">Desde {from}</div>
          </div>
          <Link
            href={p("/servicios")}
            className="cta-pulse ml-auto flex-1 rounded-full bg-white py-3 text-center font-extrabold text-[#0a0a0b]"
          >
            Comprar YA →
          </Link>
        </div>
      </div>
      <div className="h-16 bg-[#0a0a0b] md:hidden" />

      {/* Toast flotante de compras */}
      <LiveFeed
        bought={c.feed.bought}
        agoText={c.feed.ago}
        names={c.feed.names}
        cities={c.feed.cities}
        services={c.feed.services}
      />
    </div>
  );
}
