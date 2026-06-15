"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  locales,
  localeConfig,
  isLocale,
  type Dict,
  type Locale,
} from "@/lib/i18n";

export default function LangSwitcher({
  locale,
  dict,
}: {
  locale: Locale;
  dict: Dict;
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  function switchTo(target: Locale) {
    // Reemplaza el segmento de idioma en la URL actual.
    const parts = pathname.split("/");
    if (isLocale(parts[1])) parts[1] = target;
    else parts.splice(1, 0, target);
    document.cookie = `locale=${target}; path=/; max-age=${60 * 60 * 24 * 365}`;
    router.push(parts.join("/") || `/${target}`);
    setOpen(false);
  }

  const current = localeConfig[locale];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-sm hover:bg-surface-2"
        aria-label={dict.langPicker}
      >
        <span>{current.flag}</span>
        <span className="hidden sm:inline">{current.currency.code}</span>
        <span className="text-muted">▾</span>
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-44 overflow-hidden rounded-xl border border-border bg-surface shadow-xl">
          {locales.map((l) => (
            <button
              key={l}
              onClick={() => switchTo(l)}
              className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-surface-2 ${
                l === locale ? "text-accent" : ""
              }`}
            >
              <span>{localeConfig[l].flag}</span>
              <span className="flex-1">{localeConfig[l].label}</span>
              <span className="text-xs text-muted">
                {localeConfig[l].currency.code}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
