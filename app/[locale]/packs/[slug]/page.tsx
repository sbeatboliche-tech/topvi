import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { packs, getPack } from "@/lib/config";
import { isLocale, locales, type Locale } from "@/lib/i18n";
import PackOrder from "./PackOrder";

export function generateStaticParams() {
  return locales.flatMap((locale) =>
    packs.map((p) => ({ locale, slug: p.slug }))
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const pack = getPack(slug);
  return { title: pack ? `${pack.name} · TopViral` : "404" };
}

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const pack = getPack(slug);
  if (!pack || !isLocale(locale)) notFound();
  return <PackOrder slug={pack.slug} locale={locale as Locale} />;
}
