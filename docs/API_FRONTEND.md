# API Frontend — Productos Financieros (Node.js :3002)

El frontend Next.js consume este backend Node.js provisto por el ejercicio.
Debe ejecutarse de forma independiente al stack Docker bancario.

## URL Base

```
http://localhost:3002
```

## Iniciar el backend Node.js

```bash
# En la carpeta repo-interview-main (provista por el ejercicio):
npm install
npm run start:dev
```

---

## Endpoints

### GET /bp/products — Listar productos

```http
GET http://localhost:3002/bp/products
```

**Response 200**:
```json
{
  "data": [
    {
      "id": "trj-crd",
      "name": "Tarjetas de Crédito",
      "description": "Tarjeta de consumo bajo la modalidad de crédito",
      "logo": "https://www.visa.com.ec/...",
      "date_release": "2023-02-01",
      "date_revision": "2024-02-01"
    }
  ]
}
```

---

### POST /bp/products — Crear producto

```http
POST http://localhost:3002/bp/products
Content-Type: application/json
```

**Request**:
```json
{
  "id": "seg-vida",
  "name": "Seguro de Vida",
  "description": "Protección de vida para el titular",
  "logo": "https://ejemplo.com/logo.png",
  "date_release": "2025-06-01",
  "date_revision": "2026-06-01"
}
```

**Response 200**:
```json
{
  "message": "Product added successfully",
  "data": { ...producto }
}
```

**Response 400** (validación fallida):
```json
{
  "name": "BadRequestError",
  "message": "Invalid body, check 'errors' property for more info."
}
```

---

### PUT /bp/products/:id — Actualizar producto

```http
PUT http://localhost:3002/bp/products/seg-vida
Content-Type: application/json
```

**Request** (id no se envía en body):
```json
{
  "name": "Seguro de Vida Premium",
  "description": "Protección de vida extendida para el titular",
  "logo": "https://ejemplo.com/logo-v2.png",
  "date_release": "2025-06-01",
  "date_revision": "2026-06-01"
}
```

**Response 200**:
```json
{
  "message": "Product updated successfully",
  "data": { ...producto actualizado }
}
```

**Response 404**:
```json
{
  "name": "NotFoundError",
  "message": "Not product found with that identifier"
}
```

---

### DELETE /bp/products/:id — Eliminar producto

```http
DELETE http://localhost:3002/bp/products/seg-vida
```

**Response 200**:
```json
{ "message": "Product removed successfully" }
```

**Response 404**:
```json
{
  "name": "NotFoundError",
  "message": "Not product found with that identifier"
}
```

---

### GET /bp/products/verification/:id — Verificar existencia de ID

```http
GET http://localhost:3002/bp/products/verification/seg-vida
```

**Response 200**: `true` (existe) o `false` (no existe)

Usado en el formulario de creación para validar que el ID no esté ya registrado.

---

## Modelo de Producto Financiero

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | String (3-10 chars) | Identificador único |
| `name` | String (6-100 chars) | Nombre del producto |
| `description` | String (10-200 chars) | Descripción |
| `logo` | String (URL) | URL del logo |
| `date_release` | Date (YYYY-MM-DD) | Fecha de lanzamiento (≥ hoy) |
| `date_revision` | Date (YYYY-MM-DD) | Exactamente 1 año después de `date_release` |

## Validaciones del formulario (F4 — SemiSenior)

| Campo | Regla |
|---|---|
| `id` | Requerido, 3-10 chars, no debe existir (verificar con `/verification/:id`) |
| `name` | Requerido, 6-100 chars |
| `description` | Requerido, 10-200 chars |
| `logo` | Requerido |
| `date_release` | Requerido, fecha ≥ hoy |
| `date_revision` | Requerido, exactamente 1 año después de `date_release` |
