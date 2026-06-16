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
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-2 md:grid-cols-4">
        <div className="col-span-2 md:col-span-1">
          <Logo size="md" />
          <p className="mt-3 text-sm text-muted">{site.tagline}</p>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-semibold">{dict.footer.services}</h4>
          <ul className="space-y-2 text-sm text-muted">
            <li>
              <Link href={p("/servicios/instagram-seguidores")} className="hover:text-foreground">
                Instagram
              </Link>
            </li>
            <li>
              <Link href={p("/servicios/tiktok-seguidores")} className="hover:text-foreground">
                TikTok
              </Link>
            </li>
            <li>
              <Link href={p("/servicios")} className="hover:text-foreground">
                {dict.nav.services}
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-semibold">{dict.footer.info}</h4>
          <ul className="space-y-2 text-sm text-muted">
            <li>
              <Link href={p("/como-funciona")} className="hover:text-foreground">
                {dict.nav.how}
              </Link>
            </li>
            <li>
              <Link href={p("/faq")} className="hover:text-foreground">
                {dict.nav.faq}
              </Link>
            </li>
            <li>
              <Link href={p("/terminos")} className="hover:text-foreground">
                Términos y condiciones
              </Link>
            </li>
            <li>
              <Link href={p("/privacidad")} className="hover:text-foreground">
                Privacidad
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-semibold">{dict.footer.contact}</h4>
          <ul className="space-y-2 text-sm text-muted">
            <li>
              <a
                href={site.instagram}
                className="hover:text-foreground"
                target="_blank"
                rel="noopener noreferrer"
              >
                Instagram
              </a>
            </li>
            <li>
              <a href={`mailto:${site.email}`} className="hover:text-foreground">
                {site.email}
              </a>
            </li>
            <li className="text-xs">{site.horario}</li>
          </ul>
        </div>
      </div>

      {/* Medios de pago aceptados — refuerza confianza */}
      <div className="border-t border-border px-4 py-4">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-2 text-[11px] font-medium text-muted">
          <span className="mr-1 text-muted">Pagás seguro con</span>
          {["MercadoPago", "Visa", "Mastercard", "USDT"].map((m) => (
            <span
              key={m}
              className="rounded-md border border-border bg-surface px-2.5 py-1"
            >
              {m}
            </span>
          ))}
        </div>
      </div>

      <div className="border-t border-border px-4 py-4 text-center text-xs text-muted">
        © {new Date().getFullYear()} {site.name}. {dict.footer.rights}
        <span className="block mt-1 opacity-70">{dict.footer.legal}</span>
      </div>
    </footer>
  );
}
