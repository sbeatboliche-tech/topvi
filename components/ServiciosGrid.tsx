"use client";

import Link from "next/link";
import { FaInstagram, FaTiktok } from "react-icons/fa";
import { services, platformInfo, anchorPrice, type Platform } from "@/lib/config";
import { displayPrice, type Locale } from "@/lib/i18n";

const accent: Record<Platform, string> = {
  instagram: "#e1306c",
  tiktok:    "#25f4ee",
};

const PlatformIcon = ({ pf }: { pf: Platform }) =>
  pf === "instagram"
    ? <FaInstagram className="text-base" style={{ color: accent[pf] }} />
    : <FaTiktok    className="text-base" style={{ color: accent[pf] }} />;

const PLATFORMS: Platform[] = ["instagram", "tiktok"];

export default function ServiciosGrid({ locale }: { locale: Locale }) {
  return (
    <div className="flex flex-col gap-5">
      {PLATFORMS.map((pf) => {
        const svs = services.filter((s) => s.platform === pf);
        return (
          <div key={pf}>
            {/* Label de plataforma */}
            <div className="mb-2.5 flex items-center gap-2 px-1">
              <PlatformIcon pf={pf} />
              <span className="text-sm font-bold" style={{ color: accent[pf] }}>
                {platformInfo[pf].label}
              </span>
              <div className="h-px flex-1 rounded-full" style={{ background: `${accent[pf]}30` }} />
            </div>

            {/* Filas de servicios compactas */}
            <div className="flex flex-col gap-2">
              {svs.map((s) => {
                const price = s.tiers[0].price;
                const before = anchorPrice(price);
                const off = Math.round(((before - price) / before) * 100);
                return (
                  <Link
                    key={s.slug}
                    href={`/${locale}/servicios/${s.slug}`}
                    className="group flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.04] px-4 py-3 transition-all active:scale-[0.98] hover:border-white/20 hover:bg-white/[0.07]"
                  >
                    {/* Ícono */}
                    <span
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl transition-transform duration-200 group-hover:scale-105"
                      style={{ background: `${accent[pf]}20` }}
                    >
                      {s.emoji}
                    </span>

                    {/* Nombre */}
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold leading-tight text-white">{s.short}</div>
                      <div className="text-xs text-muted">Desde {displayPrice(price, locale)}</div>
                    </div>

                    {/* Descuento + flecha */}
                    <div className="flex shrink-0 items-center gap-2">
                      <span className="rounded-md bg-success/15 px-1.5 py-0.5 text-[10px] font-bold text-success">
                        −{off}%
                      </span>
                      <span className="text-white/30 transition-colors group-hover:text-white/70">→</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
