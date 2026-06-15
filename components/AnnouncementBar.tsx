const ITEMS = [
  "🎉 3 cuotas sin interés con MercadoPago",
  "⚡ Entrega en 10 minutos a 3 horas",
  "✅ +1.523 pedidos completados",
  "🔒 Sin contraseña · Con garantía incluida",
  "💸 El precio más bajo del mercado",
  "📦 Entrega automática · Sin esperas",
];

export default function AnnouncementBar() {
  return (
    <div className="overflow-hidden bg-white py-2.5">
      <div className="animate-marquee flex gap-14 whitespace-nowrap">
        {[...ITEMS, ...ITEMS].map((item, i) => (
          <span key={i} className="shrink-0 text-[13px] font-semibold text-[#060912]">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
