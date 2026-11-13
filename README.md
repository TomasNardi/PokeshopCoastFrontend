# PokeShop Coast — Frontend

Next.js 15 (App Router) · Tailwind 3 · Zustand · Vitest + MSW. Se despliega en Vercel.
El backend es el mismo que el de Crack (Django + DRF), así que el front habla **el mismo contrato**.

```bash
cp .env.example .env.local   # NEXT_PUBLIC_USE_MOCKS=true para trabajar sin backend
npm install
npm run dev
npm test                     # unit + componentes + contrato (MSW)
INTEGRATION_API_URL=http://localhost:8000/api/v1 npm run test:integration
```

## Arquitectura

```
src/
  app/            Rutas (Server Components por defecto). Solo componen: no tienen lógica.
  components/     UI por feature: product/, cart/, checkout/, auth/, home/, layout/, ui/
  domain/         Reglas puras (sin React ni red): product, cart, conditions, passwordRules, catalog
  services/       Casos de uso + acceso a datos
    http/         httpClient + ApiError (mensajes en castellano)
    catalog/      repositorio .http / .mock  →  catalogService
    orders/       repositorio .http / .mock  →  orderService (validación + payload POST /orders/)
    shipping/     métodos de envío (Strategy)
    payments/     Mercado Pago / transferencia (Strategy)
    auth/         authService (Facade) + passwordRecoveryService + providers (Adapter)
    customer/     /customers/* con X-Customer-Token
    engagement/   contacto + newsletter
    container.js  Composition root: decide mocks vs HTTP y arma dependencias
  store/          Zustand (carrito). Solo orquesta reglas de domain/cart.js
  hooks/          useBackForwardRefresh (fix Vercel), useHydrated
  mocks/data/     Productos con el shape EXACTO del serializer de Django
tests/
  unit/           dominio y servicios
  components/     ProductCard, fix de back/forward, recuperación de contraseña
  contract/       repositorios HTTP contra un Django emulado con MSW
  integration/    los mismos escenarios contra el backend real (solo lectura)
```

### Patrones

| Patrón | Dónde | Para qué |
|---|---|---|
| Repository | `services/*/…Repository.{http,mock}.js` | Misma interfaz para mocks y Django: conectar el backend = cambiar una env var |
| Abstract Factory / Composition root | `services/container.js` | Un solo lugar decide implementaciones |
| Strategy | `shipping/shippingMethods.js`, `payments/paymentMethods.js` | Sumar un envío o medio de pago sin tocar el checkout |
| Adapter | `auth/providers/supabaseAuthProvider.js` | Supabase detrás de una interfaz propia |
| Facade | `auth/authService.js` | La UI no sabe que existe Supabase |
| Null Object | `auth/providers/disabledAuthProvider.js` | Sin auth configurado el sitio vende igual |
| View-model | `domain/product.js → productView()` | Card, detalle y carrito usan las mismas reglas |

## Integraciones

- **Login (Google SSO + email)**: Supabase Auth, igual que Crack/Delta. Supabase → Providers → Google.
  Redirect URLs: `<SITE_URL>/cuenta`, `<SITE_URL>/cuenta/restablecer`.
- **Recuperación de contraseña**: `/cuenta/recuperar` → mail → `/cuenta/restablecer`.
  Responde siempre lo mismo (no permite enumerar cuentas). Reglas en `domain/passwordRules.js`
  (tienen que coincidir con Password Requirements de Supabase).
- **Emails (Resend)**: los de auth salen de Supabase con SMTP de Resend; los transaccionales
  (pedido, contacto) los manda el backend. La API key **nunca** va en el front.
- **Mercado Pago**: el backend crea la preferencia (`POST /orders/` → `checkout.init_point`).
  back_urls: `/checkout/confirmacion`, `/checkout/pendiente`, `/checkout/error`; la confirmación
  verifica el pago con `POST /payments/verify/`.
- **Envíos**: retiro, sucursal normal/express, domicilio. Precios por zona desde `GET /payments/config/`.
- **Imágenes**: mismo servicio de carga que Crack/Delta (Cloudinary/R2). El escenario del producto
  es **blanco** a propósito, para que las cartas con borde no se pisen con el fondo.

## Fix de "volver atrás" en Vercel

`hooks/useBackForwardRefresh.js`, montado una vez en el layout (`<BackForwardRefresh />`).
Si la carga fue `back_forward` o la página vuelve del bfcache (`pageshow.persisted`), hace
`router.refresh()`. Es el mismo fix de Crack (commit `afbf4b0`), pero global en vez de por página.
Además las páginas con stock son `force-dynamic` y los fetch de producto `no-store`.

## Paleta

Tokens en `tailwind.config.js` (`coast.*`): crema `#F7F1E6`, arena `#E8D8BC`, blanco, gris `#2F2D2C`/`#6F6963`,
rojo claro `#E2574C`. El logo no se usa; solo sus colores.
