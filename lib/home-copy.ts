// ============================================================
//  COPY DE LA HOME (estilo conversiÃ³n, tono cercano)
//  - "es" = tuteo neutro (MX, CO, CL, PE, ES)
//  - "ar" = voseo rioplatense
//  - "pt" = portuguÃ©s de Brasil
// ============================================================

import type { Locale } from "./i18n";
import { localeConfig } from "./i18n";

export interface HomeCopy {
  hero: {
    rating: string; // "4.9/5 de +1.500 Ã³rdenes"
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
    rating: "4.9/5 segÃºn +700 clientes",
    title1: "Tu perfil vacÃ­o te estÃ¡",
    titleHi: "costando ventas",
    title2: ".",
    sub: "Nadie confÃ­a en una cuenta con 200 seguidores. Inyecta autoridad a tu perfil hoy: seguidores, likes y vistas reales para Instagram y TikTok, desde {from}.",
    bullets: [
      "âš¡ Entrega total en inmediata",
      "ðŸ”’ Sin contraseÃ±a, cero riesgo",
      "ðŸ›¡ï¸ GarantÃ­a de reposiciÃ³n incluida",
      "ðŸ’³ MercadoPago, tarjeta o USDT",
    ],
    cta: "Quiero crecer ahora",
    ctaSub: "Desde {from} Â· Pago 100% seguro",
  },
  stats: { orders: "Ã³rdenes completadas", clients: "clientes felices", years: "aÃ±os de experiencia" },
  free: "gratis",
  niches: {
    title: "Funciona para cualquier rubro",
    sub: "Emprendedores, marcas y creadores ya lo usan para despegar.",
    items: [
      "ðŸ›ï¸ Tiendas online", "ðŸ’… EstÃ©tica y belleza", "ðŸ” GastronomÃ­a", "ðŸ‹ï¸ Fitness y gym",
      "ðŸŽµ MÃºsicos y DJs", "ðŸ“¸ Modelos e influencers", "ðŸ  Inmobiliarias", "ðŸ’¼ Servicios profesionales",
      "ðŸš— Automotor", "âœˆï¸ Viajes y turismo", "ðŸ¶ Mascotas", "ðŸŽ® Streamers y gamers",
      "ðŸ‘— Moda e indumentaria", "ðŸ“š Cursos y coaching", "âš½ Deportes", "ðŸŽ‰ Eventos y fiestas",
    ],
  },
  steps: {
    title: "Comprar te toma 2 minutos",
    sub: "Sin registros, sin contraseÃ±as, sin vueltas.",
    items: [
      { emoji: "ðŸ›’", title: "1. Elige tu paquete", desc: "Seguidores, likes o vistas. La cantidad que necesites." },
      { emoji: "ðŸ‘¤", title: "2. Pon tu usuario", desc: "Solo tu @usuario. Nunca te pedimos la contraseÃ±a." },
      { emoji: "ðŸš€", title: "3. Mira cÃ³mo crece", desc: "Pagas seguro y lo recibÃ­s en inmediata." },
    ],
  },
  packs: {
    title: "Packs de credibilidad",
    sub: "Seguidores de Instagram con garantÃ­a de reposiciÃ³n. Precio final, sin sorpresas.",
    popular: "ðŸ”¥ MÃS ELEGIDO",
    cta: "Elegir este pack",
    names: ["Arranque", "Influencer", "Autoridad"],
    perks: [
      ["Entrega en inmediata", "Sin contraseÃ±a", "GarantÃ­a de reposiciÃ³n", "Soporte en tiempo real"],
      ["Entrega en inmediata", "Sin contraseÃ±a", "GarantÃ­a de reposiciÃ³n", "Soporte en tiempo real", "Seguidores de regalo"],
      ["Entrega en inmediata", "Sin contraseÃ±a", "GarantÃ­a de reposiciÃ³n", "Soporte prioritario", "Seguidores de regalo"],
    ],
    moreLink: "Ver todos los paquetes (likes, vistas, TikTok y mÃ¡s) â†’",
  },
  why: {
    title: "Por quÃ© funciona",
    sub: "No es magia, es psicologÃ­a: los nÃºmeros mueven al algoritmo y a las personas.",
    items: [
      { emoji: "ðŸ§²", title: "Efecto arrastre", desc: "La gente sigue cuentas que ya sigue mucha gente. Un perfil grande atrae seguidores orgÃ¡nicos solo." },
      { emoji: "ðŸ“ˆ", title: "El algoritmo te empuja", desc: "MÃ¡s interacciÃ³n = mÃ¡s alcance. Instagram y TikTok muestran tu contenido a mÃ¡s personas." },
      { emoji: "ðŸ¤", title: "Confianza instantÃ¡nea", desc: "Antes de comprarte, te stalkean. Un perfil con nÃºmeros transmite seriedad y cierra ventas." },
    ],
  },
  trust: {
    title: "Tu cuenta estÃ¡ segura. Siempre.",
    items: [
      { emoji: "ðŸ”‘", title: "Nunca pedimos tu contraseÃ±a", desc: "Solo necesitamos tu @usuario pÃºblico. Nada mÃ¡s." },
      { emoji: "ðŸ›¡ï¸", title: "Cero riesgo de baneo", desc: "Trabajamos hace +5 aÃ±os y jamÃ¡s una cuenta tuvo problemas." },
      { emoji: "â™»ï¸", title: "GarantÃ­a de reposiciÃ³n", desc: "Si algo se cae durante la garantÃ­a, lo reponemos gratis." },
      { emoji: "ðŸ’¬", title: "Soporte humano real", desc: "Chat o Instagram DM, respondemos en minutos. Sin bots." },
    ],
  },
  reviews: {
    title: "Lo que dicen los clientes",
    sub: "MÃ¡s de 1.500 Ã³rdenes completadas.",
    items: [
      { name: "MartÃ­n G.", city: "CDMX", text: "SumÃ© 5 mil seguidores y se notÃ³ al instante, me empezaron a escribir mÃ¡s clientes a la tienda.", service: "5.000 seguidores" },
      { name: "Carolina P.", city: "BogotÃ¡", text: "PedÃ­ likes para unas publicaciones y el alcance subiÃ³ muchÃ­simo. El soporte respondiÃ³ al instante, sÃºper simple.", service: "2.500 likes" },
      { name: "NicolÃ¡s R.", city: "Santiago", text: "TenÃ­a la cuenta muerta y ahora se ve profesional. Llegaron rÃ¡pido y casi no se cayeron.", service: "10.000 seguidores" },
    ],
  },
  faq: {
    title: "Preguntas frecuentes",
    items: [
      { q: "Â¿Necesitan mi contraseÃ±a?", a: "No, nunca. Solo tu @usuario y que la cuenta estÃ© pÃºblica mientras dura la entrega. JamÃ¡s te vamos a pedir la contraseÃ±a." },
      { q: "Â¿Me pueden banear la cuenta?", a: "No. En mÃ¡s de 5 aÃ±os y miles de Ã³rdenes, ninguna cuenta tuvo problemas. No hacemos nada que viole el acceso a tu cuenta." },
      { q: "Â¿CuÃ¡nto tarda en llegar?", a: "La entrega total se completa en entre 10 minutos y 2 horas, de forma gradual para proteger tu cuenta." },
      { q: "Â¿Y si se caen los seguidores?", a: "Tienen garantÃ­a de reposiciÃ³n: si hay caÃ­das dentro del perÃ­odo de garantÃ­a, los reponemos gratis. Escribinos por chat o Instagram DM y listo." },
      { q: "Â¿CÃ³mo pago?", a: "Con MercadoPago (tarjeta, dÃ©bito o dinero en cuenta) o con USDT. El pago es 100% seguro y procesado por plataformas oficiales." },
    ],
  },
  finalCta: {
    title: "Â¿Listo para que tu perfil imponga respeto?",
    sub: "Miles ya lo hicieron. Tu competencia probablemente tambiÃ©n.",
    cta: "Empezar ahora",
  },
  feed: {
    bought: "comprÃ³",
    ago: "hace {n} min",
    names: ["LucÃ­a", "Mateo", "Valentina", "Santiago", "Camila", "SebastiÃ¡n", "Florencia", "TomÃ¡s", "Agustina", "JoaquÃ­n"],
    cities: ["CDMX", "Guadalajara", "BogotÃ¡", "MedellÃ­n", "Santiago", "Lima", "Madrid", "Barcelona"],
    services: ["1.000 seguidores", "2.500 seguidores", "5.000 seguidores", "1.000 likes", "10.000 vistas", "500 seguidores"],
  },
};

