# US-07 — Formulario de Edición de Producto (Frontend)

**Fecha implementación**: 2026-05-11  
**Rama**: `feat/US-07-editar-producto` — Bloque 1  
**Tarea**: US-07 (F5 deseable)

---

## Archivos creados (3 archivos)

| Archivo | Tipo | Descripción |
|---|---|---|
| `application/usecases/updateProduct.ts` | Use case | Llama `productService.update(id, payload)` y retorna `Product` |
| `src/app/products/[id]/edit/page.tsx` | Página Next.js | Client Component; carga producto por ID, muestra error si no existe, compone hook + componente con `disableId=true`; redirige al listado tras éxito |
| `src/app/products/[id]/edit/page.module.css` | CSS | Layout idéntico al de `products/new` |

## Archivos modificados (6 archivos)

| Archivo | Cambio |
|---|---|
| `backend/mock-api/index.js` | Nuevo endpoint `GET /bp/products/:id` — devuelve `{ data: product }` o 404 |
| `infrastructure/api/productService.ts` | Nuevo método `getById(id)` que llama `GET /bp/products/:id` |
| `presentation/components/ProductForm/ProductForm.tsx` | Prop `submitLabel?: string` (default `'Agregar'`); el botón muestra `submitLabel` en lugar de texto hardcoded |
| `presentation/components/ProductCard/ProductCard.tsx` | Nueva columna con `<Link href="/products/{id}/edit">Editar</Link>` |
| `presentation/components/ProductCard/ProductCard.module.css` | Clase `.btnEdit` — estilo amarillo coherente con la paleta |
| `presentation/components/ProductList/ProductList.tsx` | Nueva cabecera `<th>Acciones</th>` en la tabla |

---

## Flujo de la página de edición

```
/products/[id]/edit → EditProductPage
  ├── useEffect → productService.getById(id)
  │     ├── loading → "Cargando producto..."
  │     ├── error  → "Producto no encontrado." + botón volver
  │     └── éxito  → monta <EditForm product={...} />
  └── EditForm (componente interno, inicializado con datos reales)
        └── useProductForm({ initialValues: product, disableId: true,
                             onSuccess: updateProduct(id, values) → router.push('/') })
              └── <ProductForm submitLabel="Actualizar" disableId={true} ... />
```

> El componente `EditForm` está separado de `EditProductPage` para que `useProductForm` se inicialice con `initialValues` ya resueltos (evita que el `useState` tome el valor inicial antes de que cargue el producto).

---

## Reutilización de `ProductForm`

El componente ya fue diseñado en US-06 con las props `disableId` e `initialValues`. US-07 aprovecha ambas:

| Prop | Valor en edición | Efecto |
|---|---|---|
| `disableId` | `true` | Campo ID deshabilitado, sin `onBlur` de verificación |
| `initialValues` | producto cargado del API | Pre-carga todos los campos |
| `submitLabel` | `"Actualizar"` | Botón muestra "Actualizar" en lugar de "Agregar" |

---

## Validaciones en modo edición

Las mismas reglas que US-06, con una excepción:
- **No** se verifica unicidad de ID al perder foco (campo deshabilitado + `disableId=true` omite `onBlur`)
- Fecha Revisión sigue auto-calculándose si se cambia Fecha Liberación

---

## Criterios de aceptación cubiertos

| Criterio | Implementación |
|---|---|
| Formulario pre-carga valores actuales | `initialValues: product` en `useProductForm` |
| Campo ID deshabilitado | `disableId={true}` → `<input disabled>` |
| Mismas validaciones que creación (sin verificación de ID) | `validateAll()` sin `handleIdBlur` |
| Actualización exitosa redirige al listado | `router.push('/')` en `onSuccess` |
| Producto no encontrado muestra error | `loadError` state con mensaje y botón volver |

---

## Verificación

```
npx tsc --noEmit              → 0 errores ✓
docker compose build          → Built ✓
GET http://localhost:3002/bp/products/trj-crd  → 200 { data: {...} } ✓
GET http://localhost:3002/bp/products/no-existe → 404 NotFoundError ✓
GET http://localhost:3002/bp/products/verification/trj-crd → true ✓  (ruta no afectada)
GET http://localhost:3000/                        → 200, lista con botón "Editar" ✓
GET http://localhost:3000/products/trj-crd/edit  → 200, formulario pre-cargado ✓
```
