# US-08 — Vista de detalle de producto financiero

**Fecha implementación**: 2026-05-12

---

## Contexto

El ejercicio (F1) requiere que al seleccionar un item del listado se muestre toda la información del producto en otra vista (diseño D1 derecho). Esta funcionalidad no existía: el listado solo tenía un botón "Editar" por fila. Se implementó la pantalla de detalle completa incluyendo el componente de confirmación para eliminar (F6).

---

## Archivos creados

### `frontend/src/app/products/[id]/page.tsx`

Página de detalle de producto con ruta dinámica `/products/[id]`. Estructura:
- Llama `productService.getById(id)` al montar
- Muestra: ID (título principal), subtítulo "Información extra", campos etiquetados (Nombre, Descripción, Logo, Fecha liberación, Fecha revisión)
- Botón **Editar** (gris) → navega a `/products/${id}/edit`
- Botón **Eliminar** (rojo) → abre `ConfirmModal`
- Al confirmar eliminar: llama `deleteProduct(id)` → redirige a `/`
- Manejo de estado: loading, error, showModal, isDeleting

### `frontend/src/app/products/[id]/page.module.css`

Estilos del detalle según diseño D1 derecho:
- Card centrada (max-width 480px)
- ID como `<h2>` bold grande + subtítulo gris
- `<dl>` con filas etiqueta/valor separadas por bordes
- Logo mostrado como imagen 120×80 con borde
- Botones de acción apilados verticalmente, ancho completo

### `frontend/src/presentation/components/ConfirmModal/ConfirmModal.tsx`

Modal de confirmación con:
- Overlay semi-transparente fijo sobre toda la pantalla
- `role="dialog"` + `aria-modal="true"` + `aria-labelledby` para accesibilidad
- Prop `isOpen` para renderizado condicional
- Prop `productName` mostrado en el mensaje
- Prop `isDeleting` para deshabilitar botones durante la operación
- Botones: **Cancelar** (gris) y **Eliminar** (rojo)

### `frontend/src/presentation/components/ConfirmModal/ConfirmModal.module.css`

Estilos del modal: overlay rgba(0,0,0,0.45), dialog blanco centrado, sombra.

### `frontend/src/application/usecases/deleteProduct.ts`

Caso de uso que delega en `productService.remove(id)`.

---

## Archivos modificados

### `frontend/src/presentation/components/ProductCard/ProductCard.tsx`

- Eliminado botón "Editar" (`<Link href="/products/${id}/edit">`)
- Agregado indicador de navegación: `<Link href="/products/${id}">` mostrando `>` con `aria-label`
- La columna "Acciones" ahora dirige al detalle, no directamente a edición

### `frontend/src/presentation/components/ProductCard/ProductCard.module.css`

- Eliminada clase `.btnEdit`
- Agregada clase `.btnNav`: botón circular 28×28, amarillo al hover

---

## Flujo completo implementado

```
Listado (/)
  └── clic en ">" de cualquier fila
        └── /products/[id]  (detalle)
              ├── "Editar" → /products/[id]/edit
              └── "Eliminar" → ConfirmModal
                    ├── "Cancelar" → cierra modal
                    └── "Eliminar" → DELETE /bp/products/:id → redirige a /
```

---

## Rutas del App Router (Next.js)

| Ruta | Archivo | Descripción |
|---|---|---|
| `/` | `app/page.tsx` | Listado + búsqueda |
| `/products/new` | `app/products/new/page.tsx` | Crear producto |
| `/products/[id]` | `app/products/[id]/page.tsx` | **Detalle** (nuevo) |
| `/products/[id]/edit` | `app/products/[id]/edit/page.tsx` | Editar producto |
