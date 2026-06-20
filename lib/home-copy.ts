// ============================================================
//  COPY DE LA HOME (estilo conversión, tono cercano)
//  - "es" = tuteo neutro (MX, CO, CL, PE, ES)
//  - "ar" = voseo rioplatense
//  - "pt" = português de Brasil
// ============================================================

import type { Locale } from "./i18n";
import { localeConfig } from "./i18n";

export interface HomeCopy {
  hero: {
    rating: string; // "4.9/5 de +1.500 órdenes"
    title1: string;
    titleHi: string; // parte resaltada
    title2: string;
    sub: string;
    bullets: string[]; // con emoji incluido
    cta: string;
    ctaSub: string;
  };
  stats: { orders: string; clients: string; years: string };
  free: string; // "gratis"
  niches: { title: string; sub: string; items: string[] };
  steps: { title: string; sub: string; items: { emoji: string; title: string; desc: string }[] };
  packs: {
    title: string;
    sub: string;
    popular: string;
    cta: string;
    names: [string, string, string];
    perks: string[][];
    moreLink: string;
  };
  why: {
    title: string;
    sub: string;
    items: { emoji: string; title: string; desc: string }[];
  };
  trust: { title: string; items: { emoji: string; title: string; desc: string }[] };
  reviews: { title: string; sub: string; items: { name: string; city: string; text: string; service: string }[] };
  faq: { title: string; items: { q: string; a: string }[] };
  finalCta: { title: string; sub: string; cta: string };
  feed: { bought: string; ago: string; names: string[]; cities: string[]; services: string[] };
}

