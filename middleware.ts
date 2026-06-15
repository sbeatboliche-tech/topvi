import { NextRequest, NextResponse } from "next/server";
import { locales, defaultLocale, isLocale, type Locale } from "@/lib/i18n";

// Rutas que NO llevan prefijo de idioma.
const EXCLUDED = ["/api", "/admin", "/_next", "/favicon.ico", "/robots.txt", "/sitemap.xml"];

function detectLocale(req: NextRequest): Locale {
  // 1) preferencia guardada
  const saved = req.cookies.get("locale")?.value;
  if (saved && isLocale(saved)) return saved;

  // 2) Accept-Language
  const al = req.headers.get("accept-language")?.toLowerCase() ?? "";
  if (al.startsWith("pt")) return "br";
  if (al.includes("es-es")) return "es";
  if (al.includes("es-mx")) return "mx";
  if (al.includes("es-co")) return "co";
  if (al.includes("es-cl")) return "cl";
  if (al.includes("es-pe")) return "pe";
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
