import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { services, getService } from "@/lib/config";
import { isLocale, getDict, fmt, locales, type Locale } from "@/lib/i18n";
import ServiceOrder from "./ServiceOrder";

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
  searchParams,
}: {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<{ qty?: string; q?: string; promo?: string }>;
}) {
  const { locale, slug } = await params;
  const { qty, q, promo } = await searchParams;
  const svc = getService(slug);
  if (!svc || !isLocale(locale)) notFound();
  const initialQty = qty ? Number(qty) : undefined;
  const initialQuality = q === "premium" || q === "global" ? q : undefined;
  return (
    <>
      <ServiceOrder
        slug={svc.slug}
        locale={locale as Locale}
        initialQty={initialQty}
        initialQuality={initialQuality}
        coupon={promo}
      />
    </>
  );
}