const es: HomeCopy = {
  hero: {
    rating: "4.9/5 según +700 clientes",
    title1: "Tu perfil vacío te está",
    titleHi: "costando ventas",
    title2: ".",
    sub: "Nadie confía en una cuenta con 200 seguidores. Inyecta autoridad a tu perfil hoy: seguidores, likes y vistas reales para Instagram y TikTok, desde {from}.",
    bullets: [
      "⚡ Entrega total en inmediata",
      "🔒 Sin contraseña, cero riesgo",
      "🛡️ Garantía de reposición incluida",
      "💳 MercadoPago, tarjeta o USDT",
    ],
    cta: "Quiero crecer ahora",
    ctaSub: "Desde {from} · Pago 100% seguro",
  },
  stats: { orders: "órdenes completadas", clients: "clientes felices", years: "años de experiencia" },
  free: "gratis",
  niches: {
    title: "Funciona para cualquier rubro",
    sub: "Emprendedores, marcas y creadores ya lo usan para despegar.",
    items: [
      "🛍️ Tiendas online", "💅 Estética y belleza", "🍔 Gastronomía", "🏋️ Fitness y gym",
      "🎵 Músicos y DJs", "📸 Modelos e influencers", "🏠 Inmobiliarias", "💼 Servicios profesionales",
      "🚗 Automotor", "✈️ Viajes y turismo", "🐶 Mascotas", "🎮 Streamers y gamers",
      "👗 Moda e indumentaria", "📚 Cursos y coaching", "⚽ Deportes", "🎉 Eventos y fiestas",
    ],
  },
  steps: {
    title: "Comprar te toma 2 minutos",
    sub: "Sin registros, sin contraseñas, sin vueltas.",
    items: [
      { emoji: "🛒", title: "1. Elige tu paquete", desc: "Seguidores, likes o vistas. La cantidad que necesites." },
      { emoji: "👤", title: "2. Pon tu usuario", desc: "Solo tu @usuario. Nunca te pedimos la contraseña." },
      { emoji: "🚀", title: "3. Mira cómo crece", desc: "Pagas seguro y lo recibís en inmediata." },
    ],
  },
  packs: {
    title: "Packs de credibilidad",
    sub: "Seguidores de Instagram con garantía de reposición. Precio final, sin sorpresas.",
    popular: "🔥 MÁS ELEGIDO",
    cta: "Elegir este pack",
    names: ["Arranque", "Influencer", "Autoridad"],
    perks: [
      ["Entrega en inmediata", "Sin contraseña", "Garantía de reposición", "Soporte en tiempo real"],
      ["Entrega en inmediata", "Sin contraseña", "Garantía de reposición", "Soporte en tiempo real", "Seguidores de regalo"],
      ["Entrega en inmediata", "Sin contraseña", "Garantía de reposición", "Soporte prioritario", "Seguidores de regalo"],
    ],
    moreLink: "Ver todos los paquetes (likes, vistas, TikTok y más) →",
  },
  why: {
    title: "Por qué funciona",
    sub: "No es magia, es psicología: los números mueven al algoritmo y a las personas.",
    items: [
      { emoji: "🧲", title: "Efecto arrastre", desc: "La gente sigue cuentas que ya sigue mucha gente. Un perfil grande atrae seguidores orgánicos solo." },
      { emoji: "📈", title: "El algoritmo te empuja", desc: "Más interacción = más alcance. Instagram y TikTok muestran tu contenido a más personas." },
      { emoji: "🤝", title: "Confianza instantánea", desc: "Antes de comprarte, te stalkean. Un perfil con números transmite seriedad y cierra ventas." },
    ],
  },
  trust: {
    title: "Tu cuenta está segura. Siempre.",
    items: [
      { emoji: "🔒", title: "Nunca pedimos tu contraseña", desc: "Solo necesitamos tu @usuario público. Nada más." },
      { emoji: "🛡️", title: "Cero riesgo de baneo", desc: "Trabajamos hace +5 años y jamás una cuenta tuvo problemas." },
      { emoji: "♻️", title: "Garantía de reposición", desc: "Si algo se cae durante la garantía, lo reponemos gratis." },
      { emoji: "💬", title: "Soporte humano real", desc: "Chat o Instagram DM, respondemos en minutos. Sin bots." },
    ],
  },
  reviews: {
    title: "Lo que dicen los clientes",
    sub: "Más de 1.500 órdenes completadas.",
    items: [
      { name: "Martín G.", city: "CDMX", text: "Sumé 5 mil seguidores y se notó al instante, me empezaron a escribir más clientes a la tienda.", service: "5.000 seguidores" },
      { name: "Carolina P.", city: "Bogotá", text: "Pedí likes para unas publicaciones y el alcance subió muchísimo. El soporte respondió al instante, súper simple.", service: "2.500 likes" },
      { name: "Nicolás R.", city: "Santiago", text: "Tenía la cuenta muerta y ahora se ve profesional. Llegaron rápido y casi no se cayeron.", service: "10.000 seguidores" },
    ],
  },
  faq: {
    title: "Preguntas frecuentes",
    items: [
      { q: "¿Necesitan mi contraseña?", a: "No, nunca. Solo tu @usuario y que la cuenta esté pública mientras dura la entrega. Jamás te vamos a pedir la contraseña." },
      { q: "¿Me pueden banear la cuenta?", a: "No. En más de 5 años y miles de órdenes, ninguna cuenta tuvo problemas. No hacemos nada que viole el acceso a tu cuenta." },
      { q: "¿Cuánto tarda en llegar?", a: "La entrega total se completa en entre 10 minutos y 2 horas, de forma gradual para proteger tu cuenta." },
      { q: "¿Y si se caen los seguidores?", a: "Tienen garantía de reposición: si hay caídas dentro del período de garantía, los reponemos gratis. Escribinos por chat o Instagram DM y listo." },
      { q: "¿Cómo pago?", a: "Con MercadoPago (tarjeta, débito o dinero en cuenta) o con USDT. El pago es 100% seguro y procesado por plataformas oficiales." },
    ],
  },
  finalCta: {
    title: "¿Listo para que tu perfil imponga respeto?",
    sub: "Miles ya lo hicieron. Tu competencia probablemente también.",
    cta: "Empezar ahora",
  },
  feed: {
    bought: "compró",
    ago: "hace {n} min",
    names: ["Lucía", "Mateo", "Valentina", "Santiago", "Camila", "Sebastián", "Florencia", "Tomás", "Agustina", "Joaquín"],
    cities: ["CDMX", "Guadalajara", "Bogotá", "Medellín", "Santiago", "Lima", "Madrid", "Barcelona"],
    services: ["1.000 seguidores", "2.500 seguidores", "5.000 seguidores", "1.000 likes", "10.000 vistas", "500 seguidores"],
  },
};