// --- Argentina: voseo ---
const ar: HomeCopy = {
  ...es,
  hero: {
    ...es.hero,
    sub: "Nadie confÃ­a en una cuenta con 200 seguidores. Inyectale autoridad a tu perfil hoy: seguidores, likes y vistas para Instagram y TikTok, desde {from}.",
    bullets: [
      "âš¡ Entrega total en inmediata",
      "ðŸ”’ Sin contraseÃ±a, cero riesgo",
      "ðŸ›¡ï¸ GarantÃ­a de reposiciÃ³n incluida",
      "ðŸ’³ MercadoPago, tarjeta o USDT",
    ],
  },
  steps: {
    title: "Comprar te toma 2 minutos",
    sub: "Sin registros, sin contraseÃ±as, sin vueltas.",
    items: [
      { emoji: "ðŸ›’", title: "1. ElegÃ­ tu paquete", desc: "Seguidores, likes o vistas. La cantidad que necesites." },
      { emoji: "ðŸ‘¤", title: "2. PonÃ© tu usuario", desc: "Solo tu @usuario. Nunca te pedimos la contraseÃ±a." },
      { emoji: "ðŸš€", title: "3. MirÃ¡ cÃ³mo crece", desc: "PagÃ¡s seguro y lo recibÃ­s en inmediata." },
    ],
  },
  reviews: {
    ...es.reviews,
    items: [
      { name: "MartÃ­n G.", city: "CÃ³rdoba", text: "SumÃ© 5 mil seguidores y se notÃ³ al toque, me empezaron a escribir mÃ¡s clientes a la tienda.", service: "5.000 seguidores" },
      { name: "Caro P.", city: "Buenos Aires", text: "PedÃ­ likes para unos posteos y subiÃ³ el alcance un montÃ³n. Cero drama, el soporte respondiÃ³ en segundos.", service: "2.500 likes" },
      { name: "Nico R.", city: "Rosario", text: "TenÃ­a la cuenta muerta y ahora se ve profesional. Llegaron rÃ¡pido y casi no se cayeron.", service: "10.000 seguidores" },
    ],
  },
  faq: {
    title: "Preguntas frecuentes",
    items: [
      { q: "Â¿Necesitan mi contraseÃ±a?", a: "No, nunca. Solo tu @usuario y que la cuenta estÃ© pÃºblica mientras dura la entrega. JamÃ¡s te vamos a pedir la contraseÃ±a." },
      { q: "Â¿Me pueden banear la cuenta?", a: "No. En mÃ¡s de 5 aÃ±os y miles de Ã³rdenes, ninguna cuenta tuvo problemas. No hacemos nada que viole el acceso a tu cuenta." },
      { q: "Â¿CuÃ¡nto tarda en llegar?", a: "La entrega total se completa en entre 10 minutos y 2 horas, de forma gradual para proteger tu cuenta." },
      { q: "Â¿Y si se caen los seguidores?", a: "Tienen garantÃ­a de reposiciÃ³n: si hay caÃ­das dentro del perÃ­odo de garantÃ­a, los reponemos gratis. Escribinos por chat o Instagram DM y listo." },
      { q: "Â¿CÃ³mo pago?", a: "Con MercadoPago (tarjeta, dÃ©bito o dinero en cuenta) o con USDT. El pago es 100% seguro y procesado por plataformas oficiales." },
    ],
  },
  finalCta: {
    title: "Â¿Listo para que tu perfil imponga respeto?",
    sub: "Miles ya lo hicieron. Tu competencia seguramente tambiÃ©n.",
    cta: "Empezar ahora",
  },
  feed: {
    bought: "comprÃ³",
    ago: "hace {n} min",
    names: ["LucÃ­a", "Mateo", "Valen", "Santi", "Cami", "Seba", "Flor", "Tomi", "Agus", "Juani"],
    // Buenos Aires repetido para que aparezca mÃ¡s seguido
    cities: [
      "Buenos Aires", "Buenos Aires", "Buenos Aires", "CABA", "La Plata",
      "Quilmes", "Lomas de Zamora", "MorÃ³n", "Pilar", "Mar del Plata",
      "CÃ³rdoba", "Rosario", "Mendoza", "TucumÃ¡n", "Salta", "NeuquÃ©n",
      "Santa Fe", "Corrientes", "Misiones", "Entre RÃ­os",
    ],
    services: ["1.000 seguidores", "2.500 seguidores", "5.000 seguidores", "1.000 likes", "10.000 vistas", "500 seguidores"],
  },
};

