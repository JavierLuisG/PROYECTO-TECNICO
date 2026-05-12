# Integración repo-interview-main 

**Fecha implementación**: 2026-05-12

---

## Contexto

El ejercicio del frontend requiere consumir una API Node.js/TypeScript provista por Sofka (`repo-interview-main`) que expone productos financieros bajo el prefijo `/bp`. Esta API se ejecuta localmente en el puerto **3002** y no forma parte del stack Docker del proyecto bancario.

---

## Conexión frontend → repo-interview-main

### Variable de entorno

El frontend lee `NEXT_PUBLIC_API_BASE_URL` para construir la base URL del cliente axios. Esta variable se bake en el bundle de Next.js durante el build (no en runtime), por lo que se pasa como `build.args` en `docker-compose.yml`:

```yaml
frontend:
  build:
    context: ./frontend
    dockerfile: Dockerfile
    args:
      NEXT_PUBLIC_API_BASE_URL: http://localhost:3002
```

El `Dockerfile` del frontend expone el ARG antes del `RUN npm run build`:

```dockerfile
ARG NEXT_PUBLIC_API_BASE_URL=http://localhost:3002
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
RUN npm run build
```

### CORS en repo-interview-main

Se habilitó CORS en `repo-interview-main/src/main.ts` y se instaló el paquete `cors` como dependencia:

```typescript
const app = createExpressServer({
  cors: true,
  routePrefix: "/bp",
  controllers: [__dirname + "/controllers/*{.js,.ts}"],
});
```

---

## Bugs de compatibilidad corregidos

### 1. `getById` — formato de respuesta

El endpoint `GET /bp/products/:id` devuelve el producto directamente (sin wrapper `{ data: ... }`), a diferencia de `GET /bp/products` que sí usa el wrapper. Corregido en `productService.ts`:

```typescript
async getById(id: string): Promise<Product> {
  const response = await api.get<Product>(`${PRODUCTS_PATH}/${id}`);
  return normalizeProduct(response.data);   // era response.data.data
}
```

### 2. Normalización de fechas ISO → YYYY-MM-DD

La API usa `class-transformer` para transformar el body del POST: los strings de fecha se convierten a objetos `Date`. Al serializar de vuelta con JSON, las fechas regresan como timestamps ISO (`2026-05-13T00:00:00.000Z`). El `<input type="date">` de HTML requiere exactamente `YYYY-MM-DD`.

Se agregó una función de normalización aplicada en `getAll` y `getById`:

```typescript
function normalizeDate(value: string): string {
  return value ? value.substring(0, 10) : value;
}

function normalizeProduct(p: Product): Product {
  return {
    ...p,
    date_release: normalizeDate(p.date_release),
    date_revision: normalizeDate(p.date_revision),
  };
}
```

### 3. Validación de `name` — mínimo 6 caracteres

El DTO del servidor define `@MinLength(6)` para el campo `name`. La validación del frontend se alineó con ese contrato:

```typescript
// useProductForm.ts
if (value.length < 6) return 'Nombre no válido. Mínimo 6 caracteres';
```

### 4. Mensaje de error genérico al guardar

El mensaje de error al fallar el submit decía "No se pudo **crear**..." incluso en el flujo de edición. Se unificó a "No se pudo **guardar** el producto. Intenta de nuevo."

---

## Decisión: repo-interview-main no se dockeriza

La API `repo-interview-main` no se incluye en `docker-compose.yml` porque:
- El ejercicio la provee como servidor local de soporte
- El frontend (browser) consume `http://localhost:3002` directamente; Docker no puede inyectar esa URL en runtime (solo en build time)
- Dockerizarla requeriría exponer el puerto al host igualmente, sin ventaja adicional

**Forma de ejecutarla**:
```bash
cd repo-interview-main
npm install
npm run start:dev   # http://localhost:3002
```

---

## Archivos modificados

| Archivo | Cambio |
|---|---|
| `docker-compose.yml` | Eliminado servicio `mock-api`; frontend usa `build.args` para `NEXT_PUBLIC_API_BASE_URL` |
| `frontend/Dockerfile` | ARG default cambiado a `http://localhost:3002` |
| `repo-interview-main/src/main.ts` | `cors: true` habilitado |
| `frontend/src/infrastructure/api/productService.ts` | `getById` corregido; normalización de fechas en `getAll` y `getById` |
| `frontend/src/application/hooks/useProductForm.ts` | Validación `name` min 6; mensaje de error genérico |
| `README.md` | Sección "API de Productos" reescrita; estructura del proyecto actualizada |
| `frontend/README.md` | Referencias a `mock-api` reemplazadas; validación de `name` corregida |
| `docs/API_FRONTEND.md` | Validación de `name` 5→6 chars sincronizada |
