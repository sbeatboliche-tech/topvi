import { notFound } from "next/navigation";
import { isLocale, getDict, locales } from "@/lib/i18n";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SupportChat from "@/components/SupportChat";
import AnnouncementBar from "@/components/AnnouncementBar";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDict(locale);

  return (
    <>
      <AnnouncementBar />
      <Header locale={locale} dict={dict} />
      <main className="page-enter flex-1">{children}</main>
      <Footer locale={locale} dict={dict} />
      <SupportChat locale={locale} />
    </>
  );
}
