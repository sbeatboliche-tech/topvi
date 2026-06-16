import { notFound } from "next/navigation";
import Link from "next/link";
import { site } from "@/lib/config";
import { isLocale, type Locale } from "@/lib/i18n";

export const metadata = { title: "Términos y Condiciones · TopViral" };

const SECTIONS: { h: string; p: string[] }[] = [
  {
    h: "1. Sobre el servicio",
    p: [
      `${site.name} ofrece servicios de marketing y promoción digital (seguidores, "me gusta", reproducciones y similares) para perfiles y publicaciones de redes sociales.`,
      "Somos un servicio independiente. NO estamos afiliados, asociados, autorizados ni avalados por Instagram, TikTok, ni Meta Platforms, Inc. Todas las marcas mencionadas pertenecen a sus respectivos dueños.",
    ],
  },
  {
    h: "2. Aceptación de los términos",
    p: [
      "Al realizar una compra o utilizar el sitio, declarás haber leído y aceptado estos Términos y Condiciones. Si no estás de acuerdo, no utilices el servicio.",
    ],
  },
  {
    h: "3. Requisitos del cliente",
    p: [
      "Declarás ser mayor de 18 años y ser el titular de la cuenta o contar con autorización para contratar el servicio sobre ella.",
      "Tu cuenta o publicación debe permanecer PÚBLICA durante toda la entrega. Si la ponés privada, cambiás el nombre de usuario (@) o eliminás la publicación, la entrega y la garantía pueden perderse sin derecho a reclamo.",
      "Nunca te pedimos tu contraseña. No la compartas con nadie. Solo necesitamos tu usuario público y/o el enlace de la publicación.",
    ],
  },
  {
    h: "4. Naturaleza del servicio y resultados",
    p: [
      "El servicio consiste en la promoción de tu perfil/contenido. No garantizamos resultados comerciales específicos (ventas, alcance, interacción sostenida ni posicionamiento).",
      "Las cifras entregadas pueden fluctuar por el funcionamiento propio de cada plataforma, que está fuera de nuestro control.",
    ],
  },
  {
    h: "5. Entrega",
    p: [
      "Los tiempos de entrega son estimados (habitualmente la entrega total se completa en pocas horas) y pueden variar por alta demanda, mantenimiento o factores externos. La entrega se realiza de forma gradual para imitar un crecimiento natural.",
      "Las demoras por alta demanda, mantenimiento o factores externos no dan derecho a reembolso siempre que el servicio se entregue.",
    ],
  },
  {
    h: "6. Garantía de reposición",
    p: [
      "Ofrecemos garantía de reposición por 90 días: si hay caídas dentro de ese período, reponemos sin costo.",
      "La garantía requiere que la cuenta/publicación siga pública y que no se haya cambiado el nombre de usuario. No cubre caídas ocasionadas por acciones de la plataforma, cambios de privacidad, eliminación de la publicación ni el uso de otros servicios de terceros en simultáneo.",
    ],
  },
  {
    h: "7. Riesgos y responsabilidad de la plataforma",
    p: [
      "El uso de servicios de promoción de terceros puede no estar contemplado en los términos de uso de Instagram, TikTok u otras plataformas. El cliente asume ese riesgo de manera informada y voluntaria.",
      `${site.name} no se responsabiliza por suspensiones, restricciones, limitaciones de alcance, sanciones o bloqueos que las plataformas pudieran aplicar a la cuenta del cliente.`,
    ],
  },
  {
    h: "8. Cancelaciones y reembolsos",
    p: [
      "Podés solicitar la cancelación mientras la entrega no haya comenzado. Una vez iniciada la entrega, no corresponde reembolso.",
      "Si por algún motivo no pudiéramos completar tu pedido, te ofrecemos la reposición, un servicio equivalente o el reembolso del monto pendiente.",
    ],
  },
  {
    h: "9. Precios y pagos",
    p: [
      "Los pagos se procesan a través de MercadoPago y/o criptomonedas (USDT). No almacenamos los datos de tu tarjeta; son gestionados por el procesador de pagos correspondiente.",
      "Los precios pueden modificarse en cualquier momento; los cambios no afectan a las órdenes ya abonadas.",
    ],
  },
  {
    h: "10. Limitación de responsabilidad",
    p: [
      `En la máxima medida permitida por la ley, la responsabilidad total de ${site.name} frente a cualquier reclamo se limita al monto efectivamente abonado por la orden involucrada.`,
      "No respondemos por daños indirectos, lucro cesante ni pérdidas derivadas del uso o la imposibilidad de uso del servicio.",
    ],
  },
  {
    h: "11. Datos personales",
    p: [
      "El tratamiento de tus datos se rige por nuestra Política de Privacidad.",
    ],
  },
  {
    h: "12. Modificaciones",
    p: [
      "Podemos actualizar estos Términos en cualquier momento. La versión vigente es la publicada en esta página.",
    ],
  },
  {
    h: "13. Ley aplicable",
    p: [
      "Estos Términos se rigen por las leyes de la República Argentina. Ante cualquier controversia, las partes se someten a los tribunales ordinarios competentes.",
    ],
  },
];

export default async function Terminos({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: l } = await params;
  if (!isLocale(l)) notFound();
  const locale = l as Locale;

  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-bold md:text-4xl">Términos y Condiciones</h1>
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
          <h2 className="text-lg font-semibold">14. Contacto</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Por cualquier consulta escribinos a{" "}
            <a href={`mailto:${site.email}`} className="text-accent hover:underline">
              {site.email}
            </a>{" "}
            o por Instagram DM. Ver también nuestra{" "}
            <Link href={`/${locale}/privacidad`} className="text-accent hover:underline">
              Política de Privacidad
            </Link>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
