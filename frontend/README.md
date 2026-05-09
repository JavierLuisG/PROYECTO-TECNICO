# Frontend - Aplicación Web de Productos Financieros

Aplicación **Next.js 16.2.6** con **React 19.2.4** y **TypeScript 5**, siguiendo **arquitectura limpia**.

## 🏛️ Arquitectura Limpia

```
src/
├── presentation/       # UI - Componentes React, páginas Next.js
├── application/        # Lógica de aplicación - Casos de uso, servicios
├── domain/            # Lógica de negocio - Modelos, interfaces
└── infrastructure/    # Acceso a datos externo - API calls, servicios
```

**Ventajas**:
- Separación clara de responsabilidades
- Fácil de testear (mockear servicios)
- Reutilizable (cambiar API no afecta UI)

## 🎯 Funcionalidades (Requerimientos)

| Feature | Status | Descripción |
|---------|--------|-------------|
| **F1** | ✅ | Listado de productos financieros |
| **F2** | ✅ | Búsqueda de productos por texto |
| **F3** | ✅ | Mostrar cantidad de registros |
| **F4** | ✅ | Agregar producto (formulario con validaciones) |
| **F5** | 🔄 | Editar producto |
| **F6** | 🔄 | Eliminar producto (modal confirmación) |

## 📁 Estructura del Proyecto

```
frontend/
├── src/
│   ├── app/                        # Next.js app/ router
│   │   ├── layout.tsx             # Layout principal
│   │   ├── page.tsx               # Home / Listado productos
│   │   ├── productos/
│   │   │   ├── page.tsx           # Página de productos
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx       # Detalle de producto
│   │   │   └── crear/
│   │   │       └── page.tsx       # Formulario crear
│   │   └── editar/
│   │       └── [id]/
│   │           └── page.tsx       # Formulario editar
│   │
│   ├── presentation/              # Componentes UI
│   │   ├── components/
│   │   │   ├── ProductCard.tsx
│   │   │   ├── ProductForm.tsx
│   │   │   ├── SearchBar.tsx
│   │   │   └── Modal.tsx
│   │   └── styles/               # Tailwind CSS globals
│   │
│   ├── application/              # Casos de uso, lógica
│   │   ├── usecases/
│   │   │   ├── ListProductsUseCase.ts
│   │   │   ├── SearchProductsUseCase.ts
│   │   │   ├── GetProductUseCase.ts
│   │   │   ├── CreateProductUseCase.ts
│   │   │   └── UpdateProductUseCase.ts
│   │   └── hooks/                # Custom React hooks
│   │       ├── useProducts.ts
│   │       ├── useProductForm.ts
│   │       └── useSearch.ts
│   │
│   ├── domain/                   # Modelos y interfaces
│   │   ├── models/
│   │   │   └── Product.ts
│   │   └── interfaces/
│   │       └── IProductRepository.ts
│   │
│   ├── infrastructure/           # Servicios externos
│   │   ├── api/
│   │   │   └── productService.ts (API calls)
│   │   └── repositories/
│   │       └── ProductRepository.ts
│   │
│   └── utils/                    # Funciones helper
│       ├── validation.ts
│       └── formatters.ts
│
├── public/                       # Archivos estáticos
├── __tests__/                    # Tests Jest
├── package.json
├── tsconfig.json
├── next.config.js
├── tailwind.config.js
└── README.md (este archivo)
```

## 🚀 Levantar Frontend

### Con Docker Compose

```bash
cd ../  # Ir a raíz del proyecto
docker-compose up -d
```

Accede en http://localhost:3000

### Local sin Docker

**Requisitos**:
- Node.js 20.x
- npm o yarn

**Pasos**:

```bash
cd frontend
npm install
npm run dev
```

Accede en http://localhost:3000

## 🔌 API Configuration

El frontend consume API backend en `http://localhost:3002` (Node.js aparte).

