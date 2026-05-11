# Frontend — Catálogo de Productos Financieros

Aplicación **Next.js 16.2.6** con **React 19** y **TypeScript 5** siguiendo **arquitectura limpia por capas**.

**Puerto**: 3000  
Consume el Mock API de productos en `http://localhost:3002` (incluido en Docker Compose como servicio `mock-api`).

---

## Funcionalidades implementadas

| Feature | Ruta | Descripción |
|---|---|---|
| F1 — Listado | `/` | Lista completa de productos financieros con estado de carga y error |
| F2 — Búsqueda | `/` | Filtro en tiempo real por nombre o descripción (sin llamar al API) |
| F3 — Contador | `/` | Contador de registros actualizado con el filtro activo |
| F4 — Crear | `/products/new` | Formulario con validaciones por campo, verificación de ID único y fecha de revisión auto-calculada |
| F5 — Editar | `/products/[id]/edit` | Formulario pre-cargado con datos actuales, campo ID deshabilitado |

---

## Arquitectura por capas

```
src/
├── domain/
│   └── models/Product.ts          ← interfaz Product + tipos CreateProductPayload, UpdateProductPayload
│
├── application/
│   ├── usecases/
│   │   ├── createProduct.ts       ← llama productService.create()
│   │   └── updateProduct.ts       ← llama productService.update()
│   └── hooks/
│       ├── useProducts.ts         ← fetch inicial + estado loading/error + refresh()
│       ├── useProductForm.ts      ← estado del formulario, validaciones, ID async, date_revision
│       └── useSearch.ts           ← filtro en memoria por nombre y descripción
│
├── infrastructure/
│   └── api/productService.ts      ← getAll, getById, create, update, remove, verifyId
│
└── presentation/
    └── components/
        ├── ProductList/           ← tabla con estados: loading, error, vacío, con datos
        ├── ProductCard/           ← fila de tabla + botón Editar
        ├── ProductForm/           ← formulario reutilizable (crear y editar)
        ├── SearchBar/             ← input de búsqueda accesible
        └── RecordCount/           ← contador de resultados con aria-live
```

**Regla de dependencia**: `presentation` → `application` → `domain`. `infrastructure` se llama solo desde `application`.

> Los estilos usan **CSS Modules** por componente (sin Tailwind, sin frameworks de estilos), conforme exige el ejercicio.

---

## Estructura de archivos

```
frontend/
├── src/
│   ├── app/                            # Next.js App Router
│   │   ├── layout.tsx
│   │   ├── page.tsx                    # Home: listado + búsqueda (F1, F2, F3)
│   │   └── products/
│   │       ├── new/page.tsx            # Crear producto (F4)
│   │       └── [id]/edit/page.tsx      # Editar producto (F5)
│   ├── domain/models/Product.ts
│   ├── application/
│   │   ├── usecases/{create,update}Product.ts
│   │   └── hooks/{useProducts,useProductForm,useSearch}.ts
│   ├── infrastructure/api/productService.ts
│   └── presentation/components/{ProductList,ProductCard,ProductForm,SearchBar,RecordCount}/
│
├── __tests__/
│   ├── infrastructure/api/productService.test.ts
│   ├── application/hooks/{useProducts,useProductForm,useSearch}.test.ts
│   └── presentation/components/{SearchBar,ProductForm,ProductList}.test.tsx
│
├── __mocks__/
│   ├── styleMock.ts                    # CSS modules mock para Jest
│   └── next-link.tsx                   # next/link mock para Jest (JSDOM)
│
├── babel.config.js                     # next/babel con runtime: automatic (sin warning React 19)
├── jest.config.js
├── jest.setup.ts
├── next.config.ts
├── tsconfig.json
└── package.json
```

---

## Validaciones del formulario (F4 y F5)

| Campo | Reglas |
|---|---|
| `id` | Requerido · 3–10 chars · no debe existir (verificado vía `GET /bp/products/verification/:id` al perder foco) |
| `name` | Requerido · 5–100 chars |
| `description` | Requerido · 10–200 chars |
| `logo` | Requerido |
| `date_release` | Requerido · fecha ≥ hoy |
| `date_revision` | Auto-calculado: exactamente 1 año después de `date_release` · campo `readOnly` |

En modo edición (F5) el campo `id` está deshabilitado y no se verifica unicidad.

---

## API que consume

Mock API Node.js incluido en Docker Compose (`mock-api`, puerto **3002**).

| Método | Endpoint | Descripción |
|---|---|---|
| `GET` | `/bp/products` | Listar todos los productos |
| `GET` | `/bp/products/:id` | Obtener producto por ID |
| `POST` | `/bp/products` | Crear producto |
| `PUT` | `/bp/products/:id` | Actualizar producto |
| `DELETE` | `/bp/products/:id` | Eliminar producto |
| `GET` | `/bp/products/verification/:id` | Verificar si el ID ya existe |

Spec completa en [`../docs/API_FRONTEND.md`](../docs/API_FRONTEND.md).

---

## Tests

**Framework**: Jest 29 + React Testing Library 16

```bash
npm test                    # ejecuta los 74 tests
npm run test:coverage       # con reporte de cobertura (umbral ≥ 70%)
```

**Cobertura actual: 94% statements · 92% branches**

| Archivo de test | Qué verifica |
|---|---|
| `productService.test.ts` | Todos los métodos del servicio (mock de axios.create) |
| `useProducts.test.ts` | Estado inicial, fetch exitoso, error, refresh |
| `useProductForm.test.ts` | handleChange, handleIdBlur, handleSubmit, handleReset, validaciones |
| `useSearch.test.ts` | Filtrado por nombre, descripción, case-insensitive, término vacío |
| `SearchBar.test.tsx` | Render, placeholder, onChange, aria-label |
| `ProductForm.test.tsx` | 6 campos, errores, disableId, submitLabel, isSubmitting |
| `ProductList.test.tsx` | Estados: loading, error, vacío, con datos · ProductCard · RecordCount |

---

## Levantar

### Con Docker Compose (recomendado)

```bash
# Desde la raíz del proyecto:
docker compose up frontend mock-api -d
# Frontend disponible en http://localhost:3000
```

### Local sin Docker

```bash
# Primero levantar el mock-api (o arrancarlo vía Docker):
docker compose up mock-api -d

cd frontend
npm install
npm run dev         # http://localhost:3000
```

**Variable de entorno** (`.env.local`):

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:3002
```

### Build de producción

```bash
npm run build       # verifica compilación TypeScript + Next.js build
npm start           # sirve el build de producción
```

---

## TypeScript

El proyecto usa TypeScript estricto (`"strict": true`). Para verificar tipos sin emitir:

```bash
npx tsc --noEmit
```
