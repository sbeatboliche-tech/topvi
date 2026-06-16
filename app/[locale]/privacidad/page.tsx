import { notFound } from "next/navigation";
import Link from "next/link";
import { site } from "@/lib/config";
import { isLocale, type Locale } from "@/lib/i18n";

export const metadata = { title: "Política de Privacidad · TopViral" };

const SECTIONS: { h: string; p: string[] }[] = [
  {
    h: "1. Qué datos recopilamos",
    p: [
      "Para procesar tu pedido recopilamos únicamente lo necesario: tu nombre de usuario público y/o el enlace de la publicación, un dato de contacto (email) y los datos del pedido.",
      "Los pagos los procesan terceros (MercadoPago / red de la criptomoneda). No almacenamos números de tarjeta ni credenciales de pago.",
      "Podemos registrar datos técnicos básicos (como la dirección IP o un identificador local en tu navegador) para prevenir el abuso de promociones gratuitas y proteger el servicio.",
    ],
  },
  {
    h: "2. Para qué usamos tus datos",
    p: [
      "Usamos tus datos exclusivamente para: procesar y entregar tu pedido, brindarte soporte, prevenir fraudes y cumplir obligaciones legales.",
      "Nunca te pedimos tu contraseña y jamás accedemos a tu cuenta.",
    ],
  },
  {
    h: "3. Con quién los compartimos",
    p: [
      "No vendemos ni alquilamos tus datos. Solo los compartimos con proveedores necesarios para prestar el servicio (procesador de pagos y proveedor de entrega), y cuando la ley lo exija.",
    ],
  },
  {
    h: "4. Conservación",
    p: [
      "Conservamos los datos del pedido el tiempo necesario para la entrega, la garantía y obligaciones contables/legales. Luego los eliminamos o anonimizamos.",
    ],
  },
  {
    h: "5. Tus derechos",
    p: [
      "Podés solicitar el acceso, la corrección o la eliminación de tus datos escribiéndonos. Atenderemos tu pedido en un plazo razonable.",
    ],
  },
  {
    h: "6. Cookies y almacenamiento local",
    p: [
      "Usamos almacenamiento local del navegador para recordar tu conversación de soporte y mejorar tu experiencia. Podés borrarlo desde la configuración de tu navegador.",
    ],
  },
];

export default async function Privacidad({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: l } = await params;
  if (!isLocale(l)) notFound();
  const locale = l as Locale;

  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-bold md:text-4xl">Política de Privacidad</h1>
      <p className="mt-2 text-sm text-muted">
        Última actualización: junio de 2026
      </p>

      <div className="mt-10 space-y-8">
        {SECTIONS.map((s) => (
          <section key={s.h}>
            <h2 className="text-lg font-semibold">{s.h}</h2>
            {s.p.map((para, i) => (
              <p key={i} className="mt-2 text-sm leading-relaxed text-muted">
                {para}
              </p>
            ))}
          </section>
        ))}

        <section>
          <h2 className="text-lg font-semibold">7. Contacto</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Para ejercer tus derechos o cualquier consulta, escribinos a{" "}
            <a href={`mailto:${site.email}`} className="text-accent hover:underline">
              {site.email}
            </a>
            . Ver también nuestros{" "}
            <Link href={`/${locale}/terminos`} className="text-accent hover:underline">
              Términos y Condiciones
            </Link>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
