import Link from "next/link";
import { notFound } from "next/navigation";
import { services, platformInfo, type Platform } from "@/lib/config";
import { getDict, isLocale, displayPrice, formatNum, type Locale } from "@/lib/i18n";

export default async function ServiciosIndex({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: l } = await params;
  if (!isLocale(l)) notFound();
  const locale = l as Locale;
  const t = getDict(locale);
  const platforms: Platform[] = ["instagram", "tiktok"];

  // Precio "desde" más barato de cada plataforma para el card destacado.
  const fromPrice = (pf: Platform) =>
    Math.min(
      ...services.filter((s) => s.platform === pf).map((s) => s.tiers[0].price)
    );

  // Identidad visual por plataforma (sólo en los cards de arriba).
  const platformStyle: Record<
    Platform,
    { card: string; chip: string; glow: string }
  > = {
    instagram: {
      card: "bg-gradient-to-br from-[#feda75] via-[#d62976] to-[#4f5bd5]",
      chip: "bg-white/20 text-white",
      glow: "shadow-[0_20px_60px_-15px_rgba(214,41,118,0.55)]",
    },
    tiktok: {
      card: "bg-[#0b0b0d] ring-1 ring-white/10",
      chip: "bg-white/10 text-white",
      glow: "shadow-[0_20px_60px_-15px_rgba(37,244,238,0.35)]",
    },
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      {/* ───── Encabezado: dejá claro al instante qué se vende ───── */}
      <div className="mb-10 text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-medium text-white/80 backdrop-blur">
          <span className="text-green-400">▲</span>
          Crecé en Instagram & TikTok
        </div>
        <h1 className="text-balance text-3xl font-bold leading-tight md:text-5xl">
          {t.servicesPage.title}
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-muted">{t.servicesPage.sub}</p>
      </div>

      {/* ───── Dos plataformas grandes y visuales ───── */}
      <div className="mb-14 grid gap-5 md:grid-cols-2">
        {platforms.map((pf) => {
          const st = platformStyle[pf];
          const svs = services.filter((s) => s.platform === pf);
          return (
            <a
              key={pf}
              href={`#${pf}`}
              className={`group relative overflow-hidden rounded-3xl p-7 text-white transition-transform hover:scale-[1.015] ${st.card} ${st.glow}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{platformInfo[pf].emoji}</span>
                  <span className="text-2xl font-bold">
                    {platformInfo[pf].label}
                  </span>
                </div>
                <span className="text-2xl transition-transform group-hover:translate-x-1">
                  →
                </span>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {svs.map((s) => (
                  <span
                    key={s.slug}
                    className={`rounded-full px-3 py-1 text-sm font-medium backdrop-blur ${st.chip}`}
                  >
                    {s.emoji} {s.short}
                  </span>
                ))}
              </div>

              <p className="mt-6 text-sm text-white/80">
                {svs.length} servicios · {t.servicesPage.from}{" "}
                <span className="font-bold text-white">
                  {displayPrice(fromPrice(pf), locale)}
                </span>
              </p>
            </a>
          );
        })}
      </div>

      {/* ───── Detalle por plataforma ───── */}
      {platforms.map((pf) => (
        <section key={pf} id={pf} className="mb-12 scroll-mt-24">
          <h2 className="mb-5 flex items-center gap-2 text-2xl font-bold">
            <span>{platformInfo[pf].emoji}</span> {platformInfo[pf].label}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {services
              .filter((s) => s.platform === pf)
              .map((s) => (
                <Link
                  key={s.slug}
                  href={`/${locale}/servicios/${s.slug}`}
                  className="group rounded-2xl border border-border bg-surface p-6 transition-all hover:border-brand hover:bg-surface-2"
                >
                  <div className="text-3xl">{s.emoji}</div>
                  <h3 className="mt-3 text-lg font-semibold">{s.short}</h3>
                  <p className="mt-1 text-sm text-muted">
                    {t.servicesPage.from} {formatNum(s.tiers[0].quantity, locale)}{" "}
                    {s.unit}
                  </p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-sm text-muted">
                      {t.servicesPage.from}{" "}
                      <span className="font-semibold text-accent">
                        {displayPrice(s.tiers[0].price, locale)}
                      </span>
                    </span>
                    <span className="text-brand-2 transition-transform group-hover:translate-x-1">
                      →
                    </span>
                  </div>
                </Link>
              ))}
          </div>
        </section>
      ))}
    </div>
  );
}
