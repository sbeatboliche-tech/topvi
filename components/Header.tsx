"use client";

import Link from "next/link";
import { useState } from "react";
import type { Dict, Locale } from "@/lib/i18n";
import LangSwitcher from "./LangSwitcher";
import Logo from "./Logo";

export default function Header({
  locale,
  dict,
}: {
  locale: Locale;
  dict: Dict;
}) {
  const [open, setOpen] = useState(false);
  const p = (path: string) => `/${locale}${path}`;

  const nav = [
    { href: p("/"), label: dict.nav.home },
    { href: p("/servicios"), label: dict.nav.services },
    { href: p("/como-funciona"), label: dict.nav.how },
    { href: p("/faq"), label: dict.nav.faq },
    { href: p("/mis-pedidos"), label: dict.nav.orders },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0a0a0b]/85 backdrop-blur-lg">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href={p("/")} className="flex items-center">
          <Logo size="md" dark />
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="text-sm text-white/70 transition-colors hover:text-white"
            >
              {n.label}
            </Link>
          ))}
          <LangSwitcher locale={locale} dict={dict} />
          <Link
            href={p("/servicios")}
            className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-[#0a0a0b] transition-colors hover:bg-white/90"
          >
            {dict.nav.buy}
          </Link>
        </nav>

        <button
          onClick={() => setOpen(!open)}
          className="text-2xl text-white md:hidden"
          aria-label="Menú"
        >
          {open ? "✕" : "☰"}
        </button>
      </div>

      {open && (
        <nav className="flex flex-col gap-1 border-t border-white/10 bg-[#0a0a0b] px-4 py-3 md:hidden">
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2 text-sm text-white/70 hover:bg-white/5 hover:text-white"
            >
              {n.label}
            </Link>
          ))}
          <div className="px-3 py-2">
            <LangSwitcher locale={locale} dict={dict} />
          </div>
          <Link
            href={p("/servicios")}
            onClick={() => setOpen(false)}
            className="mt-2 rounded-full bg-white px-5 py-2 text-center text-sm font-semibold text-[#0a0a0b]"
          >
            {dict.nav.buy}
          </Link>
        </nav>
      )}
    </header>
  );
}
