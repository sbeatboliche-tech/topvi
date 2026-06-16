// ============================================================
//  LOGO / WORDMARK
//  "TOP" en negro extrabold + "VIRAL" en bloque verde redondeado,
//  y "marketing" sobrio en gris debajo.
//  Es CSS puro: nítido en cualquier tamaño y combina con la paleta.
//  Tamaño controlable con la prop `size`.
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
        <span className={`font-extrabold tracking-tight text-gray-900 ${word}`}>
          TOP
        </span>
        <span
          className={`rounded-md bg-[var(--accent)] px-1.5 pb-1 pt-0.5 font-extrabold tracking-tight text-white ${word}`}
        >
          VIRAL
        </span>
      </span>
      <span className={`mt-1 pl-0.5 font-medium uppercase text-gray-400 ${sub}`}>
        marketing
      </span>
    </span>
  );
}
