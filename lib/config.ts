// ============================================================
//  CONFIGURACIÓN CENTRAL DEL SITIO
//  Cambiá acá todo: marca, contacto, colores, servicios y precios.
// ============================================================

export const site = {
  // ---- Marca ----
  name: "TopViralMarketing",
  tagline: "Hacé crecer tus redes en serio",
  description:
    "Comprá seguidores, likes y vistas para Instagram y TikTok. Entrega rápida, sin contraseña y con garantía. Pagá con MercadoPago o USDT.",
  domain: "topviralmarketing.com.ar",

  // ---- Contacto ----
  whatsapp: "5492215793593", // sin + ni espacios
  email: "contacto@topviralmarketing.com.ar",
  horario: "Lunes a Viernes de 10 a 22 hs",

  // ---- Redes ----
  instagram: "https://www.instagram.com/topviralmarketing",

  // ---- Pagos ----
  usdt: {
    network: "TRC20",
    address: "TPUthV8pJ4YwMmpsSNwfULXfAQdt5zjPW3",
  },

  // ---- Social proof ----
  stats: {
    ordenes: "1.523",
    clientes: "705",
    anios: "5",
  },
} as const;

// ============================================================
//  CATÁLOGO  (plataforma → servicio → paquetes)
// ============================================================

export type Platform = "instagram" | "tiktok";
export type ServiceKind = "followers" | "likes" | "views" | "shares" | "saves";
export type Quality = "global" | "premium";

export interface Tier {
  quantity: number;
  price: number; // precio base / Global (ARS)
  pricePremium?: number; // solo si el servicio tiene calidad Premium
  bonus?: number; // seguidores/likes de regalo en Premium
}

export interface ServiceDef {
  slug: string; // ej "instagram-seguidores"
  platform: Platform;
  kind: ServiceKind;
  title: string; // "Seguidores de Instagram"
  short: string; // "Seguidores"
  emoji: string;
  unit: string; // "seguidores" | "me gusta" | "vistas"
  hasQuality: boolean; // true = ofrece Global y Premium
  tiers: Tier[];
}

// --- Helpers para no repetir tiers ---
const likeTiers: Tier[] = [
  { quantity: 100,   price: 700 },
  { quantity: 500,   price: 2200 },
  { quantity: 1000,  price: 3800 },
  { quantity: 5000,  price: 14900, bonus: 500 },
  { quantity: 10000, price: 29900, bonus: 1000 },
  { quantity: 25000, price: 54900, bonus: 2500 },
  { quantity: 50000, price: 99700, bonus: 5000 },
];

// Vistas / reproducciones (misma tabla para Instagram y TikTok).
const viewTiers: Tier[] = [
  { quantity: 500,     price: 190 },
  { quantity: 1000,    price: 350 },
  { quantity: 2000,    price: 620 },
  { quantity: 5000,    price: 990 },
  { quantity: 10000,   price: 1700 },
  { quantity: 25000,   price: 3400 },
  { quantity: 50000,   price: 5900 },
  { quantity: 75000,   price: 6700 },
  { quantity: 100000,  price: 9900,  bonus: 10000 },
  { quantity: 300000,  price: 24900, bonus: 30000 },
  { quantity: 500000,  price: 34900, bonus: 50000 },
  { quantity: 1000000, price: 59900, bonus: 100000 },
];

const shareTiers: Tier[] = [
  { quantity: 50, price: 450 },
  { quantity: 100, price: 790 },
  { quantity: 250, price: 1750 },
  { quantity: 500, price: 3200 },
  { quantity: 1000, price: 5900,  bonus: 100 },
  { quantity: 2500, price: 12900, bonus: 250 },
  { quantity: 5000, price: 23900, bonus: 500 },
  { quantity: 10000, price: 42900, bonus: 1000 },
];

