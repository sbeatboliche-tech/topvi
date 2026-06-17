import Link from "next/link";
import { notFound } from "next/navigation";
import {
  services,
  platformInfo,
  type Platform,
  type ServiceKind,
} from "@/lib/config";
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

  // Color de marca por plataforma, usado SOLO como acento fino.
  const accent: Record<Platform, string> = {
    instagram: "#e1306c",
    tiktok: "#25f4ee",
  };

  // Una línea de copy por tipo de servicio: qué hace, en simple.
  const blurb: Record<ServiceKind, string> = {
    followers: "Más seguidores en tu perfil",
    likes: "Likes en tus publicaciones",
    views: "Reproducciones en tus videos",
    shares: "Más alcance con compartidos",
    saves: "Guardados que mejoran tu posición",
  };

  const fromPrice = (pf: Platform) =>
    Math.min(
      ...services.filter((s) => s.platform === pf).map((s) => s.tiers[0].price)
    );

  return (
    <div className="mx-auto max-w-5xl px-5 py-14 sm:py-20">
      {/* ───── Encabezado ───── */}
      <header className="mb-16 max-w-2xl">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-xs font-medium text-white/70 backdrop-blur">
          <span className="text-green-400">▲</span>
          Instagram &amp; TikTok
        </div>
        <h1 className="text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl">
          {t.servicesPage.title}
        </h1>
        <p className="mt-4 text-lg text-muted">{t.servicesPage.sub}</p>
      </header>

      {/* ───── Una sección por plataforma ───── */}
      <div className="space-y-16">
        {platforms.map((pf) => {
          const svs = services.filter((s) => s.platform === pf);
          return (
            <section key={pf} id={pf} className="scroll-mt-24">
              {/* Cabecera de plataforma: barra de acento + nombre grande */}
              <div className="mb-6 flex items-end justify-between border-b border-border pb-4">
                <div className="flex items-center gap-3">
                  <span
                    aria-hidden
                    className="h-7 w-1 rounded-full"
                    style={{ backgroundColor: accent[pf] }}
                  />
                  <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                    {platformInfo[pf].label}
                  </h2>
                </div>
                <span className="text-sm text-muted">
                  {svs.length} servicios · {t.servicesPage.from}{" "}
                  <span className="font-semibold text-foreground">
                    {displayPrice(fromPrice(pf), locale)}
                  </span>
                </span>
              </div>

              {/* Servicios */}
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {svs.map((s) => (
                  <Link
                    key={s.slug}
                    href={`/${locale}/servicios/${s.slug}`}
                    className="group relative overflow-hidden rounded-2xl border border-border bg-surface p-5 transition-colors hover:border-white/25 hover:bg-surface-2"
                  >
                    {/* Acento que aparece al pasar el mouse */}
                    <span
                      aria-hidden
                      className="absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100"
                      style={{ backgroundColor: accent[pf] }}
                    />
                    <div className="flex items-start justify-between">
                      <span className="text-2xl">{s.emoji}</span>
                      <span className="text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-foreground">
                        →
                      </span>
                    </div>
                    <h3 className="mt-4 text-lg font-semibold">{s.short}</h3>
                    <p className="mt-0.5 text-sm text-muted">{blurb[s.kind]}</p>
                    <div className="mt-5 flex items-baseline gap-1.5">
                      <span className="text-xs text-muted">
                        {t.servicesPage.from}
                      </span>
                      <span className="text-base font-bold">
                        {displayPrice(s.tiers[0].price, locale)}
                      </span>
                      <span className="text-xs text-muted">
                        · {formatNum(s.tiers[0].quantity, locale)} {s.unit}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
