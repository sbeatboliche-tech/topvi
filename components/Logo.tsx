// ============================================================
//  LOGO / WORDMARK
//  "TOP" en gris + "VIRAL" en negro fuerte (dos tonos, mismo peso),
//  y "marketing" sobrio en gris fino debajo.
//  Sin color de marca ni fondo: limpio sobre cualquier base.
//  Es CSS puro: nítido en cualquier tamaño. Tamaño con la prop `size`.
// ============================================================

export default function Logo({
  size = "md",
  className = "",
}: {
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const word =
    size === "lg"
      ? "text-3xl"
      : size === "sm"
      ? "text-lg"
      : "text-xl";
  const sub =
    size === "lg"
      ? "text-[12px] tracking-[0.45em]"
      : size === "sm"
      ? "text-[8px] tracking-[0.3em]"
      : "text-[9px] tracking-[0.35em]";

  return (
    <span
      className={`inline-flex select-none flex-col leading-none ${className}`}
      aria-label="TopViral Marketing"
    >
      <span className="flex items-center gap-1.5">
        <span className={`font-extrabold tracking-tight text-gray-400 ${word}`}>
          TOP
        </span>
        <span className={`font-extrabold tracking-tight text-gray-900 ${word}`}>
          VIRAL
        </span>
      </span>
      <span className={`mt-1 pl-0.5 font-medium uppercase text-gray-400 ${sub}`}>
        marketing
      </span>
    </span>
  );
}
