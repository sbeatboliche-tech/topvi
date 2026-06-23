export default function AnnouncementBar() {
  return (
    <div
      className="w-full py-2.5 text-center"
      style={{
        background:
          "linear-gradient(135deg, rgba(225,48,108,0.07) 0%, rgba(131,58,180,0.05) 50%, rgba(88,81,219,0.07) 100%)",
        borderBottom: "1px solid rgba(225,48,108,0.14)",
      }}
    >
      <span className="text-[13px] font-semibold text-white/75">
        🏦 5% de descuento pagando por transferencia
      </span>
    </div>
  );
}
