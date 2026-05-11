# TASK-18 — Setup Estructura y Servicio API Frontend (Next.js)

**Fecha implementación**: 2026-05-11  
**Rama**: `feat/US-05-listado-productos` — Bloque 1  
**Tarea**: TASK-18

---

## Archivos creados (3 archivos + directorios)

| Archivo | Descripción |
|---|---|
| `src/domain/models/Product.ts` | Interfaces `Product`, `CreateProductPayload`, `UpdateProductPayload` — TypeScript estricto, sin `any` |
| `src/infrastructure/api/productService.ts` | 5 métodos del API: `getAll`, `create`, `update`, `remove`, `verifyId` con tipos explícitos |
| `.env.local` | `NEXT_PUBLIC_API_BASE_URL=http://localhost:3002` para desarrollo local |

## Archivos modificados

| Archivo | Cambio |
|---|---|
| `Dockerfile` | `ARG NEXT_PUBLIC_API_BASE_URL=http://localhost:3002` + `ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL` antes del build — vars `NEXT_PUBLIC_` deben estar disponibles en tiempo de compilación |

## Estructura de directorios creada

```
src/
├── app/                    ← Next.js App Router (existente)
├── domain/
│   └── models/
│       └── Product.ts      ← Modelo de dominio
├── application/
│   ├── usecases/           ← Vacío — se implementa en US-05/US-06
│   └── hooks/              ← Vacío — se implementa en US-05/US-06
├── infrastructure/
│   └── api/
│       └── productService.ts  ← Capa de acceso a API
└── presentation/
    └── components/         ← Vacío — se implementa en US-05
```

---

## Modelo `Product.ts`

```typescript
export interface Product {
  id: string;           // 3-10 chars, único
  name: string;         // 5-100 chars
  description: string;  // 10-200 chars
  logo: string;         // URL
  date_release: string; // YYYY-MM-DD, ≥ hoy
  date_revision: string; // exactamente 1 año después de date_release
}
export type CreateProductPayload = Product;
export type UpdateProductPayload = Omit<Product, 'id'>; // id va en la URL, no en el body
```

## Servicio `productService.ts`

| Método | HTTP | Ruta | Descripción |
|---|---|---|---|
| `getAll()` | GET | `/bp/products` | Lista todos los productos |
| `create(payload)` | POST | `/bp/products` | Crea un producto |
| `update(id, payload)` | PUT | `/bp/products/:id` | Actualiza (sin id en body) |
| `remove(id)` | DELETE | `/bp/products/:id` | Elimina |
| `verifyId(id)` | GET | `/bp/products/verification/:id` | Retorna `true` si existe |

Usa `axios.create({ baseURL: NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3002' })` con tipos explícitos en todos los métodos.

---

## Decisiones de diseño

### `NEXT_PUBLIC_` vars en Docker → ARG en Dockerfile

En Next.js 13+ App Router, las variables `NEXT_PUBLIC_*` se incrustan (inline) en el bundle de cliente durante el BUILD. Por tanto, deben estar disponibles al ejecutar `npm run build`, no solo en runtime. Se usa `ARG NEXT_PUBLIC_API_BASE_URL=http://localhost:3002` en el Dockerfile para que el valor sea inyectable por `docker compose build --build-arg` si se necesita cambiar el host.

### `AxiosInstance` tipado + interfaces de respuesta

La API Node.js envuelve las respuestas en `{ data: T }`. Se definen interfaces `ProductsResponse` y `ProductResponse` para evitar `any` y garantizar tipado estricto.

### `UpdateProductPayload = Omit<Product, 'id'>`

En el endpoint PUT, el `id` va en la URL (`/bp/products/:id`), NO en el body. Usar `Omit<Product, 'id'>` impide que el llamador envíe el id en el payload accidentalmente.

---

## Verificación

```bash
npx tsc --noEmit    → 0 errores TypeScript ✓
docker compose build frontend → Built ✓
```

---

## Pendiente (Bloque 2 — misma rama)

| Tarea | Descripción |
|---|---|
| US-05 | Componentes `ProductList`, `ProductCard`, `SearchBar`, `RecordCount` |
| US-05 | Hooks `useProducts`, `useSearch` |
| US-05 | Página principal `src/app/page.tsx` con listado + búsqueda + contador |
