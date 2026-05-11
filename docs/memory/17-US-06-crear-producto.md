# US-06 — Formulario de Creación de Producto (Frontend)

**Fecha implementación**: 2026-05-11  
**Rama**: `feat/US-06-crear-producto` — Bloque 1  
**Tarea**: US-06 (F4)

---

## Archivos creados (6 archivos)

| Archivo | Tipo | Descripción |
|---|---|---|
| `application/usecases/createProduct.ts` | Use case | Llama `productService.create(payload)` y retorna `Product` |
| `application/hooks/useProductForm.ts` | Hook | Toda la lógica del formulario: valores, errores, validación, ID check, fecha revisión, submit, reset |
| `presentation/components/ProductForm/ProductForm.tsx` | Componente | Formulario puro con 6 campos + botones Agregar/Reiniciar |
| `presentation/components/ProductForm/ProductForm.module.css` | CSS | Estilos sin Tailwind — campos, errores, botones, estado disabled |
| `src/app/products/new/page.tsx` | Página Next.js | Client Component; compone hook + componente; redirige al listado tras éxito |
| `src/app/products/new/page.module.css` | CSS | Layout página formulario |

## Archivos modificados

| Archivo | Cambio |
|---|---|
| `src/app/page.tsx` | `Link href="/products/new"` como botón "Agregar" en la toolbar |
| `src/app/page.module.css` | Estilos `.btnAdd` y ajuste de `.toolbar` con `gap` |

---

## Flujo del formulario

```
/products/new → NewProductPage
  └── useProductForm({ onSuccess: createProduct → router.push('/') })
        ├── values: { id, name, description, logo, date_release, date_revision }
        ├── errors: por campo + 'submit'
        ├── handleChange → recalcula date_revision si cambia date_release
        ├── handleIdBlur → productService.verifyId(id) → error si existe
        └── handleSubmit → validateAll() → createProduct() → redirect
```

---

## Validaciones implementadas

| Campo | Regla | Error |
|---|---|---|
| ID | Requerido, 3-10 chars | `"ID es requerido"` / `"Mínimo 3 caracteres"` / `"Máximo 10 caracteres"` |
| ID (async) | No debe existir — verificado con `GET /bp/products/verification/:id` al perder foco | `"ID ya registrado"` |
| Nombre | Requerido, 5-100 chars | Mensaje con límite correspondiente |
| Descripción | Requerido, 10-200 chars | Mensaje con límite correspondiente |
| Logo | Requerido | `"Logo es requerido"` |
| Fecha Liberación | Requerido, `>= hoy` | `"La fecha debe ser igual o mayor a hoy"` |
| Fecha Revisión | Auto-calculada (release + 1 año) — campo `readOnly`, no editable | — |

---

## Diseño del componente `ProductForm`

El componente es **reutilizable para creación Y edición** (US-07):
- `disableId: boolean` — en edición el campo ID queda disabled
- `initialValues?: Partial<ProductFormValues>` — en edición se precarga con valores existentes
- `onSubmit`, `onReset`, `onChange`, `onIdBlur` — delegados al hook

---

## Criterios de aceptación cubiertos

| Criterio | Implementación |
|---|---|
| 6 campos con errores individuales | `errors[campo]` bajo cada `<input>` |
| ID verifica unicidad al perder foco | `handleIdBlur()` llama `productService.verifyId()` |
| Fecha Revisión = Liberación + 1 año | `handleChange` recalcula `date_revision` cuando `name === 'date_release'` |
| Fecha Revisión no editable | `readOnly` + `tabIndex={-1}` |
| Botón "Agregar" no envía si hay errores | `validateAll()` antes del fetch |
| Creación exitosa redirige al listado | `router.push('/')` en `onSuccess` |
| Botón "Reiniciar" limpia campos y errores | `handleReset()` vuelve a `EMPTY_VALUES` |
| Error API visible | `errors.submit` con bloque rojo |

---

## Verificación

```
npx tsc --noEmit              → 0 errores ✓
docker compose build frontend → Built ✓
GET http://localhost:3000      → botón "Agregar" visible ✓
GET http://localhost:3000/products/new → 200, formulario de registro ✓
```
