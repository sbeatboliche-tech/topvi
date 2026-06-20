import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale, localeConfig, type Locale } from "@/lib/i18n";

const content = {
  es: {
    title: "¿Cómo funciona?",
    sub: "Simple, rápido y sin riesgos. Tres minutos y listo.",
    steps: [
      {
        emoji: "🎯",
        title: "Elegí tu servicio",
        desc: "Seleccioná la plataforma, el tipo de servicio y la cantidad. El precio se calcula al instante con el mejor descuento.",
        color: "#e1306c",
      },
      {
        emoji: "👤",
        title: "Ingresá tu usuario",
        desc: "Solo tu nombre de usuario público. NUNCA pedimos tu contraseña ni accedemos a tu cuenta. Tu perfil debe estar en público mientras dura la entrega.",
        color: "#8b5cf6",
      },
      {
        emoji: "🔒",
        title: "Pagá de forma segura",
        desc: "Con MercadoPago, tarjeta de crédito, transferencia bancaria o USDT. Todos los pagos son 100% seguros.",
        color: "#f59e0b",
      },
      {
        emoji: "⚡",
        title: "Recibís todo en menos de 3 hs",
        desc: "La entrega se hace de forma gradual y natural para que parezca orgánica. No de golpe.",
        color: "#22c55e",
      },
      {
        emoji: "🛡️",
        title: "Garantía de 90 días",
        desc: "Si algo cae durante el período de garantía, lo reponemos sin costo ni preguntas.",
        color: "#34d399",
      },
    ],
    faqs: [
      { q: "¿Es seguro para mi cuenta?", a: "Sí. Nunca pedimos tu contraseña ni accedemos a tu cuenta. Solo necesitamos tu usuario público." },
      { q: "¿Cuánto tarda en llegar?", a: "La entrega total se completa en menos de 3 horas, de forma gradual para que se vea natural." },
      { q: "¿Mi cuenta tiene que ser pública?", a: "Sí, solo mientras dura la entrega. Cuando terminamos, podés volver a ponerla en privado sin problema." },
      { q: "¿Qué pasa si algo cae?", a: "Activás la garantía y lo reponemos sin costo dentro de los 90 días posteriores a la compra." },
    ],
    cta: "Comprar YA →",
    trust: ["⭐ 4.9/5 en reseñas", "⚡ Entrega < 3 hs", "🛡️ Garantía 90 días", "🔒 Sin contraseña"],
  },
  pt: {
    title: "Como funciona?",
    sub: "Simples, rápido e sem riscos. Três minutos e pronto.",
    steps: [
      { emoji: "🎯", title: "Escolha seu serviço", desc: "Selecione a plataforma, o tipo de serviço e a quantidade. O preço é calculado na hora.", color: "#e1306c" },
      { emoji: "👤", title: "Informe seu usuário", desc: "Só seu nome de usuário público. NUNCA pedimos sua senha nem acessamos sua conta.", color: "#8b5cf6" },
      { emoji: "🔒", title: "Pague com segurança", desc: "Com MercadoPago, cartão de crédito, transferência bancária ou USDT.", color: "#f59e0b" },
      { emoji: "⚡", title: "Receba tudo em menos de 3h", desc: "A entrega é feita de forma gradual e natural para parecer orgânica.", color: "#22c55e" },
      { emoji: "🛡️", title: "Garantia de 90 dias", desc: "Se algo cair no período de garantia, repomos sem custo.", color: "#34d399" },
    ],
    faqs: [
      { q: "É seguro para minha conta?", a: "Sim. Nunca pedimos sua senha nem acessamos sua conta." },
      { q: "Quanto tempo demora?", a: "A entrega total se completa em menos de 3 horas, de forma gradual." },
      { q: "Minha conta precisa ser pública?", a: "Sim, apenas durante a entrega. Depois pode deixar privada novamente." },
      { q: "E se algo cair?", a: "Ative a garantia e repomos sem custo dentro de 90 dias." },
    ],
    cta: "Comprar agora →",
    trust: ["⭐ 4.9/5", "⚡ Entrega < 3h", "🛡️ Garantia 90 dias", "🔒 Sem senha"],
  },
};

export default async function ComoFunciona({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: l } = await params;
  if (!isLocale(l)) notFound();
  const locale = l as Locale;
  const c = content[localeConfig[locale].lang];

  return (
    <div className="mx-auto max-w-3xl px-4 py-14">
      {/* Header */}
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">{c.title}</h1>
        <p className="mt-3 text-lg text-muted">{c.sub}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {c.trust.map((t) => (
            <span key={t} className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/70">
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* Steps */}
      <div className="relative space-y-4">
        {/* línea vertical conectora */}
        <div className="absolute left-[27px] top-10 hidden h-[calc(100%-60px)] w-px bg-gradient-to-b from-white/20 to-transparent sm:block" />

        {c.steps.map((s, i) => (
          <div key={i} className="reveal flex gap-4" style={{ animationDelay: `${i * 80}ms` }}>
            {/* Número / ícono */}
            <div
              className="relative z-10 flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-2xl text-2xl shadow-lg"
              style={{ background: `${s.color}22`, border: `1.5px solid ${s.color}44` }}
            >
              {s.emoji}
              <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-surface text-[10px] font-bold text-muted ring-1 ring-border">
                {i + 1}
              </span>
            </div>

            {/* Contenido */}
            <div className="flex-1 rounded-2xl border border-border bg-surface p-5">
              <h3 className="font-bold">{s.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* FAQ */}
      <div className="mt-14">
        <h2 className="mb-5 text-center text-2xl font-bold">Preguntas frecuentes</h2>
        <div className="flex flex-col gap-2">
          {c.faqs.map((f) => (
            <details
              key={f.q}
              className="group rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 open:border-white/20"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between font-semibold text-white [&::-webkit-details-marker]:hidden">
                {f.q}
                <span className="ml-4 shrink-0 text-white/40 transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-muted">{f.a}</p>
            </details>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="mt-12 rounded-3xl bg-white px-6 py-10 text-center text-gray-900">
        <p className="text-2xl font-extrabold">¿Listo para crecer?</p>
        <p className="mt-2 text-gray-500">Sin contraseña · Entrega en menos de 3 hs · Garantía incluida</p>
        <Link
          href={`/${locale}/servicios`}
          className="mt-6 inline-block rounded-full bg-gray-900 px-10 py-4 text-base font-bold text-white transition-colors hover:bg-gray-800"
        >
          {c.cta}
        </Link>
      </div>
    </div>
  );
}