// --- Argentina: voseo ---
const ar: HomeCopy = {
  ...es,
  hero: {
    ...es.hero,
    sub: "Nadie confía en una cuenta con 200 seguidores. Inyectale autoridad a tu perfil hoy: seguidores, likes y vistas para Instagram y TikTok, desde {from}.",
    bullets: [
      "⚡ Entrega total en inmediata",
      "🔒 Sin contraseña, cero riesgo",
      "🛡️ Garantía de reposición incluida",
      "💳 MercadoPago, tarjeta o USDT",
    ],
  },
  steps: {
    title: "Comprar te toma 2 minutos",
    sub: "Sin registros, sin contraseñas, sin vueltas.",
    items: [
      { emoji: "🛒", title: "1. Elegí tu paquete", desc: "Seguidores, likes o vistas. La cantidad que necesites." },
      { emoji: "👤", title: "2. Poné tu usuario", desc: "Solo tu @usuario. Nunca te pedimos la contraseña." },
      { emoji: "🚀", title: "3. Mirá cómo crece", desc: "Pagás seguro y lo recibís en inmediata." },
    ],
  },
  reviews: {
    ...es.reviews,
    items: [
      { name: "Martín G.", city: "Córdoba", text: "Sumé 5 mil seguidores y se notó al toque, me empezaron a escribir más clientes a la tienda.", service: "5.000 seguidores" },
      { name: "Caro P.", city: "Buenos Aires", text: "Pedí likes para unos posteos y subió el alcance un montón. Cero drama, el soporte respondió en segundos.", service: "2.500 likes" },
      { name: "Nico R.", city: "Rosario", text: "Tenía la cuenta muerta y ahora se ve profesional. Llegaron rápido y casi no se cayeron.", service: "10.000 seguidores" },
    ],
  },
  faq: {
    title: "Preguntas frecuentes",
    items: [
      { q: "¿Necesitan mi contraseña?", a: "No, nunca. Solo tu @usuario y que la cuenta esté pública mientras dura la entrega. Jamás te vamos a pedir la contraseña." },
      { q: "¿Me pueden banear la cuenta?", a: "No. En más de 5 años y miles de órdenes, ninguna cuenta tuvo problemas. No hacemos nada que viole el acceso a tu cuenta." },
      { q: "¿Cuánto tarda en llegar?", a: "La entrega total se completa en entre 10 minutos y 2 horas, de forma gradual para proteger tu cuenta." },
      { q: "¿Y si se caen los seguidores?", a: "Tienen garantía de reposición: si hay caídas dentro del período de garantía, los reponemos gratis. Escribinos por chat o Instagram DM y listo." },
      { q: "¿Cómo pago?", a: "Con MercadoPago (tarjeta, débito o dinero en cuenta) o con USDT. El pago es 100% seguro y procesado por plataformas oficiales." },
    ],
  },
  finalCta: {
    title: "¿Listo para que tu perfil imponga respeto?",
    sub: "Miles ya lo hicieron. Tu competencia seguramente también.",
    cta: "Empezar ahora",
  },
  feed: {
    bought: "compró",
    ago: "hace {n} min",
    names: ["Lucía", "Mateo", "Valen", "Santi", "Cami", "Seba", "Flor", "Tomi", "Agus", "Juani"],
    // Buenos Aires repetido para que aparezca más seguido
    cities: [
      "Buenos Aires", "Buenos Aires", "Buenos Aires", "CABA", "La Plata",
      "Quilmes", "Lomas de Zamora", "Morón", "Pilar", "Mar del Plata",
      "Córdoba", "Rosario", "Mendoza", "Tucumán", "Salta", "Neuquén",
      "Santa Fe", "Corrientes", "Misiones", "Entre Ríos",
    ],
    services: ["1.000 seguidores", "2.500 seguidores", "5.000 seguidores", "1.000 likes", "10.000 vistas", "500 seguidores"],
  },
};

