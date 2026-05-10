# Frontend — Catálogo de Productos Financieros

Aplicación **Next.js 16.2.6** con **React 19** y **TypeScript 5**, siguiendo **arquitectura limpia** por capas.

Consume el API Node.js en `http://localhost:3002` (backend provisto por el ejercicio, no forma parte del stack Docker bancario).

---

## Funcionalidades (SemiSenior)

| Feature | Estado | Descripción |
|---|---|---|
| F1 | Pendiente | Listado de productos financieros |
| F2 | Pendiente | Búsqueda por texto |
| F3 | Pendiente | Contador de registros |
| F4 | Pendiente | Agregar producto (formulario con validaciones) |
| F5 | Pendiente (deseable) | Editar producto |

---

## Arquitectura por capas

```
src/
├── domain/
│   └── models/            ← Product.ts — interfaz de dominio pura
│
├── application/
│   ├── usecases/          ← listProducts.ts, createProduct.ts, updateProduct.ts, deleteProduct.ts
│   └── hooks/             ← useProducts.ts, useProductForm.ts, useSearch.ts
│
├── infrastructure/
│   └── api/               ← productService.ts — fetch al API :3002
│
└── presentation/
    ├── components/        ← ProductCard, ProductList, SearchBar, RecordCount, Modal, ProductForm
    └── styles/            ← CSS Modules por componente (sin frameworks de estilos)
```

**Regla de dependencia**: `presentation` → `application` → `domain`. `infrastructure` es llamado desde `application`.

> **Nota sobre estilos**: El ejercicio exige implementación sin frameworks de estilos ni componentes prefabricados. Se usa **CSS Modules** propio para respetar la restricción. Tailwind no se utiliza aunque esté en el proyecto.

---

## Estructura de archivos

```
frontend/
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── layout.tsx
│   │   ├── page.tsx                # Home → listado + búsqueda
│   │   └── products/
│   │       ├── new/
│   │       │   └── page.tsx        # Formulario crear (F4)
│   │       └── [id]/
│   │           └── edit/
│   │               └── page.tsx    # Formulario editar (F5)
│   │
│   ├── domain/
│   │   └── models/
│   │       └── Product.ts
│   │
│   ├── application/
│   │   ├── usecases/
│   │   │   ├── listProducts.ts
│   │   │   ├── createProduct.ts
│   │   │   ├── updateProduct.ts
│   │   │   └── deleteProduct.ts
│   │   └── hooks/
│   │       ├── useProducts.ts
│   │       ├── useProductForm.ts
│   │       └── useSearch.ts
│   │
│   ├── infrastructure/
│   │   └── api/
│   │       └── productService.ts
│   │
│   └── presentation/
│       ├── components/
│       │   ├── ProductList/
│       │   │   ├── ProductList.tsx
│       │   │   └── ProductList.module.css
│       │   ├── ProductCard/
│       │   ├── SearchBar/
│       │   ├── RecordCount/
│       │   ├── ProductForm/
│       │   └── Modal/
│       └── styles/
│           └── globals.css
│
├── __tests__/                      # Tests Jest
│   ├── usecases/
│   ├── components/
│   └── hooks/
│
├── package.json
├── tsconfig.json
└── next.config.ts
```

---

## API que consume

Backend Node.js (externo al proyecto Docker), puerto **3002**.

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/bp/products` | Listar todos |
| POST | `/bp/products` | Crear producto |
| PUT | `/bp/products/:id` | Actualizar producto |
| DELETE | `/bp/products/:id` | Eliminar producto |
| GET | `/bp/products/verification/:id` | Verificar si el ID ya existe |

Ver spec completa en [`../docs/API_FRONTEND.md`](../docs/API_FRONTEND.md).

### Iniciar el backend Node.js

```bash
# En la carpeta del proyecto provisto por el ejercicio:
npm install
npm run start:dev
# Disponible en http://localhost:3002
```

---

## Modelo de producto

```typescript
interface Product {
  id: string;           // Identificador único (3-10 chars)
  name: string;         // Nombre (5-100 chars)
  description: string;  // Descripción (10-200 chars)
  logo: string;         // URL del logo
  date_release: string; // YYYY-MM-DD, ≥ hoy
  date_revision: string;// YYYY-MM-DD, exactamente 1 año después de date_release
}
```

---

## Validaciones del formulario (F4)

| Campo | Regla |
|---|---|
| `id` | Requerido, 3-10 chars, no debe existir (`/verification/:id`) |
| `name` | Requerido, 5-100 chars |
| `description` | Requerido, 10-200 chars |
| `logo` | Requerido |
| `date_release` | Requerido, fecha ≥ hoy |
| `date_revision` | Requerido, auto-calculado: exactamente 1 año después de `date_release` |

---

## Levantar el frontend

### Con Docker Compose

```bash
# Desde raíz del proyecto:
docker compose up frontend -d
# Disponible en http://localhost:3000
```

### Local sin Docker

```bash
cd frontend
npm install
npm run dev
# Disponible en http://localhost:3000
```

**Variables de entorno** (`.env.local`):

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:3002
```

---

## Tests

**Framework**: Jest + React Testing Library

```bash
npm test               # ejecuta tests
npm test -- --coverage # con reporte de cobertura
```

**Cobertura objetivo**: ≥ 70% en componentes y hooks.

| Archivo test | Qué verifica |
|---|---|
| `productService.test.ts` | Llamadas al API (fetch mockeado) |
| `SearchBar.test.tsx` | Filtrado en tiempo real |
| `ProductForm.test.tsx` | Validaciones: id vacío, fecha pasada, etc. |

---

## Verificar funcionamiento

```bash
# Build de producción (verifica que compile sin errores)
npm run build

# Lint
npm run lint

# Tests
npm test
```

---

## Troubleshooting

| Error | Solución |
|---|---|
| `Cannot find module` | `npm install` |
| API no responde (3002) | Verificar que el backend Node.js esté corriendo |
| CORS error | Verificar `NEXT_PUBLIC_API_BASE_URL` en `.env.local` |
| Puerto 3000 ocupado | `next dev -p 3001` |

---

## Documentación

- [API que consume el frontend](../docs/API_FRONTEND.md)
- [Arquitectura del sistema](../docs/ARCHITECTURE.md)
- [Plan de acción](../ACTION_PLAN.md)