const saveTiers: Tier[] = [
  { quantity: 50, price: 320 },
  { quantity: 100, price: 560 },
  { quantity: 250, price: 1200 },
  { quantity: 500, price: 2100 },
  { quantity: 1000, price: 3700,  bonus: 100 },
  { quantity: 2500, price: 8200,  bonus: 250 },
  { quantity: 5000, price: 14900, bonus: 500 },
  { quantity: 10000, price: 27900, bonus: 1000 },
];

// Precios = 10% por debajo de la competencia (referencia EasyMarketing).
const igFollowerTiers: Tier[] = [
  { quantity: 100, price: 1575, pricePremium: 5310 },
  { quantity: 250, price: 3510, pricePremium: 7560 },
  { quantity: 500, price: 5310, pricePremium: 10620 },
  { quantity: 1000, price: 9990, pricePremium: 19980 },
  { quantity: 2500, price: 23850, pricePremium: 47700 },
  { quantity: 5000, price: 44100, pricePremium: 88200 },
  { quantity: 10000, price: 80100, pricePremium: 160200, bonus: 1000 },
  { quantity: 20000, price: 152100, pricePremium: 304200, bonus: 2000 },
  { quantity: 50000, price: 351000, pricePremium: 702000, bonus: 5000 },
  { quantity: 100000, price: 675000, pricePremium: 1350000, bonus: 10000 },
];

const ttFollowerTiers: Tier[] = [
  { quantity: 100, price: 1500, pricePremium: 2200 },
  { quantity: 250, price: 2900, pricePremium: 4200 },
  { quantity: 500, price: 4900, pricePremium: 7200 },
  { quantity: 1000, price: 8900, pricePremium: 12500 },
  { quantity: 2500, price: 19900, pricePremium: 27900, bonus: 250 },
  { quantity: 5000, price: 35900, pricePremium: 49900, bonus: 500 },
  { quantity: 10000, price: 67900, pricePremium: 89900, bonus: 1000 },
  { quantity: 20000, price: 124900, pricePremium: 169900, bonus: 2000 },
];

export const services: ServiceDef[] = [
  {
    slug: "instagram-seguidores",
    platform: "instagram",
    kind: "followers",
    title: "Seguidores de Instagram",
    short: "Seguidores",
    emoji: "👥",
    unit: "seguidores",
    hasQuality: false,
    tiers: igFollowerTiers,
  },
  {
    slug: "instagram-likes",
    platform: "instagram",
    kind: "likes",
    title: "Likes de Instagram",
    short: "Likes",
    emoji: "❤️",
    unit: "me gusta",
    hasQuality: false,
    tiers: likeTiers,
  },
  {
    slug: "instagram-vistas",
    platform: "instagram",
    kind: "views",
    title: "Vistas de Instagram",
    short: "Vistas",
    emoji: "▶️",
    unit: "vistas",
    hasQuality: false,
    tiers: viewTiers,
  },
  {
    slug: "tiktok-seguidores",
    platform: "tiktok",
    kind: "followers",
    title: "Seguidores de TikTok",
    short: "Seguidores",
    emoji: "👥",
    unit: "seguidores",
    hasQuality: false,
    tiers: ttFollowerTiers,
  },
  {
    slug: "tiktok-likes",
    platform: "tiktok",
    kind: "likes",
    title: "Likes de TikTok",
    short: "Likes",
    emoji: "❤️",
    unit: "me gusta",
    hasQuality: false,
    tiers: likeTiers,
  },
  {
    slug: "tiktok-vistas",
    platform: "tiktok",
    kind: "views",
    title: "Vistas de TikTok",
    short: "Reproducciones",
    emoji: "▶️",
    unit: "reproducciones",
    hasQuality: false,
    tiers: viewTiers,
  },
  {
    slug: "instagram-compartidos",
    platform: "instagram",
    kind: "shares",
    title: "Compartidos de Instagram",
    short: "Compartidos",
    emoji: "🔁",
    unit: "compartidos",
    hasQuality: false,
    tiers: shareTiers,
  },
  {
    slug: "instagram-guardados",
    platform: "instagram",
    kind: "saves",
    title: "Guardados de Instagram",
    short: "Guardados",
    emoji: "🔖",
    unit: "guardados",
    hasQuality: false,
    tiers: saveTiers,
  },
];

