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
        {/* Badge de precio */}
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-success/30 bg-success/10 px-4 py-1.5 text-xs font-bold text-success">
          🔥 El mejor precio del mercado · garantizado
        </div>

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
            "🇦🇷 #1 en Argentina",
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

      {/* Reaseguro final */}
      <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-center text-xs text-white/50">
        🛡️ Garantía de reposición · 🔒 Sin contraseña · ⚡ Entrega &lt; 3 hs · 💳 Pagás seguro
      </div>
    </div>
  );
}
