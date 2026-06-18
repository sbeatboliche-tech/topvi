import Link from "next/link";
import { notFound } from "next/navigation";
import {
  services,
  platformInfo,
  site,
  anchorPrice,
  type Platform,
  type ServiceKind,
} from "@/lib/config";
import { getDict, isLocale, displayPrice, formatNum, type Locale } from "@/lib/i18n";
import { getHomeCopy } from "@/lib/home-copy";
import LiveFeed from "@/components/LiveFeed";
import Track from "@/components/Track";

export default async function ServiciosIndex({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: l } = await params;
  if (!isLocale(l)) notFound();
  const locale = l as Locale;
  const t = getDict(locale);
  const c = getHomeCopy(locale);
  const platforms: Platform[] = ["instagram", "tiktok"];

  const accent: Record<Platform, string> = {
    instagram: "#e1306c",
    tiktok: "#25f4ee",
  };

  const blurb: Record<ServiceKind, string> = {
    followers: "Más seguidores = más confianza y ventas",
    likes: "Más me gusta = más alcance en cada posteo",
    views: "Reproducciones que disparan tu video",
    shares: "Compartidos que multiplican tu alcance",
    saves: "Guardados que mejoran tu posición",
  };

  return (
    <div className="mx-auto max-w-5xl px-5 py-12 sm:py-16">
      <Track stage="servicios" />
      {/* ───── Encabezado con prueba social ───── */}
      <header className="mb-12 text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-medium text-white/80 backdrop-blur">
          <span className="text-yellow-400">★★★★★</span>
          4.9/5 · +2.200 reseñas reales
        </div>
        <h1 className="text-balance text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl">
          Elegí cómo querés crecer
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-muted">
          {t.servicesPage.sub}
        </p>
        {/* Sellos de confianza */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          {[
            "🔒 Sin contraseña",
            "🛡️ Con garantía",
            "⚡ Entrega < 4 hs",
            `👥 +${site.stats.clientes} clientes`,
          ].map((chip) => (
            <span
              key={chip}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/75"
            >
              {chip}
            </span>
          ))}
        </div>
      </header>

      {/* ───── Una sección por plataforma ───── */}
      <div className="space-y-14">
        {platforms.map((pf) => {
          const svs = services.filter((s) => s.platform === pf);
          return (
            <section key={pf} id={pf} className="scroll-mt-24">
              <div className="mb-6 flex items-center gap-3">
                <span
                  aria-hidden
                  className="flex h-9 w-9 items-center justify-center rounded-xl text-lg"
                  style={{ backgroundColor: `${accent[pf]}22` }}
                >
                  {platformInfo[pf].emoji}
                </span>
                <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  {platformInfo[pf].label}
                </h2>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {svs.map((s) => {
                  const price = s.tiers[0].price;
                  const before = anchorPrice(price);
                  const isTop = s.kind === "followers";
                  return (
                    <Link
                      key={s.slug}
                      href={`/${locale}/servicios/${s.slug}`}
                      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-surface p-5 transition-all duration-300 hover:-translate-y-1 hover:border-white/25 hover:shadow-xl hover:shadow-black/40"
                    >
                      {/* barra de acento superior */}
                      <span
                        aria-hidden
                        className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100"
                        style={{ backgroundColor: accent[pf] }}
                      />
                      {isTop && (
                        <span className="absolute right-4 top-4 rounded-full bg-success px-2.5 py-0.5 text-[10px] font-bold text-black">
                          MÁS VENDIDO
                        </span>
                      )}

                      <span
                        className="flex h-12 w-12 items-center justify-center rounded-xl text-2xl"
                        style={{ backgroundColor: `${accent[pf]}1f` }}
                      >
                        {s.emoji}
                      </span>

                      <h3 className="mt-4 text-lg font-bold">{s.short}</h3>
                      <p className="mt-1 text-sm leading-snug text-muted">
                        {blurb[s.kind]}
                      </p>

                      <div className="mt-auto pt-5">
                        <div className="text-[11px] uppercase tracking-wide text-muted">
                          Desde · {formatNum(s.tiers[0].quantity, locale)} {s.unit}
                        </div>
                        <div className="mt-0.5 flex items-baseline gap-2">
                          <span className="text-xl font-extrabold">
                            {displayPrice(price, locale)}
                          </span>
                          <span className="text-sm text-muted line-through">
                            {displayPrice(before, locale)}
                          </span>
                        </div>
                        <div className="brand-gradient mt-4 w-full rounded-full py-2.5 text-center text-sm font-bold transition-transform group-hover:scale-[1.02]">
                          Comprar →
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      {/* Toast flotante de compras (prueba social) */}
      <LiveFeed
        bought={c.feed.bought}
        agoText={c.feed.ago}
        names={c.feed.names}
        cities={c.feed.cities}
        services={c.feed.services}
      />

      {/* ───── Cierre / reaseguro ───── */}
      <div className="mt-14 rounded-2xl border border-border bg-surface p-6 text-center">
        <p className="text-lg font-semibold">¿Dudas antes de comprar?</p>
        <p className="mt-1 text-sm text-muted">
          Pago 100% seguro · Nunca pedimos tu contraseña · Garantía de reposición incluida
        </p>
      </div>
    </div>
  );
}
