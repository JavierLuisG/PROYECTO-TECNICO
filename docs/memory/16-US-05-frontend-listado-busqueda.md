# US-05 — Listado, Búsqueda y Contador de Productos (Frontend)

**Fecha implementación**: 2026-05-11

---

## Archivos creados (12 archivos)

### Application Layer — Hooks

| Archivo | Descripción |
|---|---|
| `application/hooks/useProducts.ts` | Fetch de productos: estado `loading`, `error`, `products`; función `refresh()` |
| `application/hooks/useSearch.ts` | Filtrado client-side por nombre o descripción; `useMemo` para eficiencia |

### Presentation Layer — Componentes (CSS Modules, sin Tailwind)

| Componente | Archivos | Descripción |
|---|---|---|
| `SearchBar` | `SearchBar.tsx` + `SearchBar.module.css` | Input controlado; pasa `onChange` al hook |
| `RecordCount` | `RecordCount.tsx` + `RecordCount.module.css` | Muestra `N resultado(s)`; `aria-live="polite"` |
| `ProductCard` | `ProductCard.tsx` + `ProductCard.module.css` | Fila `<tr>` con logo, nombre, descripción, fechas |
| `ProductList` | `ProductList.tsx` + `ProductList.module.css` | Tabla con thead + tbody de `ProductCard`; estados: loading (spinner), error, vacío |

### App Layer

| Archivo | Descripción |
|---|---|
| `src/app/page.tsx` | Client Component; compone `useProducts` + `useSearch` + todos los componentes |
| `src/app/page.module.css` | Layout de la página: header amarillo (#ffdd00), contenido centrado |
| `src/app/layout.tsx` | Simplificado: sin Google Fonts, sin Tailwind classes en body |

---

## Flujo de datos

```
page.tsx
  ├── useProducts() → productService.getAll() → API Node.js :3002
  │     └── { products, loading, error }
  └── useSearch(products) → filtrado en memoria con useMemo
        └── { searchTerm, setSearchTerm, filteredProducts }

  ↓ Renderiza:
  SearchBar (onChange=setSearchTerm)
  RecordCount (count=filteredProducts.length)
  ProductList (products=filteredProducts, loading, error)
    └── ProductCard × N
```

---

## Criterios de aceptación cubiertos

| Criterio | Implementación |
|---|---|
| Lista completa al cargar | `useProducts` fetch en `useEffect` con loading=true inicial |
| Estado de carga visible | `ProductList` renderiza spinner mientras `loading=true` |
| Mensaje de error visible | `ProductList` renderiza bloque de error si `error != null` |
| Búsqueda filtra en tiempo real | `useSearch` usa `useMemo`; no hace llamadas adicionales al API |
| Búsqueda insensible a mayúsculas | `.toLowerCase()` en nombre Y descripción |
| Contador actualiza con filtro | `RecordCount` recibe `filteredProducts.length` |
| Sin coincidencias → mensaje informativo | `ProductList` renderiza mensaje si `products.length === 0` |
| CSS propio (sin Tailwind en componentes) | Todos los componentes usan `.module.css`; sin `className="flex..."` |

---

## Diseño visual

- Header: fondo `#ffdd00` (amarillo bancario), título en negro
- Tabla: thead con fondo `#ffdd00`, filas con hover `#fffbea`
- Spinner: border circular animado con acento amarillo
- Error: fondo `#fef2f2`, texto rojo
- SearchBar: input alineado a la derecha, focus con borde amarillo

---

## Mock API — Servicio incluido en docker-compose

El backend de productos financieros (`localhost:3002`) fue agregado al `docker-compose.yml` como servicio `mock-api` para que `docker compose up` levante todo el stack sin dependencias externas.

| Archivo | Descripción |
|---|---|
| `backend/mock-api/index.js` | Express + CORS; implementa los 5 endpoints del ejercicio con 5 productos de ejemplo |
| `backend/mock-api/package.json` | Dependencias: `express`, `cors` |
| `backend/mock-api/Dockerfile` | Imagen `node:20-alpine`, puerto 3002 |
| `docker-compose.yml` | Servicio `mock-api` en puerto 3002; `frontend` depende de él |

Las llamadas al API se realizan desde el **navegador del usuario** (`window.fetch` / axios client-side), por lo que `localhost:3002` resuelve al puerto 3002 del host, mapeado al contenedor `banco-mock-api`.

## Verificación

```
npx tsc --noEmit                   → 0 errores ✓
docker compose up --build          → todos los servicios healthy ✓
curl http://localhost:3002/bp/products → 5 productos ✓
curl http://localhost:3000         → HTTP 200, título "Banco - Productos Financieros" ✓
```

---

## Pendiente (ramas siguientes)

| Tarea | Descripción |
|---|---|
| US-06 | Formulario de creación de producto con validaciones y verificación de ID |
| US-07 | Formulario de edición con pre-carga de valores |
| TASK-19 | Tests unitarios (Jest + React Testing Library, cobertura ≥ 70%) |
