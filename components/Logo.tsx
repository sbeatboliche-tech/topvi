// ============================================================
//  LOGO / WORDMARK
//  Ícono (círculo negro + triángulo blanco hacia arriba, recreado del
//  favicon como SVG nítido) + wordmark "TOP VIRAL" en dos tonos +
//  "marketing" sobrio debajo. Sin color de marca ni fondo raro.
//  Tamaño con la prop `size`.
// ============================================================

export default function Logo({
  size = "md",
  className = "",
  dark = false,
}: {
  size?: "sm" | "md" | "lg";
  className?: string;
  dark?: boolean;
}) {
  const word =
    size === "lg" ? "text-3xl" : size === "sm" ? "text-lg" : "text-xl";
  const sub =
    size === "lg"
      ? "text-[12px] tracking-[0.45em]"
      : size === "sm"
      ? "text-[8px] tracking-[0.3em]"
      : "text-[9px] tracking-[0.35em]";
  const icon =
    size === "lg" ? "h-11 w-11" : size === "sm" ? "h-7 w-7" : "h-9 w-9";

  return (
    <span
      className={`inline-flex select-none items-center gap-2 leading-none ${className}`}
      aria-label="TopViral Marketing"
    >
      {/* Ícono: círculo negro con triángulo blanco hacia arriba */}
      <svg viewBox="0 0 100 100" className={`${icon} shrink-0`} aria-hidden="true">
        <circle cx="50" cy="50" r="50" fill="#000000" />
        <polygon points="50,30 71,67 29,67" fill="#ffffff" />
      </svg>

      <span className="inline-flex flex-col leading-none">
        <span className="flex items-center gap-1.5">
          <span
            className={`font-extrabold tracking-tight ${word} ${
              dark ? "text-white/55" : "text-gray-400"
            }`}
          >
            TOP
          </span>
          <span
            className={`font-extrabold tracking-tight ${word} ${
              dark ? "text-white" : "text-gray-900"
            }`}
          >
            VIRAL
          </span>
        </span>
        <span
          className={`mt-1 pl-0.5 font-medium uppercase ${sub} ${
            dark ? "text-white/45" : "text-gray-400"
          }`}
        >
          marketing
        </span>
      </span>
    </span>
  );
}
