import Link from "next/link";
import { notFound } from "next/navigation";
import { site } from "@/lib/config";
import { isLocale, localeConfig, type Locale } from "@/lib/i18n";

const content = {
  es: {
    title: "Preguntas frecuentes",
    sub: "Todo lo que necesitás saber antes de comprar.",
    faqs: [
      { q: "¿Tengo que dar mi contraseña?", a: "No, nunca. Solo necesitamos tu nombre de usuario público. Tu cuenta jamás corre riesgo." },
      { q: "¿Cuánto tarda la entrega?", a: "La entrega total se completa en menos de 3 horas, de forma gradual para que se vea natural." },
      { q: "¿Los seguidores se caen?", a: "Puede haber una caída mínima natural. Por eso incluimos garantía de 90 días y reponemos las caídas sin costo." },
      { q: "¿Mi cuenta tiene que estar pública?", a: "Sí, hasta que recibas el pedido completo. Luego podés volver a hacerla privada." },
      { q: "¿Cómo puedo pagar?", a: "Con MercadoPago (tarjeta, dinero en cuenta, hasta 3 cuotas) o con USDT." },
      { q: "¿Es seguro? ¿Me pueden banear?", a: "El proceso es externo y gradual, simulando crecimiento natural, para que Instagram ni TikTok lo detecten. Nunca accedemos a tu cuenta." },
    ],
    contactTitle: "¿Te quedó alguna duda?",
    contactSub: "Escribinos y te respondemos al toque.",
    buy: "Comprar ahora",
  },
  pt: {
    title: "Perguntas frequentes",
    sub: "Tudo o que você precisa saber antes de comprar.",
    faqs: [
      { q: "Preciso informar minha senha?", a: "Não, nunca. Só precisamos do seu nome de usuário público. Sua conta nunca corre risco." },
      { q: "Quanto tempo leva a entrega?", a: "A entrega total se completa em menos de 3 horas, de forma gradual para parecer natural." },
      { q: "Os seguidores caem?", a: "Pode haver uma queda mínima natural. Por isso incluímos garantia de 90 dias e repomos sem custo." },
      { q: "Minha conta precisa estar pública?", a: "Sim, até receber o pedido completo. Depois pode voltar a deixá-la privada." },
      { q: "Como posso pagar?", a: "Com MercadoPago (cartão, saldo, parcelado) ou com USDT." },
      { q: "É seguro? Posso ser banido?", a: "O processo é externo e gradual, simulando crescimento natural, para que Instagram e TikTok não detectem. Nunca acessamos sua conta." },
    ],
    contactTitle: "Ficou com alguma dúvida?",
    contactSub: "Fale com a gente que respondemos na hora.",
    buy: "Comprar agora",
  },
};

export default async function FAQ({
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

      <div className="mt-10 space-y-3">
        {c.faqs.map((f, i) => (
          <details
            key={i}
            className="group rounded-2xl border border-border bg-surface p-5 [&_summary::-webkit-details-marker]:hidden"
          >
            <summary className="flex cursor-pointer items-center justify-between font-semibold">
              {f.q}
              <span className="text-muted transition-transform group-open:rotate-45">
                +
              </span>
            </summary>
            <p className="mt-3 text-sm text-muted">{f.a}</p>
          </details>
        ))}
      </div>

      <div className="mt-12 rounded-2xl border border-border bg-surface p-8 text-center">
        <h2 className="text-xl font-bold">{c.contactTitle}</h2>
        <p className="mt-2 text-sm text-muted">{c.contactSub}</p>
        <div className="mt-5 flex justify-center gap-3">
          <a
            href={site.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full brand-gradient px-6 py-3 font-semibold text-white"
          >
            Instagram DM
          </a>
          <Link
            href={`/${locale}/servicios`}
            className="brand-gradient rounded-full px-6 py-3 font-semibold text-white"
          >
            {c.buy}
          </Link>
        </div>
      </div>
    </div>
  );
}
