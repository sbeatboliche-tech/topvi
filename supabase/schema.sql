-- ============================================================
--  Esquema de la base de datos (Supabase / Postgres)
--  Pegá esto en Supabase > SQL Editor > New query > Run.
-- ============================================================

create table if not exists orders (
  id              text primary key,
  created_at      timestamptz not null default now(),
  locale          text not null default 'ar',
  service         text not null default '',
  username        text not null,
  contact         text not null,
  quantity        integer not null,
  bonus           integer not null default 0,
  quality         text not null,
  total_followers integer not null,
  amount          numeric not null,
  payment         text not null,         -- 'mercadopago' | 'tarjeta' | 'usdt'
  status          text not null default 'pending_payment',
  notes           text                    -- desglose de packs + links de posteos
);

-- Si ya tenías la tabla creada de antes, corré también:
--   alter table orders add column if not exists notes text;

create index if not exists orders_status_idx on orders (status);
create index if not exists orders_created_idx on orders (created_at desc);

-- RLS activado: solo el backend (service_role key) puede leer/escribir.
alter table orders enable row level security;
-- No creamos políticas públicas a propósito: el sitio accede con la
-- service_role key desde el servidor, que bypassea RLS.

-- ---- Prueba gratuita: tracking por IP / device token ----
create table if not exists free_trials (
  id          bigint generated always as identity primary key,
  lookup_key  text not null,   -- "ip:x.x.x.x" o "device:uuid"
  created_at  timestamptz not null default now()
);

create index if not exists free_trials_key_idx on free_trials (lookup_key);

alter table free_trials enable row level security;

-- ---- Leads / suscriptores (captura de email para remarketing) ----
-- Se guarda el email apenas lo escriben en el checkout, aunque no compren.
-- status: 'lead' (no compró) | 'customer' (pago confirmado).
create table if not exists leads (
  email            text primary key,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  locale           text,
  service          text,          -- último servicio de interés
  source           text,          -- 'checkout' | 'pack' | 'trial'
  status           text not null default 'lead',
  ordered_at       timestamptz,   -- creó una orden (haya pagado o no)
  purchased_at     timestamptz,   -- pago confirmado
  discount_code    text,          -- código de descuento asignado
  discount_sent_at timestamptz    -- cuándo se le mandó el mail de descuento
);

create index if not exists leads_status_idx on leads (status);
create index if not exists leads_created_idx on leads (created_at desc);

alter table leads enable row level security;
