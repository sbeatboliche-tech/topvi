import Link from "next/link";
import { site, getService, packs } from "@/lib/config";
import { isLocale, displayPrice, formatNum, type Locale } from "@/lib/i18n";
import { getHomeCopy } from "@/lib/home-copy";
import { notFound } from "next/navigation";
import LiveFeed from "@/components/LiveFeed";
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
      {/* ════════════════════════════════════════
          HERO
      ════════════════════════════════════════ */}
      <section className="hero-bg relative overflow-hidden px-4 pb-20 pt-14 text-center">
        <div className="relative mx-auto max-w-3xl">
          {/* Eyebrow con el motivo ▲ de la marca */}
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-medium text-white/80 backdrop-blur">
            <span className="text-green-400">▲</span>
            Crecimiento real en Instagram & TikTok
          </div>

          {/* Rating */}
          <div className="mb-6 flex items-center justify-center gap-2 text-sm text-white/70">
            <span className="flex gap-0.5 text-yellow-400">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-3.5 w-3.5 fill-current" />
              ))}
            </span>
            4.9/5 · +2.200 reseñas reales
          </div>

          {/* Headline */}
          <h1 className="text-balance text-4xl font-bold leading-[1.05] tracking-tight text-white md:text-6xl">
            Más seguidores, más confianza,{" "}
            <span className="text-white/90">más ventas</span>
          </h1>

          {/* Subheadline */}
          <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-white/60">
            Un perfil con volumen genera confianza al instante y convierte visitas en clientes. Sin contraseñas, sin riesgo.
          </p>

          {/* CTAs */}
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href={p("/servicios")}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-8 py-4 text-base font-bold text-gray-900 shadow-lg transition-transform hover:scale-[1.02] sm:w-auto"
            >
              Empezá a crecer →
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

          {/* Stats */}
          <div className="mt-10 flex flex-wrap justify-center gap-2">
            {[
              { icon: "👥", text: "5.000 clientes en todo el mundo" },
              { icon: "✅", text: "+12.500 órdenes completadas" },
              { icon: "🏆", text: "Agencia #1 en crecimiento digital" },
              { icon: "⚡", text: "Entrega total en menos de 4 hs" },
            ].map((s) => (
              <span
                key={s.text}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/75"
              >
                {s.icon} {s.text}
              </span>
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
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-white text-sm font-bold text-[#0a0a0b]">
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
            {/* Después */}
            <div className="rounded-2xl border-2 border-white/80 bg-white/[0.06] p-6 shadow-xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#0a0a0b]">
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
              const items = [
                `${formatNum(bundle.followers, locale)} Seguidores`,
                `${formatNum(bundle.likes, locale)} Likes`,
                `${formatNum(bundle.views, locale)} Vistas Reels`,
              ];
              return (
                <div
                  key={bundle.slug}
                  className={`relative flex flex-col rounded-2xl border p-6 transition-all duration-200 hover:-translate-y-1 ${
                    bundle.badge
                      ? "border-white/40 bg-white/[0.07] shadow-xl"
                      : "border-white/10 bg-white/[0.04]"
                  }`}
                >
                  {bundle.badge && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-white px-4 py-1 text-xs font-bold text-[#0a0a0b]">
                      🔥 {bundle.badge}
                    </div>
                  )}
                  <div className="mb-2 text-3xl">{bundle.emoji}</div>
                  <h3 className="text-lg font-bold text-white">{bundle.name}</h3>
                  <ul className="mt-3 flex flex-col gap-1.5">
                    {items.map((item) => (
                      <li key={item} className="flex items-center gap-2 text-sm text-white/75">
                        <span className="text-green-400">✓</span> {item}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-5">
                    <span className="text-sm text-white/40 line-through">
                      {displayPrice(bundle.originalPrice, locale)}
                    </span>
                    <div className="text-3xl font-extrabold text-white">
                      {displayPrice(bundle.price, locale)}
                    </div>
                  </div>
                  <Link
                    href={p(`/packs/${bundle.slug}`)}
                    className={`mt-5 rounded-full py-3 text-center text-sm font-bold transition-colors ${
                      bundle.badge
                        ? "bg-white text-[#0a0a0b] hover:bg-white/90"
                        : "border border-white/20 text-white hover:bg-white/10"
                    }`}
                  >
                    Quiero este pack →
                  </Link>
                </div>
              );
            })}
          </div>
          <p className="mt-6 text-center text-xs text-white/40">
            ✓ Incluye garantía de reposición · ✓ Sin contraseña · ✓ Entrega total en menos de 4 hs
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
              <div key={r.name} className={`${card} p-5`}>
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
          CTA FINAL — tarjeta blanca (momento de contraste)
      ════════════════════════════════════════ */}
      <section className={`${dark1} px-4 py-14 md:py-20`}>
        <div className="mx-auto max-w-2xl rounded-3xl bg-white px-6 py-12 text-center text-gray-900 sm:px-8 sm:py-14">
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
            Sin contraseña · Entrega total en menos de 4 hs · Garantía incluida
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
            className="ml-auto flex-1 rounded-full bg-white py-3 text-center font-bold text-[#0a0a0b]"
          >
            Empezá a crecer
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
