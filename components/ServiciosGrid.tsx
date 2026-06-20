"use client";

import { useState } from "react";
import Link from "next/link";
import { FaInstagram, FaTiktok } from "react-icons/fa";
import { services, platformInfo, anchorPrice, type Platform } from "@/lib/config";
import { displayPrice, type Locale } from "@/lib/i18n";

const PLATFORMS: Platform[] = ["instagram", "tiktok"];

const accent: Record<Platform, string> = {
  instagram: "#e1306c",
  tiktok:    "#25f4ee",
};

const PlatformIcon = ({ pf, active }: { pf: Platform; active: boolean }) => {
  const cls = `text-xl ${active ? "text-[#0a0a0b]" : "text-muted"}`;
  if (pf === "instagram") return <FaInstagram className={cls} />;
  return <FaTiktok className={cls} />;
};

export default function ServiciosGrid({ locale }: { locale: Locale }) {
  const [active, setActive] = useState<Platform>("instagram");
  const svs = services.filter((s) => s.platform === active);

  return (
    <div className="flex flex-col gap-5">
      {/* Tab switcher */}
      <div className="flex gap-2 rounded-2xl border border-border bg-surface p-1.5">
        {PLATFORMS.map((pf) => (
          <button
            key={pf}
            type="button"
            onClick={() => setActive(pf)}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-all ${
              active === pf ? "text-[#0a0a0b] shadow-md" : "text-muted hover:text-foreground"
            }`}
            style={active === pf ? { backgroundColor: accent[pf] } : {}}
          >
            <PlatformIcon pf={pf} active={active === pf} />
            {platformInfo[pf].label}
          </button>
        ))}
      </div>

      {/* Cards de servicios */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {svs.map((s) => {
          const price = s.tiers[0].price;
          const before = anchorPrice(price);
          const off = Math.round(((before - price) / before) * 100);
          return (
            <Link
              key={s.slug}
              href={`/${locale}/servicios/${s.slug}`}
              className="group flex flex-col items-center gap-2 rounded-2xl border border-border bg-surface p-4 text-center transition-all active:scale-95 hover:border-white/25 hover:shadow-lg"
            >
              <span
                className="flex h-14 w-14 items-center justify-center rounded-2xl text-3xl ring-1 transition-transform duration-200 group-hover:scale-105"
                style={{
                  backgroundColor: `${accent[active]}22`,
                  // @ts-expect-error css var
                  "--tw-ring-color": `${accent[active]}44`,
                }}
              >
                {s.emoji}
              </span>

              <div>
                <div className="font-bold leading-tight">{s.short}</div>
                <div className="mt-0.5 text-xs text-muted">
                  Desde {displayPrice(price, locale)}
                </div>
                <div className="mt-1 inline-block rounded-md bg-success/15 px-1.5 py-0.5 text-[10px] font-bold text-success">
                  −{off}%
                </div>
              </div>

              <div
                className="mt-auto w-full rounded-full py-2 text-xs font-bold"
                style={{ backgroundColor: accent[active], color: "#0a0a0b" }}
              >
                Comprar →
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