// --- Brasil ---
const pt: HomeCopy = {
  hero: {
    rating: "4.9/5 segundo +700 clientes",
    title1: "Seu perfil vazio estÃ¡ te",
    titleHi: "custando vendas",
    title2: ".",
    sub: "NinguÃ©m confia em uma conta com 200 seguidores. Injete autoridade no seu perfil hoje: seguidores, curtidas e visualizaÃ§Ãµes para Instagram e TikTok, a partir de {from}.",
    bullets: [
      "âš¡ Entrega total em inmediata",
      "ðŸ”’ Sem senha, risco zero",
      "ðŸ›¡ï¸ Garantia de reposiÃ§Ã£o incluÃ­da",
      "ðŸ’³ MercadoPago, cartÃ£o ou USDT",
    ],
    cta: "Quero crescer agora",
    ctaSub: "A partir de {from} Â· Pagamento 100% seguro",
  },
  stats: { orders: "pedidos concluÃ­dos", clients: "clientes felizes", years: "anos de experiÃªncia" },
  free: "grÃ¡tis",
  niches: {
    title: "Funciona para qualquer nicho",
    sub: "Empreendedores, marcas e criadores jÃ¡ usam para decolar.",
    items: [
      "ðŸ›ï¸ Lojas online", "ðŸ’… EstÃ©tica e beleza", "ðŸ” Gastronomia", "ðŸ‹ï¸ Fitness e academia",
      "ðŸŽµ MÃºsicos e DJs", "ðŸ“¸ Modelos e influencers", "ðŸ  ImobiliÃ¡rias", "ðŸ’¼ ServiÃ§os profissionais",
      "ðŸš— Automotivo", "âœˆï¸ Viagens e turismo", "ðŸ¶ Pets", "ðŸŽ® Streamers e gamers",
      "ðŸ‘— Moda", "ðŸ“š Cursos e coaching", "âš½ Esportes", "ðŸŽ‰ Eventos e festas",
    ],
  },
  steps: {
    title: "Comprar leva 2 minutos",
    sub: "Sem cadastro, sem senha, sem complicaÃ§Ã£o.",
    items: [
      { emoji: "ðŸ›’", title: "1. Escolha seu pacote", desc: "Seguidores, curtidas ou visualizaÃ§Ãµes. A quantidade que precisar." },
      { emoji: "ðŸ‘¤", title: "2. Informe seu usuÃ¡rio", desc: "SÃ³ seu @usuario. Nunca pedimos a senha." },
      { emoji: "ðŸš€", title: "3. Veja crescer", desc: "Pague com seguranÃ§a e vocÃª recebe em inmediata." },
    ],
  },
  packs: {
    title: "Packs de credibilidade",
    sub: "Seguidores de Instagram com garantia de reposiÃ§Ã£o. PreÃ§o final, sem surpresas.",
    popular: "ðŸ”¥ MAIS ESCOLHIDO",
    cta: "Escolher este pack",
    names: ["InÃ­cio", "Influencer", "Autoridade"],
    perks: [
      ["Entrega em inmediata", "Sem senha", "Garantia de reposiÃ§Ã£o", "Suporte em tempo real"],
      ["Entrega em inmediata", "Sem senha", "Garantia de reposiÃ§Ã£o", "Suporte em tempo real", "Seguidores de brinde"],
      ["Entrega em inmediata", "Sem senha", "Garantia de reposiÃ§Ã£o", "Suporte prioritÃ¡rio", "Seguidores de brinde"],
    ],
    moreLink: "Ver todos os pacotes (curtidas, views, TikTok e mais) â†’",
  },
  why: {
    title: "Por que funciona",
    sub: "NÃ£o Ã© mÃ¡gica, Ã© psicologia: os nÃºmeros movem o algoritmo e as pessoas.",
    items: [
      { emoji: "ðŸ§²", title: "Efeito manada", desc: "As pessoas seguem contas que muita gente jÃ¡ segue. Um perfil grande atrai seguidores orgÃ¢nicos sozinho." },
      { emoji: "ðŸ“ˆ", title: "O algoritmo te impulsiona", desc: "Mais interaÃ§Ã£o = mais alcance. Instagram e TikTok mostram seu conteÃºdo para mais pessoas." },
      { emoji: "ðŸ¤", title: "ConfianÃ§a instantÃ¢nea", desc: "Antes de comprar, te stalkeiam. Um perfil com nÃºmeros transmite seriedade e fecha vendas." },
    ],
  },
  trust: {
    title: "Sua conta estÃ¡ segura. Sempre.",
    items: [
      { emoji: "ðŸ”‘", title: "Nunca pedimos sua senha", desc: "SÃ³ precisamos do seu @usuario pÃºblico. Nada mais." },
      { emoji: "ðŸ›¡ï¸", title: "Risco zero de banimento", desc: "Trabalhamos hÃ¡ +5 anos e nenhuma conta teve problemas." },
      { emoji: "â™»ï¸", title: "Garantia de reposiÃ§Ã£o", desc: "Se algo cair durante a garantia, repomos grÃ¡tis." },
      { emoji: "ðŸ’¬", title: "Suporte humano real", desc: "Chat ou Instagram DM, respondemos em minutos. Sem robÃ´s." },
    ],
  },
  reviews: {
    title: "O que dizem os clientes",
    sub: "Mais de 1.500 pedidos concluÃ­dos.",
    items: [
      { name: "Lucas M.", city: "SÃ£o Paulo", text: "Ganhei 5 mil seguidores e a diferenÃ§a foi na hora, mais gente chamando na loja.", service: "5.000 seguidores" },
      { name: "Bea S.", city: "Rio de Janeiro", text: "Pedi curtidas e o alcance subiu muito. O suporte respondeu na hora, super simples.", service: "2.500 curtidas" },
      { name: "Diego A.", city: "Curitiba", text: "Minha conta parecia morta, agora parece profissional. Chegou rÃ¡pido e nÃ£o caiu.", service: "10.000 seguidores" },
    ],
  },
  faq: {
    title: "Perguntas frequentes",
    items: [
      { q: "VocÃªs precisam da minha senha?", a: "NÃ£o, nunca. SÃ³ seu @usuario e a conta pÃºblica durante a entrega. Jamais pediremos sua senha." },
      { q: "Minha conta pode ser banida?", a: "NÃ£o. Em mais de 5 anos e milhares de pedidos, nenhuma conta teve problemas." },
      { q: "Quanto tempo demora?", a: "A entrega Ã© concluÃ­da em inmediata (10 min - 2 hs), de forma gradual para parecer natural." },
      { q: "E se os seguidores caÃ­rem?", a: "Tem garantia de reposiÃ§Ã£o: se houver quedas dentro do perÃ­odo de garantia, repomos grÃ¡tis. Ã‰ sÃ³ chamar no chat ou Instagram DM." },
      { q: "Como pago?", a: "Com MercadoPago (cartÃ£o, dÃ©bito ou saldo) ou USDT. Pagamento 100% seguro por plataformas oficiais." },
    ],
  },
  finalCta: {
    title: "Pronto para seu perfil impor respeito?",
    sub: "Milhares jÃ¡ fizeram. Sua concorrÃªncia provavelmente tambÃ©m.",
    cta: "ComeÃ§ar agora",
  },
  feed: {
    bought: "comprou",
    ago: "hÃ¡ {n} min",
    names: ["JÃºlia", "Pedro", "Larissa", "Gabriel", "Amanda", "Rafael", "Bianca", "Thiago", "Carla", "Bruno"],
    cities: ["SÃ£o Paulo", "Rio de Janeiro", "Curitiba", "Belo Horizonte", "Porto Alegre", "Salvador", "Fortaleza"],
    services: ["1.000 seguidores", "2.500 seguidores", "5.000 seguidores", "1.000 curtidas", "10.000 views", "500 seguidores"],
  },
};