**Configurar en `.env.local`**:

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:3002
```

## 📝 Páginas y Rutas

| Ruta | Página | Componentes |
|------|--------|------------|
| `/` | Home | Lista de productos |
| `/productos` | Productos | Listado con búsqueda |
| `/productos/[id]` | Detalle | Información completa |
| `/productos/crear` | Crear | Formulario nuevo |
| `/productos/editar/[id]` | Editar | Formulario edit |

## 🎨 Estilos

**Framework**: Tailwind CSS 4.x

No se usan componentes prefabricados, solo utilidades de Tailwind.

### Configuración:

```javascript
// tailwind.config.js
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

## ✅ Validaciones Formulario

**Crear / Editar Producto**:

| Campo | Validación |
|-------|-----------|
| **ID** | Requerido, 3-10 caracteres, único (verifica con API) |
| **Nombre** | Requerido, 5-100 caracteres |
| **Descripción** | Requerido, 10-200 caracteres |
| **Logo** | Requerido (URL válida) |
| **Fecha Liberación** | Requerido, ≥ hoy |
| **Fecha Revisión** | Requerido, exactamente 1 año después liberación |

**Implementación**:

```typescript
// src/application/usecases/CreateProductUseCase.ts
export const validateProduct = (product: ProductFormData): ValidationErrors => {
  const errors: ValidationErrors = {};
  
  if (!product.id || product.id.length < 3) {
    errors.id = 'ID debe tener mínimo 3 caracteres';
  }
  // ... más validaciones
  
  return errors;
};
```

## ✅ Testing (Jest)

**Framework**: Jest + React Testing Library

### Ejecutar tests

```bash
npm test
```

**Coverage esperado**: 70%+

**Tipos de tests**:
- Componentes (snapshot, interacción)
- Hooks personalizados
- Servicios (mock de fetch)

### Ejemplo test

```typescript
// __tests__/components/ProductCard.test.tsx
import { render, screen } from '@testing-library/react';
import ProductCard from '@/presentation/components/ProductCard';

describe('ProductCard', () => {
  it('should render product name', () => {
    const product = { id: '1', name: 'Tarjeta Crédito' };
    render(<ProductCard product={product} />);
    expect(screen.getByText('Tarjeta Crédito')).toBeInTheDocument();
  });
});
```

## 📊 Estructura de Datos

**Producto Financiero**:

```typescript
interface Product {
  id: string;              // Identificador único
  name: string;            // Nombre del producto
  description: string;     // Descripción
  logo: string;           // URL del logo
  date_release: string;   // ISO date (YYYY-MM-DD)
  date_revision: string;  // ISO date (YYYY-MM-DD)
}
```

## 🌐 API Endpoints Consumidos

- `GET /bp/products` - Listar productos
- `POST /bp/products` - Crear producto
- `PUT /bp/products/:id` - Actualizar producto
- `DELETE /bp/products/:id` - Eliminar producto
- `GET /bp/products/verification/:id` - Verificar ID existente

## 🔍 Verificar que funciona

```bash
# Desarrollo
npm run dev
# → http://localhost:3000

# Build producción
npm run build
npm start
# → http://localhost:3000

# Lint
npm run lint
```

## 🛠️ Troubleshooting

**Error: "Cannot find module"**
- Ejecutar: `npm install`

**Next.js localhost no responde**
- Cambiar puerto: `next dev -p 3001`

**API no accesible desde frontend**
- Verificar `NEXT_PUBLIC_API_BASE_URL` en `.env.local`
- Verificar CORS del servidor backend

## 📚 Documentación Adicional

- [Architecture Overview](../docs/ARQUITECTURA.md)
- [API Endpoints](../docs/API_BACKEND.md)

## 📦 Dependencias Principales

- **next**: 16.2.6 - Framework React con SSR
- **react**: 19.2.4 - Librería UI
- **typescript**: 5 - Tipado estático
- **tailwindcss**: 4 - Estilos
- **jest**: Tests