// --- Brasil ---
const pt: HomeCopy = {
  hero: {
    rating: "4.9/5 segundo +700 clientes",
    title1: "Seu perfil vazio está te",
    titleHi: "custando vendas",
    title2: ".",
    sub: "Ninguém confia em uma conta com 200 seguidores. Injete autoridade no seu perfil hoje: seguidores, curtidas e visualizações para Instagram e TikTok, a partir de {from}.",
    bullets: [
      "⚡ Entrega total em inmediata",
      "🔒 Sem senha, risco zero",
      "🛡️ Garantia de reposição incluída",
      "💳 MercadoPago, cartão ou USDT",
    ],
    cta: "Quero crescer agora",
    ctaSub: "A partir de {from} · Pagamento 100% seguro",
  },
  stats: { orders: "pedidos concluídos", clients: "clientes felizes", years: "anos de experiência" },
  free: "grátis",
  niches: {
    title: "Funciona para qualquer nicho",
    sub: "Empreendedores, marcas e criadores já usam para decolar.",
    items: [
      "🛍️ Lojas online", "💅 Estética e beleza", "🍔 Gastronomia", "🏋️ Fitness e academia",
      "🎵 Músicos e DJs", "📸 Modelos e influencers", "🏠 Imobiliárias", "💼 Serviços profissionais",
      "🚗 Automotivo", "✈️ Viagens e turismo", "🐶 Pets", "🎮 Streamers e gamers",
      "👗 Moda", "📚 Cursos e coaching", "⚽ Esportes", "🎉 Eventos e festas",
    ],
  },
  steps: {
    title: "Comprar leva 2 minutos",
    sub: "Sem cadastro, sem senha, sem complicação.",
    items: [
      { emoji: "🛒", title: "1. Escolha seu pacote", desc: "Seguidores, curtidas ou visualizações. A quantidade que precisar." },
      { emoji: "👤", title: "2. Informe seu usuário", desc: "Só seu @usuario. Nunca pedimos a senha." },
      { emoji: "🚀", title: "3. Veja crescer", desc: "Pague com segurança e você recebe em inmediata." },
    ],
  },
  packs: {
    title: "Packs de credibilidade",
    sub: "Seguidores de Instagram com garantia de reposição. Preço final, sem surpresas.",
    popular: "🔥 MAIS ESCOLHIDO",
    cta: "Escolher este pack",
    names: ["Início", "Influencer", "Autoridade"],
    perks: [
      ["Entrega em inmediata", "Sem senha", "Garantia de reposição", "Suporte em tempo real"],
      ["Entrega em inmediata", "Sem senha", "Garantia de reposição", "Suporte em tempo real", "Seguidores de brinde"],
      ["Entrega em inmediata", "Sem senha", "Garantia de reposição", "Suporte prioritário", "Seguidores de brinde"],
    ],
    moreLink: "Ver todos os pacotes (curtidas, views, TikTok e mais) →",
  },
  why: {
    title: "Por que funciona",
    sub: "Não é mágica, é psicologia: os números movem o algoritmo e as pessoas.",
    items: [
      { emoji: "🧲", title: "Efeito manada", desc: "As pessoas seguem contas que muita gente já segue. Um perfil grande atrai seguidores orgânicos sozinho." },
      { emoji: "📈", title: "O algoritmo te impulsiona", desc: "Mais interação = mais alcance. Instagram e TikTok mostram seu conteúdo para mais pessoas." },
      { emoji: "🤝", title: "Confiança instantânea", desc: "Antes de comprar, te stalkeiam. Um perfil com números transmite seriedade e fecha vendas." },
    ],
  },
  trust: {
    title: "Sua conta está segura. Sempre.",
    items: [
      { emoji: "🔒", title: "Nunca pedimos sua senha", desc: "Só precisamos do seu @usuario público. Nada mais." },
      { emoji: "🛡️", title: "Risco zero de banimento", desc: "Trabalhamos há +5 anos e nenhuma conta teve problemas." },
      { emoji: "♻️", title: "Garantia de reposição", desc: "Se algo cair durante a garantia, repomos grátis." },
      { emoji: "💬", title: "Suporte humano real", desc: "Chat ou Instagram DM, respondemos em minutos. Sem robôs." },
    ],
  },
  reviews: {
    title: "O que dizem os clientes",
    sub: "Mais de 1.500 pedidos concluídos.",
    items: [
      { name: "Lucas M.", city: "São Paulo", text: "Ganhei 5 mil seguidores e a diferença foi na hora, mais gente chamando na loja.", service: "5.000 seguidores" },
      { name: "Bea S.", city: "Rio de Janeiro", text: "Pedi curtidas e o alcance subiu muito. O suporte respondeu na hora, super simples.", service: "2.500 curtidas" },
      { name: "Diego A.", city: "Curitiba", text: "Minha conta parecia morta, agora parece profissional. Chegou rápido e não caiu.", service: "10.000 seguidores" },
    ],
  },
  faq: {
    title: "Perguntas frequentes",
    items: [
      { q: "Vocês precisam da minha senha?", a: "Não, nunca. Só seu @usuario e a conta pública durante a entrega. Jamais pediremos sua senha." },
      { q: "Minha conta pode ser banida?", a: "Não. Em mais de 5 anos e milhares de pedidos, nenhuma conta teve problemas." },
      { q: "Quanto tempo demora?", a: "A entrega é concluída em inmediata (10 min - 2 hs), de forma gradual para parecer natural." },
      { q: "E se os seguidores caírem?", a: "Tem garantia de reposição: se houver quedas dentro do período de garantia, repomos grátis. É só chamar no chat ou Instagram DM." },
      { q: "Como pago?", a: "Com MercadoPago (cartão, débito ou saldo) ou USDT. Pagamento 100% seguro por plataformas oficiais." },
    ],
  },
  finalCta: {
    title: "Pronto para seu perfil impor respeito?",
    sub: "Milhares já fizeram. Sua concorrência provavelmente também.",
    cta: "Começar agora",
  },
  feed: {
    bought: "comprou",
    ago: "há {n} min",
    names: ["Júlia", "Pedro", "Larissa", "Gabriel", "Amanda", "Rafael", "Bianca", "Thiago", "Carla", "Bruno"],
    cities: ["São Paulo", "Rio de Janeiro", "Curitiba", "Belo Horizonte", "Porto Alegre", "Salvador", "Fortaleza"],
    services: ["1.000 seguidores", "2.500 seguidores", "5.000 seguidores", "1.000 curtidas", "10.000 views", "500 seguidores"],
  },
};

