import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale, localeConfig, type Locale } from "@/lib/i18n";

const content = {
  es: {
    title: "¿Cómo funciona?",
    sub: "Simple, rápido y sin riesgos para tu cuenta.",
    steps: [
      { title: "Elegí tu paquete", desc: "Seleccioná la calidad y la cantidad. El precio se calcula al instante." },
      { title: "Ingresá tu usuario", desc: "Solo tu usuario público. NUNCA pedimos tu contraseña. La cuenta debe estar pública." },
      { title: "Pagá de forma segura", desc: "Con MercadoPago (hasta 3 cuotas) o con USDT. El pago está protegido." },
      { title: "Recibís todo", desc: "La entrega empieza entre 0 y 6 horas (hasta 12 hs según demanda), de forma gradual y natural." },
      { title: "Garantía activa", desc: "Si algo cae durante el período de garantía (30 a 60 días según calidad), lo reponemos sin costo." },
    ],
    faqTitle: "Dudas frecuentes",
    faqs: [
      { q: "¿Es seguro para mi cuenta?", a: "Sí. Nunca pedimos tu contraseña ni accedemos a tu cuenta." },
      { q: "¿Necesito poner mi contraseña?", a: "No, jamás. Solo tu nombre de usuario público." },
      { q: "¿Mi cuenta tiene que ser pública?", a: "Sí, hasta que recibas todo el pedido. Después podés volver a ponerla privada." },
    ],
    cta: "Comprar ahora",
  },
  pt: {
    title: "Como funciona?",
    sub: "Simples, rápido e sem riscos para sua conta.",
    steps: [
      { title: "Escolha seu pacote", desc: "Selecione a qualidade e a quantidade. O preço é calculado na hora." },
      { title: "Informe seu usuário", desc: "Só seu usuário público. NUNCA pedimos sua senha. A conta deve estar pública." },
      { title: "Pague com segurança", desc: "Com MercadoPago (parcelado) ou USDT. O pagamento é protegido." },
      { title: "Receba tudo", desc: "A entrega começa entre 0 e 6 horas (até 12h conforme a demanda), de forma gradual e natural." },
      { title: "Garantia ativa", desc: "Se algo cair no período de garantia (30 a 60 dias conforme a qualidade), repomos sem custo." },
    ],
    faqTitle: "Dúvidas frequentes",
    faqs: [
      { q: "É seguro para minha conta?", a: "Sim. Nunca pedimos sua senha nem acessamos sua conta." },
      { q: "Preciso informar minha senha?", a: "Não, jamais. Só seu nome de usuário público." },
      { q: "Minha conta precisa ser pública?", a: "Sim, até receber todo o pedido. Depois pode voltar a deixá-la privada." },
    ],
    cta: "Comprar agora",
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
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-center text-4xl font-bold">{c.title}</h1>
      <p className="mt-3 text-center text-muted">{c.sub}</p>

      <div className="mt-12 space-y-6">
        {c.steps.map((s, i) => (
          <div key={i} className="flex gap-4">
            <div className="brand-gradient flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-bold text-white">
              {i + 1}
            </div>
            <div>
              <h3 className="font-semibold">{s.title}</h3>
              <p className="mt-1 text-sm text-muted">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <h2 className="mt-16 text-2xl font-bold">{c.faqTitle}</h2>
      <div className="mt-6 space-y-4">
        {c.faqs.map((f, i) => (
          <div key={i} className="rounded-2xl border border-border bg-surface p-5">
            <h3 className="font-semibold">{f.q}</h3>
            <p className="mt-1.5 text-sm text-muted">{f.a}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 text-center">
        <Link
          href={`/${locale}/servicios`}
          className="brand-gradient inline-block rounded-full px-8 py-3.5 font-semibold text-white"
        >
          {c.cta}
        </Link>
      </div>
    </div>
  );
}
