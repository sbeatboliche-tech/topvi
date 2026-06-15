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

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold md:text-4xl">{t.servicesPage.title}</h1>
        <p className="mt-2 text-muted">{t.servicesPage.sub}</p>
      </div>

      {platforms.map((pf) => (
        <section key={pf} className="mb-12">
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
