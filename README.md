# BoostAR — Tienda de seguidores (Next.js)

Web para vender seguidores de Instagram. Catálogo con calidades y cantidades,
checkout con MercadoPago y USDT, y panel de administración para gestionar las
órdenes (entrega manual).

## 🚀 Correr en local

```bash
npm install
npm run dev
```

Abrí http://localhost:3000

> Sin configurar nada, ya funciona: las órdenes se guardan **en memoria**
> (se borran al reiniciar) y el pago con MercadoPago queda en modo manual.
> Para que sea real, configurá las variables de entorno (abajo).

## 🎨 Personalizar (lo más importante)

Casi todo se cambia en **un solo archivo**: [`lib/config.ts`](lib/config.ts)

- **Marca**: `name`, `tagline`, `domain`
- **Contacto**: `whatsapp`, `email`, `horario`, `instagram`
- **Wallet USDT**: `usdt.address` y `usdt.network`
- **Precios y paquetes**: el array `catalog.tiers` (precio Global, Premium y bonus)
- **Social proof**: `stats` (órdenes, clientes, años)

**Colores**: cambialos en [`app/globals.css`](app/globals.css), en el bloque
`:root` (`--brand`, `--accent`, `--background`, etc). Todo el sitio se actualiza.

## ⚙️ Configuración (para producción)

Copiá `.env.example` a `.env.local` y completá:

| Variable | Para qué |
|---|---|
| `ADMIN_PASSWORD` | Clave para entrar a `/admin` |
| `MP_ACCESS_TOKEN` | Cobrar con MercadoPago ([panel de developers](https://www.mercadopago.com.ar/developers/panel)) |
| `SUPABASE_URL` + `SUPABASE_SERVICE_KEY` | Guardar las órdenes de forma persistente |
| `PUBLIC_BASE_URL` | Tu dominio (para los links de retorno de MercadoPago) |

### Base de datos (Supabase, gratis)

1. Creá un proyecto en https://supabase.com
2. En **SQL Editor**, pegá y ejecutá [`supabase/schema.sql`](supabase/schema.sql)
3. Copiá `URL` y `service_role key` desde **Project Settings → API** al `.env.local`

### MercadoPago

1. Entrá a https://www.mercadopago.com.ar/developers/panel
2. Creá una aplicación y copiá el **Access Token** (TEST para probar, PRODUCCIÓN para cobrar)
3. Pegalo en `MP_ACCESS_TOKEN`

El webhook (`/api/mercadopago/webhook`) marca la orden como **pagada**
automáticamente cuando el pago se aprueba.

## 🛠️ Gestionar pedidos

Entrá a **`/admin`** con tu `ADMIN_PASSWORD`. Ahí ves cada orden con el
`@usuario`, el paquete y el contacto. Flujo de entrega manual:

1. Llega la orden → estado **Pagado**
2. La cargás en tu proveedor
3. La marcás **Entregando** → **Entregado**

> Cuando quieras automatizar la entrega, está marcado el lugar exacto en
> [`app/api/mercadopago/webhook/route.ts`](app/api/mercadopago/webhook/route.ts)
> para disparar la API de tu proveedor.

## ☁️ Deploy (Vercel, gratis)

1. Subí el repo a GitHub
2. Importalo en https://vercel.com
3. Cargá las mismas variables de entorno en **Settings → Environment Variables**
4. Deploy. Conectá tu dominio y listo.

## 📁 Estructura

```
app/
  page.tsx                  Home
  servicios/instagram/      Catálogo + formulario de compra
  como-funciona/  faq/      Páginas informativas
  gracias/                  Confirmación / instrucciones USDT
  admin/                    Panel privado de órdenes
  api/
    orders/                 Crea la orden + inicia pago
    mercadopago/webhook/    Confirma el pago
    admin/                  Login + gestión de órdenes
lib/
  config.ts                 ⭐ Marca, precios, contacto
  db.ts                     Órdenes (Supabase o memoria)
  mercadopago.ts            Pagos
  auth.ts                   Login admin
components/                 Header, Footer, WhatsApp
supabase/schema.sql         Tabla de órdenes
```
