const ITEMS = [
  "🏦 5% OFF pagando por transferencia",
  "⚡ Entrega inmediata — desde 10 minutos",
  "🛡️ Garantía de reposición incluida",
  "⭐ 4.9/5 · +570 reseñas reales",
  "✅ Sin contraseña · 100% seguro",
  "🇦🇷 Servicio #1 de crecimiento en Argentina",
];

export default function AnnouncementBar() {
  const doubled = [...ITEMS, ...ITEMS];
  return (
    <div
      className="relative w-full overflow-hidden py-2.5"
      style={{
        background:
          "linear-gradient(135deg, rgba(225,48,108,0.08) 0%, rgba(131,58,180,0.06) 50%, rgba(88,81,219,0.08) 100%)",
        borderBottom: "1px solid rgba(225,48,108,0.14)",
      }}
    >
      {/* Fade edges */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-[#0a0a0b] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-[#0a0a0b] to-transparent" />

      <div className="animate-marquee flex whitespace-nowrap">
        {doubled.map((item, i) => (
          <span
            key={i}
            className="mx-7 inline-flex items-center text-[11.5px] font-semibold text-white/60"
          >
            {item}
            <span className="ml-7 text-white/20">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
