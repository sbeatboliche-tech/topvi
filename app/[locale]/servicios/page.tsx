import { notFound } from "next/navigation";
import { site } from "@/lib/config";
import { isLocale, type Locale } from "@/lib/i18n";
import Track from "@/components/Track";
import ServiciosGrid from "@/components/ServiciosGrid";

export default async function ServiciosIndex({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: l } = await params;
  if (!isLocale(l)) notFound();
  const locale = l as Locale;

  return (
    <div className="mx-auto max-w-lg px-4 py-10 sm:py-14">
      <Track stage="servicios" />

      <header className="mb-7 text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          ¿Qué querés impulsar?
        </h1>
        <p className="mt-2 text-sm text-muted">
          Sin contraseña · Entrega en menos de 3 hs · Garantía incluida
        </p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs">
          {[
            `👥 +${site.stats.clientes} clientes`,
            "⭐ 4.9/5",
            "🔒 100% seguro",
          ].map((chip) => (
            <span
              key={chip}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 font-medium text-white/70"
            >
              {chip}
            </span>
          ))}
        </div>
      </header>

      <ServiciosGrid locale={locale} />
    </div>
  );
}
