import Link from "next/link";
import { site } from "@/lib/config";
import type { Dict, Locale } from "@/lib/i18n";
import Logo from "./Logo";

export default function Footer({
  locale,
  dict,
}: {
  locale: Locale;
  dict: Dict;
}) {
  const p = (path: string) => `/${locale}${path}`;

  return (
    <footer className="border-t border-white/10 bg-[#0a0a0b] text-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-2 md:grid-cols-4">
        <div className="col-span-2 md:col-span-1">
          <Logo size="md" dark />
          <p className="mt-3 text-sm text-white/55">{site.tagline}</p>
          <p className="mt-2 text-xs text-white/35">🏆 3 años en el mercado</p>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-semibold">{dict.footer.services}</h4>
          <ul className="space-y-2 text-sm text-white/55">
            <li>
              <Link href={p("/servicios/instagram-seguidores")} className="hover:text-white">
                Instagram
              </Link>
            </li>
            <li>
              <Link href={p("/servicios/tiktok-seguidores")} className="hover:text-white">
                TikTok
              </Link>
            </li>
            <li>
              <Link href={p("/servicios")} className="hover:text-white">
                {dict.nav.services}
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-semibold">{dict.footer.info}</h4>
          <ul className="space-y-2 text-sm text-white/55">
            <li>
              <Link href={p("/como-funciona")} className="hover:text-white">
                {dict.nav.how}
              </Link>
            </li>
            <li>
              <Link href={p("/faq")} className="hover:text-white">
                {dict.nav.faq}
              </Link>
            </li>
            <li>
              <Link href={p("/terminos")} className="hover:text-white">
                Términos y condiciones
              </Link>
            </li>
            <li>
              <Link href={p("/privacidad")} className="hover:text-white">
                Privacidad
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-semibold">{dict.footer.contact}</h4>
          <ul className="space-y-2 text-sm text-white/55">
            <li>
              <a
                href={site.instagram}
                className="hover:text-white"
                target="_blank"
                rel="noopener noreferrer"
              >
                Instagram
              </a>
            </li>
            <li>
              <a href={`mailto:${site.email}`} className="hover:text-white">
                {site.email}
              </a>
            </li>
            <li className="text-xs">{site.horario}</li>
          </ul>
        </div>
      </div>

      {/* Medios de pago aceptados — refuerza confianza */}
      <div className="border-t border-white/10 px-4 py-4">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-2 text-[11px] font-medium text-white/55">
          <span className="mr-1 text-white/55">Pagás seguro con</span>
          {["MercadoPago", "Visa", "Mastercard", "USDT"].map((m) => (
            <span
              key={m}
              className="rounded-md border border-white/10 bg-white/5 px-2.5 py-1"
            >
              {m}
            </span>
          ))}
        </div>
      </div>

      <div className="border-t border-white/10 px-4 py-4 text-center text-xs text-white/55">
        © {new Date().getFullYear()} {site.name}. {dict.footer.rights}
        <span className="block mt-1 opacity-70">{dict.footer.legal}</span>
      </div>
    </footer>
  );
}