// ---- Nombres y ciudades del feed de compras, típicos de cada país ----
const feedByLocale: Partial<Record<Locale, Pick<HomeCopy["feed"], "names" | "cities">>> = {
  mx: {
    names: ["Fernanda", "Alejandro", "Ximena", "Diego", "Guadalupe", "Carlos", "Daniela", "Luis", "María José", "Jorge"],
    cities: ["CDMX", "CDMX", "Guadalajara", "Monterrey", "Puebla", "Tijuana", "León", "Querétaro", "Mérida", "Toluca"],
  },
  co: {
    names: ["Valentina", "Juan Pablo", "Camilo", "Mariana", "Andrés", "Paula", "Felipe", "Laura", "Esteban", "Daniela"],
    cities: ["Bogotá", "Bogotá", "Medellín", "Cali", "Barranquilla", "Cartagena", "Bucaramanga", "Pereira", "Cúcuta"],
  },
  cl: {
    names: ["Matías", "Catalina", "Benjamín", "Constanza", "Vicente", "Fernanda", "Cristóbal", "Javiera", "Felipe", "Antonia"],
    cities: ["Santiago", "Santiago", "Valparaíso", "Concepción", "Viña del Mar", "Antofagasta", "Temuco", "La Serena", "Rancagua"],
  },
  pe: {
    names: ["José", "Fiorella", "Luis", "Carmen", "Jorge", "María", "Miguel", "Lucía", "Carlos", "Rosa"],
    cities: ["Lima", "Lima", "Arequipa", "Trujillo", "Chiclayo", "Piura", "Cusco", "Huancayo", "Iquitos"],
  },
  es: {
    names: ["Pablo", "Lucía", "Álvaro", "Marta", "Javier", "Carmen", "Sergio", "Paula", "Adrián", "Nerea"],
    cities: ["Madrid", "Madrid", "Barcelona", "Valencia", "Sevilla", "Zaragoza", "Málaga", "Bilbao", "Murcia", "Alicante"],
  },
};

export function getHomeCopy(locale: Locale): HomeCopy {
  if (locale === "ar") return ar;
  const base = localeConfig[locale].lang === "pt" ? pt : es;
  const feed = feedByLocale[locale];
  if (!feed) return base;
  return { ...base, feed: { ...base.feed, ...feed } };
}