// ---- Nombres y ciudades del feed de compras, tÃ­picos de cada paÃ­s ----
const feedByLocale: Partial<Record<Locale, Pick<HomeCopy["feed"], "names" | "cities">>> = {
  mx: {
    names: ["Fernanda", "Alejandro", "Ximena", "Diego", "Guadalupe", "Carlos", "Daniela", "Luis", "MarÃ­a JosÃ©", "Jorge"],
    cities: ["CDMX", "CDMX", "Guadalajara", "Monterrey", "Puebla", "Tijuana", "LeÃ³n", "QuerÃ©taro", "MÃ©rida", "Toluca"],
  },
  co: {
    names: ["Valentina", "Juan Pablo", "Camilo", "Mariana", "AndrÃ©s", "Paula", "Felipe", "Laura", "Esteban", "Daniela"],
    cities: ["BogotÃ¡", "BogotÃ¡", "MedellÃ­n", "Cali", "Barranquilla", "Cartagena", "Bucaramanga", "Pereira", "CÃºcuta"],
  },
  cl: {
    names: ["MatÃ­as", "Catalina", "BenjamÃ­n", "Constanza", "Vicente", "Fernanda", "CristÃ³bal", "Javiera", "Felipe", "Antonia"],
    cities: ["Santiago", "Santiago", "ValparaÃ­so", "ConcepciÃ³n", "ViÃ±a del Mar", "Antofagasta", "Temuco", "La Serena", "Rancagua"],
  },
  pe: {
    names: ["JosÃ©", "Fiorella", "Luis", "Carmen", "Jorge", "MarÃ­a", "Miguel", "LucÃ­a", "Carlos", "Rosa"],
    cities: ["Lima", "Lima", "Arequipa", "Trujillo", "Chiclayo", "Piura", "Cusco", "Huancayo", "Iquitos"],
  },
  es: {
    names: ["Pablo", "LucÃ­a", "Ãlvaro", "Marta", "Javier", "Carmen", "Sergio", "Paula", "AdriÃ¡n", "Nerea"],
    cities: ["Madrid", "Madrid", "Barcelona", "Valencia", "Sevilla", "Zaragoza", "MÃ¡laga", "Bilbao", "Murcia", "Alicante"],
  },
};

export function getHomeCopy(locale: Locale): HomeCopy {
  if (locale === "ar") return ar;
  const base = localeConfig[locale].lang === "pt" ? pt : es;
  const feed = feedByLocale[locale];
  if (!feed) return base;
  return { ...base, feed: { ...base.feed, ...feed } };
}