// ============================================================
//  PACKS (combos: seguidores + likes + vistas en una compra)
//  Los likes y vistas se reparten entre los posteos que cargue
//  el cliente (hasta MAX_PACK_POSTS).
// ============================================================

export const MAX_PACK_POSTS = 10;

export interface PackDef {
  slug: string; // "pack-pro"
  name: string;
  emoji: string;
  badge?: string;
  followers: number;
  likes: number;
  views: number;
  price: number; // precio final (ARS)
  originalPrice: number; // precio tachado (ARS)
}

export const packs: PackDef[] = [
  {
    slug: "pack-starter",
    name: "Pack Starter",
    emoji: "🚀",
    followers: 5000,
    likes: 10000,
    views: 30000,
    price: 58000,
    originalPrice: 84000,
  },
  {
    slug: "pack-pro",
    name: "Pack Pro",
    emoji: "🔥",
    badge: "MÁS POPULAR",
    followers: 10000,
    likes: 25000,
    views: 60000,
    price: 99999,
    originalPrice: 164000,
  },
  {
    slug: "pack-elite",
    name: "Pack Elite",
    emoji: "👑",
    followers: 20000,
    likes: 50000,
    views: 100000,
    price: 149999,
    originalPrice: 274000,
  },
];

export function getPack(slug: string): PackDef | undefined {
  return packs.find((p) => p.slug === slug);
}

export const platformInfo: Record<
  Platform,
  { label: string; emoji: string }
> = {
  instagram: { label: "Instagram", emoji: "📸" },
  tiktok: { label: "TikTok", emoji: "🎵" },
};

export const qualityInfo: Record<
  Quality,
  { label: string; desc: string; garantia: string }
> = {
  global: {
    label: "Global",
    desc: "Calidad estándar de servidores globales. Ideal para subir el número rápido y económico.",
    garantia: "30 días",
  },
  premium: {
    label: "Premium",
    desc: "Cuentas de altísima calidad con foto y publicaciones reales. Caída casi nula. Incluye regalo.",
    garantia: "60 días",
  },
};

// ---- Helpers ----
export function getService(slug: string): ServiceDef | undefined {
  return services.find((s) => s.slug === slug);
}

// ---- Upsell / add-on cruzado ----
// Qué servicio sugerir como complemento al comprar otro.
const ADDON_MAP: Record<string, string> = {
  "instagram-seguidores": "instagram-likes",
  "tiktok-seguidores": "tiktok-likes",
  "instagram-likes": "instagram-seguidores",
  "tiktok-likes": "tiktok-seguidores",
};

export function getAddonFor(slug: string): ServiceDef | undefined {
  const target = ADDON_MAP[slug];
  return target ? getService(target) : undefined;
}

// Índice del tier cuya cantidad es la más cercana a `qty` (para sugerir).
export function closestTierIdx(svc: ServiceDef, qty: number): number {
  let best = 0;
  let bestDiff = Infinity;
  svc.tiers.forEach((t, i) => {
    const d = Math.abs(t.quantity - qty);
    if (d < bestDiff) {
      bestDiff = d;
      best = i;
    }
  });
  return best;
}

// Cantidad máxima de cuentas/posteos entre los que repartir una compra.
export const MAX_TARGETS = 10;

export function priceFor(tier: Tier, quality: Quality): number {
  if (quality === "premium" && tier.pricePremium != null)
    return tier.pricePremium;
  return tier.price;
}

// Regalo (seguidores extra) idéntico a la competencia: aplica en ambas
// calidades (Global y Premium), igual que EasyMarketing.
export function bonusFor(_tier: Tier, _quality: Quality): number {
  return _tier.bonus ?? 0;
}

export function formatARS(n: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(n);
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat("es-AR").format(n);
}
