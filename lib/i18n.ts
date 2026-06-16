// ============================================================
//  INTERNACIONALIZACIÓN (idiomas + monedas + modismos)
//  Mercados: LATAM hispana, España y Brasil.
//  Cada "locale" = un país con su idioma, moneda y modismos.
// ============================================================

export const locales = ["ar", "mx", "co", "cl", "pe", "es", "br"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "ar";

export function isLocale(x: string): x is Locale {
  return (locales as readonly string[]).includes(x);
}

// ---- Configuración por país ----
//  arsPerUnit = cuántos ARS equivalen a 1 unidad de la moneda local.
//  ⚠️ Son valores APROXIMADOS: actualizalos según el cambio real.
//  mpCurrency = código de moneda en MercadoPago (null = MP no disponible ahí).
interface CurrencyCfg {
  code: string;
  arsPerUnit: number;
  round: number; // redondeo del precio mostrado
  decimals: number;
}
export interface LocaleCfg {
  label: string;
  flag: string;
  lang: "es" | "pt";
  intl: string; // locale para Intl (formato de números/moneda)
  currency: CurrencyCfg;
  mpCurrency: string | null;
}

export const localeConfig: Record<Locale, LocaleCfg> = {
  ar: {
    label: "Argentina",
    flag: "🇦🇷",
    lang: "es",
    intl: "es-AR",
    currency: { code: "ARS", arsPerUnit: 1, round: 1, decimals: 0 },
    mpCurrency: "ARS",
  },
  mx: {
    label: "México",
    flag: "🇲🇽",
    lang: "es",
    intl: "es-MX",
    currency: { code: "MXN", arsPerUnit: 70, round: 5, decimals: 0 },
    mpCurrency: "MXN",
  },
  co: {
    label: "Colombia",
    flag: "🇨🇴",
    lang: "es",
    intl: "es-CO",
    currency: { code: "COP", arsPerUnit: 0.3, round: 500, decimals: 0 },
    mpCurrency: "COP",
  },
  cl: {
    label: "Chile",
    flag: "🇨🇱",
    lang: "es",
    intl: "es-CL",
    currency: { code: "CLP", arsPerUnit: 1.3, round: 50, decimals: 0 },
    mpCurrency: "CLP",
  },
  pe: {
    label: "Perú",
    flag: "🇵🇪",
    lang: "es",
    intl: "es-PE",
    currency: { code: "PEN", arsPerUnit: 320, round: 1, decimals: 2 },
    mpCurrency: "PEN",
  },
  es: {
    label: "España",
    flag: "🇪🇸",
    lang: "es",
    intl: "es-ES",
    currency: { code: "EUR", arsPerUnit: 1300, round: 1, decimals: 2 },
    mpCurrency: null, // MercadoPago no opera en España → solo USDT
  },
  br: {
    label: "Brasil",
    flag: "🇧🇷",
    lang: "pt",
    intl: "pt-BR",
    currency: { code: "BRL", arsPerUnit: 220, round: 1, decimals: 2 },
    mpCurrency: "BRL",
  },
};

// Convierte un precio en ARS a la moneda local y lo formatea.
export function displayPrice(ars: number, locale: Locale): string {
  const cfg = localeConfig[locale];
  const raw = ars / cfg.currency.arsPerUnit;
  const rounded = Math.round(raw / cfg.currency.round) * cfg.currency.round;
  return new Intl.NumberFormat(cfg.intl, {
    style: "currency",
    currency: cfg.currency.code,
    maximumFractionDigits: cfg.currency.decimals,
  }).format(rounded);
}

export function localAmount(ars: number, locale: Locale): number {
  const cfg = localeConfig[locale];
  const raw = ars / cfg.currency.arsPerUnit;
  return Math.round(raw / cfg.currency.round) * cfg.currency.round;
}

export function formatNum(n: number, locale: Locale): string {
  return new Intl.NumberFormat(localeConfig[locale].intl).format(n);
}

// ============================================================
//  DICCIONARIOS
//  - "es" = español neutro (tuteo) → usado por MX, CO, CL, PE
//  - "ar" hereda de "es" con modismos rioplatenses (voseo)
//  - "es-ES" hereda de "es" con toques peninsulares
//  - "pt" = portugués de Brasil
//  El placeholder {x} se reemplaza con fmt().
// ============================================================

export interface Dict {
  nav: { home: string; services: string; how: string; faq: string; buy: string; orders: string };
  hero: {
    badge: string;
    titlePre: string;
    titleHi: string;
    titlePost: string;
    subtitle: string;
    cta1: string;
    cta2: string;
    b1: string;
    b2: string;
    b3: string;
  };
  features: { title: string; desc: string }[];
  stats: { orders: string; clients: string; years: string };
  stepsTitle: string;
  stepsSub: string;
  steps: { title: string; desc: string }[];
  teaser: { title: string; sub: string; cta: string };
  servicesPage: { title: string; sub: string; from: string };
  order: {
    title: string; // "Comprar {svc}"
    sub: string;
    quality: string;
    quantity: string;
    yourData: string;
    payment: string;
    userLabel: string; // "Usuario de {platform}"
    linkLabel: string;
    publicWarn: string;
    contactLabel: string;
    contactPh: string;
    summary: string;
    service: string;
    qualityW: string;
    bonus: string;
    total: string;
    price: string;
    pay: string;
    processing: string;
    secure: string;
    recommended: string;
    free: string; // "+{n} gratis"
    mpDesc: string;
    cardLabel: string;
    cardDesc: string;
    usdtDesc: string;
    interestFree: string;
    followersBenefits: string;
    errUser: string;
    errLink: string;
    errContact: string;
  };
  quality: {
    global: { label: string; desc: string; war: string };
    premium: { label: string; desc: string; war: string };
  };
  gracias: {
    title: string;
    orderFor: string; // "Orden {id} para {user}"
    qty: string;
    total: string;
    status: string;
    paid: string;
    waiting: string;
    deliveryTitle: string;
    deliveryEta: string;
    gradualTitle: string;
    gradualDesc: string;
    usdtTitle: string;
    usdtBody: string; // con {amount} y {network}
    usdtAfter: string;
    usdtDeliveryNote: string;
    sendProof: string;
    mpPending: string;
    noOrder: string;
    home: string;
    wpp: string;
  };
  footer: { services: string; info: string; contact: string; rights: string; legal: string };
  langPicker: string;
}

const es: Dict = {
  nav: { home: "Inicio", services: "Servicios", how: "Cómo funciona", faq: "Preguntas", buy: "Comprar ahora", orders: "Mis pedidos" },
  hero: {
    badge: "+{years} años · +{orders} órdenes completadas",
    titlePre: "Haz crecer tus",
    titleHi: "redes",
    titlePost: "en serio",
    subtitle: "Seguidores, likes y vistas para Instagram y TikTok. Entrega rápida, sin contraseña y con garantía. Desde {from}.",
    cta1: "Comprar ahora",
    cta2: "¿Cómo funciona?",
    b1: "Sin contraseña",
    b2: "Pago seguro",
    b3: "Entrega rápida",
  },
  features: [
    { title: "Soporte real", desc: "Te respondemos en ~1 minuto. Solo necesitás tu número de orden." },
    { title: "100% Seguro", desc: "Nunca te pedimos tu contraseña. Tu cuenta jamás corre riesgo." },
    { title: "Entrega rápida", desc: "Empieza a llegar entre 0 y 6 horas después de tu compra." },
    { title: "Con garantía", desc: "Reponemos cualquier caída durante el período de garantía." },
  ],
  stats: { orders: "Órdenes completadas", clients: "Clientes felices", years: "En el mercado" },
  stepsTitle: "Comprar es facilísimo",
  stepsSub: "En 4 pasos ya estás creciendo",
  steps: [
    { title: "Elige tu paquete", desc: "Selecciona calidad y cantidad según tu objetivo." },
    { title: "Ingresa tu usuario", desc: "Solo tu usuario. Nunca la contraseña. La cuenta debe estar pública." },
    { title: "Paga seguro", desc: "Con MercadoPago o Crypto. Pago protegido." },
    { title: "Mira cómo crece", desc: "Recibes todo automáticamente. Soporte en tiempo real siempre." },
  ],
  teaser: { title: "Desde {qty} seguidores", sub: "Seguidores reales con regalo en los packs grandes y garantía de 90 días.", cta: "Ver paquetes y precios" },
  servicesPage: { title: "Nuestros servicios", sub: "Haz crecer tu Instagram y TikTok. Elige qué necesitas.", from: "Desde" },
  order: {
    title: "Comprar {svc}",
    sub: "{platform} · Entrega rápida · Sin contraseña",
    quality: "Elige la calidad",
    quantity: "Elige la cantidad",
    yourData: "Tus datos",
    payment: "Método de pago",
    userLabel: "Usuario de {platform}",
    linkLabel: "Link del posteo / video",
    publicWarn: "⚠️ Tu cuenta/posteo debe estar público hasta recibir todo.",
    contactLabel: "Email (para avisarte)",
    contactPh: "tu@email.com",
    summary: "Resumen",
    service: "Servicio",
    qualityW: "Calidad",
    bonus: "Bonus gratis",
    total: "Total a recibir",
    price: "Precio",
    pay: "Pagar y comprar",
    processing: "Procesando...",
    secure: "🔒 Pago seguro · Sin contraseña · Garantía incluida",
    recommended: "RECOMENDADO",
    free: "+{n} gratis",
    mpDesc: "Tarjeta o dinero en cuenta. Paga en cuotas.",
    cardLabel: "Tarjeta de crédito",
    cardDesc: "Pagá con tu tarjeta acá mismo, sin salir de la web.",
    usdtDesc: "Pago en cripto (USDT). Te pasamos la wallet al confirmar.",
    interestFree: "💳 3 cuotas SIN interés en este paquete",
    followersBenefits:
      "🛡️ 90 días de garantía · 📉 Muy poca caída · 🔒 Sin contraseña · ⚡ Entrega 0-6 hs",
    errUser: "Ingresa tu usuario.",
    errLink: "Pega el link del posteo/video.",
    errContact: "Déjanos un email para avisarte.",
  },
  quality: {
    global: { label: "Global", desc: "Calidad estándar de servidores globales. Económica y rápida.", war: "30 días" },
    premium: { label: "Premium", desc: "Altísima calidad con foto y publicaciones reales. Caída casi nula. Incluye regalo.", war: "60 días" },
  },
  gracias: {
    title: "¡Recibimos tu pedido!",
    orderFor: "Orden {id} para {user}",
    qty: "Cantidad",
    total: "Total",
    status: "Estado",
    paid: "Pagado ✓",
    waiting: "Esperando pago",
    deliveryTitle: "¡Tu pedido ya está en proceso! ⚡",
    deliveryEta: "Tiempo estimado: 10 minutos a 3 horas",
    gradualTitle: "¿Por qué puede tardar hasta 3 horas?",
    gradualDesc: "Instagram y TikTok detectan crecimientos repentinos. Nuestro sistema distribuye la entrega de forma gradual y progresiva, imitando el crecimiento orgánico natural. Esto protege al 100% tu cuenta y evita cualquier tipo de restricción o penalización.",
    usdtTitle: "Paga con cripto para completar",
    usdtBody: "Envía exactamente {amount} en USDT (red {network}) a esta dirección:",
    usdtAfter: "Después mandanos el comprobante por email o Instagram DM y arrancamos la entrega.",
    usdtDeliveryNote: "Una vez que confirmemos tu pago, procesamos en el mismo plazo: 10 minutos a 3 horas.",
    sendProof: "Enviar comprobante por email",
    mpPending: "Si ya pagaste, en unos minutos tu orden pasa a Pagado automáticamente.",
    noOrder: "Gracias por tu compra. Te vamos a contactar para coordinar la entrega.",
    home: "Volver al inicio",
    wpp: "Hablar con soporte",
  },
  footer: { services: "Servicios", info: "Info", contact: "Contacto", rights: "Todos los derechos reservados.", legal: "Este sitio no está afiliado a Instagram, TikTok ni Meta Platforms, Inc." },
  langPicker: "País / idioma",
};

// --- Argentina: voseo rioplatense ---
const ar: Dict = {
  ...es,
  hero: {
    ...es.hero,
    titlePre: "Hacé crecer tus",
    subtitle: "Seguidores, likes y vistas para Instagram y TikTok. Entrega rápida, sin contraseña y con garantía. Desde {from}.",
    cta1: "Comprar ahora",
  },
  stepsSub: "En 4 pasos ya estás creciendo",
  steps: [
    { title: "Elegí tu paquete", desc: "Seleccioná calidad y cantidad según tu objetivo." },
    { title: "Ingresá tu usuario", desc: "Solo tu usuario. Nunca la contraseña. La cuenta debe estar pública." },
    { title: "Pagá seguro", desc: "Con MercadoPago o Crypto. Pago protegido." },
    { title: "Mirá cómo crece", desc: "Recibís todo automáticamente. Soporte en tiempo real siempre." },
  ],
  teaser: { ...es.teaser, sub: "Seguidores reales con regalo en los packs grandes y garantía de 90 días.", cta: "Ver paquetes y precios" },
  servicesPage: { ...es.servicesPage, sub: "Hacé crecer tu Instagram y TikTok. Elegí qué necesitás." },
  order: {
    ...es.order,
    quality: "Elegí la calidad",
    quantity: "Elegí la cantidad",
    mpDesc: "Tarjeta o dinero en cuenta. Pagá en cuotas.",
    errUser: "Ingresá tu usuario.",
    errLink: "Pegá el link del posteo/video.",
    errContact: "Dejanos un email para avisarte.",
  },
  gracias: {
    ...es.gracias,
    deliveryTitle: "¡Tu pedido ya está en proceso! ⚡",
    deliveryEta: "Tiempo estimado: 10 minutos a 3 horas",
    gradualTitle: "¿Por qué puede tardar hasta 3 horas?",
    gradualDesc: "Instagram y TikTok detectan crecimientos repentinos. Nuestro sistema distribuye la entrega de forma gradual y progresiva, imitando el crecimiento orgánico natural. Esto protege al 100% tu cuenta y evita cualquier tipo de restricción o penalización.",
    usdtBody: "Enviá exactamente {amount} en USDT (red {network}) a esta dirección:",
    usdtAfter: "Después mandanos el comprobante por email o Instagram DM y arrancamos la entrega.",
    usdtDeliveryNote: "Una vez que confirmemos tu pago, procesamos en el mismo plazo: 10 minutos a 3 horas.",
    sendProof: "Enviar comprobante por email",
  },
};

// --- España: toques peninsulares ---
const esES: Dict = {
  ...es,
  hero: { ...es.hero, subtitle: "Seguidores, likes y visualizaciones para Instagram y TikTok. Entrega rápida, sin contraseña y con garantía. Desde {from}." },
  order: { ...es.order, linkLabel: "Enlace de la publicación / vídeo" },
  footer: { ...es.footer },
};

// --- Brasil: portugués ---
const pt: Dict = {
  nav: { home: "Início", services: "Serviços", how: "Como funciona", faq: "Perguntas", buy: "Comprar agora", orders: "Meus pedidos" },
  hero: {
    badge: "+{years} anos · +{orders} pedidos concluídos",
    titlePre: "Faça suas",
    titleHi: "redes",
    titlePost: "crescerem de verdade",
    subtitle: "Seguidores, curtidas e visualizações para Instagram e TikTok. Entrega rápida, sem senha e com garantia. A partir de {from}.",
    cta1: "Comprar agora",
    cta2: "Como funciona?",
    b1: "Sem senha",
    b2: "Pagamento seguro",
    b3: "Entrega rápida",
  },
  features: [
    { title: "Suporte real", desc: "Respondemos em ~1 minuto. Só precisa do seu número de pedido." },
    { title: "100% Seguro", desc: "Nunca pedimos sua senha. Sua conta nunca corre risco." },
    { title: "Entrega rápida", desc: "Começa a chegar entre 0 e 6 horas após a compra." },
    { title: "Com garantia", desc: "Repomos qualquer queda durante o período de garantia." },
  ],
  stats: { orders: "Pedidos concluídos", clients: "Clientes felizes", years: "No mercado" },
  stepsTitle: "Comprar é facílimo",
  stepsSub: "Em 4 passos você já está crescendo",
  steps: [
    { title: "Escolha seu pacote", desc: "Selecione qualidade e quantidade conforme seu objetivo." },
    { title: "Informe seu usuário", desc: "Só seu usuário. Nunca a senha. A conta deve estar pública." },
    { title: "Pague com segurança", desc: "Com MercadoPago ou Crypto. Pagamento protegido." },
    { title: "Veja crescer", desc: "Recebe tudo automaticamente. Suporte em tempo real sempre." },
  ],
  teaser: { title: "A partir de {qty} seguidores", sub: "Seguidores reais com brinde nos pacotes grandes e garantia de 90 dias.", cta: "Ver pacotes e preços" },
  servicesPage: { title: "Nossos serviços", sub: "Faça seu Instagram e TikTok crescerem. Escolha o que precisa.", from: "A partir de" },
  order: {
    title: "Comprar {svc}",
    sub: "{platform} · Entrega rápida · Sem senha",
    quality: "Escolha a qualidade",
    quantity: "Escolha a quantidade",
    yourData: "Seus dados",
    payment: "Forma de pagamento",
    userLabel: "Usuário do {platform}",
    linkLabel: "Link da publicação / vídeo",
    publicWarn: "⚠️ Sua conta/publicação deve estar pública até receber tudo.",
    contactLabel: "E-mail (para avisar você)",
    contactPh: "seu@email.com ou +55 11...",
    summary: "Resumo",
    service: "Serviço",
    qualityW: "Qualidade",
    bonus: "Brinde grátis",
    total: "Total a receber",
    price: "Preço",
    pay: "Pagar e comprar",
    processing: "Processando...",
    secure: "🔒 Pagamento seguro · Sem senha · Garantia incluída",
    recommended: "RECOMENDADO",
    free: "+{n} grátis",
    mpDesc: "Cartão ou saldo em conta. Pague em parcelas.",
    cardLabel: "Cartão de crédito",
    cardDesc: "Pague com seu cartão aqui mesmo, sem sair do site.",
    usdtDesc: "Pagamento em cripto (USDT). Enviamos a carteira ao confirmar.",
    interestFree: "💳 3x SEM juros neste pacote",
    followersBenefits:
      "🛡️ 90 dias de garantia · 📉 Queda mínima · 🔒 Sem senha · ⚡ Entrega 0-6h",
    errUser: "Informe seu usuário.",
    errLink: "Cole o link da publicação/vídeo.",
    errContact: "Deixe um e-mail para avisarmos.",
  },
  quality: {
    global: { label: "Global", desc: "Qualidade padrão de servidores globais. Econômica e rápida.", war: "30 dias" },
    premium: { label: "Premium", desc: "Altíssima qualidade com foto e posts reais. Queda quase nula. Inclui brinde.", war: "60 dias" },
  },
  gracias: {
    title: "Recebemos seu pedido!",
    orderFor: "Pedido {id} para {user}",
    qty: "Quantidade",
    total: "Total",
    status: "Status",
    paid: "Pago ✓",
    waiting: "Aguardando pagamento",
    deliveryTitle: "Seu pedido já está sendo processado! ⚡",
    deliveryEta: "Tempo estimado: 10 minutos a 3 horas",
    gradualTitle: "Por que pode levar até 3 horas?",
    gradualDesc: "Instagram e TikTok detectam crescimentos repentinos. Nosso sistema distribui a entrega de forma gradual e progressiva, imitando o crescimento orgânico natural. Isso protege 100% sua conta e evita qualquer tipo de restrição ou penalização.",
    usdtTitle: "Pague com cripto para concluir",
    usdtBody: "Envie exatamente {amount} em USDT (rede {network}) para este endereço:",
    usdtAfter: "Depois nos envie o comprovante por e-mail ou Instagram DM e iniciamos a entrega.",
    usdtDeliveryNote: "Assim que confirmarmos seu pagamento, processamos no mesmo prazo: 10 minutos a 3 horas.",
    sendProof: "Enviar comprovante por e-mail",
    mpPending: "Se já pagou, em alguns minutos seu pedido muda para Pago automaticamente.",
    noOrder: "Obrigado pela compra. Vamos entrar em contato para combinar a entrega.",
    home: "Voltar ao início",
    wpp: "Falar com suporte",
  },
  footer: { services: "Serviços", info: "Info", contact: "Contato", rights: "Todos os direitos reservados.", legal: "Este site não é afiliado ao Instagram, TikTok nem à Meta Platforms, Inc." },
  langPicker: "País / idioma",
};

const dicts: Record<Locale, Dict> = {
  ar,
  mx: es,
  co: es,
  cl: es,
  pe: es,
  es: esES,
  br: pt,
};

export function getDict(locale: Locale): Dict {
  return dicts[locale];
}

// Reemplaza {clave} por su valor.
export function fmt(str: string, vars: Record<string, string | number>): string {
  return str.replace(/\{(\w+)\}/g, (_, k) =>
    k in vars ? String(vars[k]) : `{${k}}`
  );
}
