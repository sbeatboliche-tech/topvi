import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { services, getService } from "@/lib/config";
import { isLocale, getDict, fmt, locales, type Locale } from "@/lib/i18n";
import ServiceOrder from "./ServiceOrder";
import TrialBanner from "@/components/TrialBanner";

export function generateStaticParams() {
  return locales.flatMap((locale) =>
    services.map((s) => ({ locale, slug: s.slug }))
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const svc = getService(slug);
  if (!svc || !isLocale(locale)) return { title: "404" };
  const t = getDict(locale as Locale);
  return {
    title: fmt(t.order.title, { svc: svc.title }),
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const svc = getService(slug);
  if (!svc || !isLocale(locale)) notFound();
  return (
    <>
      {svc.slug === "instagram-likes" && <div className="mx-auto max-w-6xl px-4 pt-8"><TrialBanner /></div>}
      <ServiceOrder slug={svc.slug} locale={locale as Locale} />
    </>
  );
}
