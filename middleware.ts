import { NextRequest, NextResponse } from "next/server";
import { locales, defaultLocale, isLocale, type Locale } from "@/lib/i18n";

// Rutas que NO llevan prefijo de idioma.
const EXCLUDED = ["/api", "/admin", "/_next", "/favicon.ico", "/robots.txt", "/sitemap.xml"];

// País (ISO-2 que envía Vercel) → locale del sitio.
// Los países de LATAM sin moneda propia configurada caen a Argentina (ARS).
const COUNTRY_TO_LOCALE: Record<string, Locale> = {
  AR: "ar",
  MX: "mx",
  CO: "co",
  CL: "cl",
  PE: "pe",
  ES: "es",
  BR: "br",
};

function detectLocale(req: NextRequest): Locale {
  // 1) preferencia guardada explícitamente por el usuario (selector de país)
  const saved = req.cookies.get("locale")?.value;
  if (saved && isLocale(saved)) return saved;

  // 2) GEOLOCALIZACIÓN por IP (la fuente confiable: dónde está el visitante).
  //    Vercel inyecta el país en este header en producción.
  const country = (
    req.headers.get("x-vercel-ip-country") ?? ""
  ).toUpperCase();
  if (country && country in COUNTRY_TO_LOCALE) return COUNTRY_TO_LOCALE[country];

  // 3) Fallback por idioma del navegador SOLO si no hay geo (ej. desarrollo local).
  //    Ojo: solo lo usamos para distinguir portugués; el idioma del navegador
  //    NO es señal de país (un argentino puede tener el navegador en es-ES).
  const al = req.headers.get("accept-language")?.toLowerCase() ?? "";
  if (al.startsWith("pt")) return "br";

  return defaultLocale;
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (EXCLUDED.some((p) => pathname === p || pathname.startsWith(p + "/")) ||
      pathname.includes(".")) {
    return NextResponse.next();
  }

  // ¿Ya tiene prefijo de idioma válido?
  const seg = pathname.split("/")[1];
  if (isLocale(seg)) return NextResponse.next();

  // Redirigir agregando el idioma detectado.
  const locale = detectLocale(req);
  const url = req.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

// evita warning de "locales no usado" en algunos linters
void locales;
