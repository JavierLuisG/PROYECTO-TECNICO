# Frontend React Native (Expo) — Implementación completa F1–F6

**Fecha implementación**: 2026-05-12  
**Carpeta**: `frontend-rn/` (paralelo a `frontend/` Next.js)

---

## Contexto

El ejercicio pide un frontend en React Native. Se implementó con **Expo SDK 54** y **Expo Router v6**, siguiendo la misma arquitectura limpia por capas del frontend Next.js. Las capas de dominio, infrastructure y hooks son prácticamente idénticas; la diferencia está en la capa de presentación (componentes React Native en lugar de HTML + CSS Modules).

---

## Stack

| Tecnología | Versión | Rol |
|---|---|---|
| React Native | 0.81.5 | Framework móvil |
| Expo SDK | 54 | Toolchain + APIs nativas |
| Expo Router | 6 | Navegación file-based (igual que Next.js App Router) |
| TypeScript | 5.9 | Tipado estricto |
| Axios | 1.16 | Cliente HTTP (idéntico al Next.js) |
| Jest + jest-expo | 29 + 54 | Tests unitarios |
| React Native Testing Library | 13 | Tests de componentes |

---

## Puerto

Expo Metro bundler corre en el **8083** (no en el 8081 por defecto) para evitar conflicto con `ms-cliente` que también usa el 8081.

```json
"start": "expo start --port 8083"
```

---

## Estructura de archivos

```
frontend-rn/
├── app/                              ← Expo Router (file-based routing)
│   ├── _layout.tsx                   ← Stack navigator, header amarillo
│   ├── index.tsx                     ← Home: listado + búsqueda + contador (F1, F2, F3)
│   └── products/
│       ├── new.tsx                   ← Crear producto (F4)
│       └── [id]/
│           ├── index.tsx             ← Detalle + modal eliminar (F1 detalle, F6)
│           └── edit.tsx              ← Editar producto (F5)
├── src/
│   ├── domain/models/Product.ts      ← Idéntico al Next.js
│   ├── application/
│   │   ├── usecases/                 ← createProduct, updateProduct, deleteProduct (idénticos)
│   │   └── hooks/
│   │       ├── useProducts.ts        ← Idéntico al Next.js (hook React puro)
│   │       ├── useSearch.ts          ← Idéntico al Next.js
│   │       └── useProductForm.ts     ← Adaptado: sin ChangeEvent, handleChange(name, value)
│   ├── infrastructure/api/
│   │   └── productService.ts         ← Idéntico al Next.js (EXPO_PUBLIC_ en vez de NEXT_PUBLIC_)
│   └── presentation/components/
│       ├── SearchBar/                ← TextInput + onChangeText
│       ├── RecordCount/              ← Text + accessibilityLiveRegion
│       ├── ProductCard/              ← TouchableOpacity navegable + Image source={{ uri }}
│       ├── ProductList/              ← FlatList (no tabla HTML)
│       ├── ProductForm/              ← TextInput, KeyboardAvoidingView, ScrollView
│       └── ConfirmModal/             ← Modal nativo (transparent + animationType="fade")
├── __tests__/                        ← 57 tests, coverage ≥ 70%
├── babel.config.js                   ← Requerido por Expo Router
├── .env                              ← EXPO_PUBLIC_API_BASE_URL
├── app.json                          ← scheme: banco-productos, platforms: [ios, android]
└── package.json
```

---

## Adaptaciones clave web → React Native

### `useProductForm.ts`
La diferencia más importante con el Next.js. `TextInput` en React Native no emite eventos — llama a `onChangeText` con el `string` directo, sin objeto Event.

```typescript
// Next.js (web):
handleChange: (e: ChangeEvent<HTMLInputElement>) => void

// React Native:
handleChange: (name: keyof ProductFormValues, value: string) => void
```

El `handleSubmit` también pierde el `e.preventDefault()` (no existe en RN).

### `ProductCard`
```typescript
// Web: <Link href={...}><button>Editar</button></Link>
// RN: <TouchableOpacity onPress={() => router.push(`/products/${id}`)}>
```

### `ProductList`
```typescript
// Web: <table> + map()
// RN: <FlatList data={products} renderItem={({ item }) => <ProductCard product={item} />} />
```

### `ConfirmModal`
```typescript
// Web: div con position:fixed + CSS overlay
// RN: <Modal visible={isOpen} transparent animationType="fade">
```

### `Image`
```typescript
// Web: <img src={url} />
// RN: <Image source={{ uri: url }} resizeMode="contain" />
```

---

## Configuración necesaria (lecciones aprendidas)

### `babel.config.js` — crítico para Expo Router
Sin este archivo, Expo Router no puede resolver las rutas. Expo Router usa transformaciones Babel específicas que deben estar declaradas:

```js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
  };
};
```

`babel-preset-expo` debe instalarse como dependencia directa (no es suficiente que esté anidado dentro de `expo`).

### Puerto 8083 obligatorio
Expo Metro usa 8081 por defecto — mismo que `ms-cliente`. Se fija en 8083 en todos los scripts.

### Variable de entorno según plataforma

| Plataforma | `EXPO_PUBLIC_API_BASE_URL` |
|---|---|
| Simulador iOS | `http://localhost:3002` |
| Emulador Android | `http://10.0.2.2:3002` |
| iPhone físico (mismo WiFi / hotspot) | `http://<IP-local-Mac>:3002` |

La IP de la Mac se obtiene con: `ipconfig getifaddr en0`

### Expo Go en iPhone — requisitos
- Expo Go debe estar **actualizado a la versión compatible con SDK 54**
- iPhone y Mac deben estar en la misma red (o usar hotspot del iPhone si el router tiene aislamiento de clientes)
- Al arrancar, usar `npm run device` (modo LAN, puerto 8083)

---

## Tests

**57 tests en 10 suites — cobertura: 86% statements · 76% branches · 80% functions · 90% lines**

### Diferencias clave en los tests vs Next.js

| Situación | Next.js | React Native |
|---|---|---|
| Mock de router | `__mocks__/next-link.tsx` | `jest.mock('expo-router', ...)` |
| Imagen | `getByRole('image')` | `queryByText('—')` (no hay role 'image' fiable en RNTL) |
| Llamadas a handleChange en tests | Una sola `act()` | `act()` separado por cada campo (cierre de estado) |
| `transformIgnorePatterns` | Estándar | Extendido para módulos Expo/RN que usan ESM |

### Problema de cierre de estado en tests de hooks
`handleChange` usa `{ ...values, [name]: value }` (no forma funcional). Si se llaman múltiples `handleChange` dentro de un mismo `act()`, todas leen el mismo `values` inicial y la última sobreescribe a las anteriores. La solución es un `act()` separado por cada campo:

```typescript
// Incorrecto — todos los campos quedan vacíos excepto el último:
act(() => {
  result.current.handleChange('id', 'mi-id');
  result.current.handleChange('name', 'Mi nombre');
});

// Correcto — cada act() fuerza re-render antes del siguiente:
act(() => result.current.handleChange('id', 'mi-id'));
act(() => result.current.handleChange('name', 'Mi nombre'));
```

---

## Versiones de dependencias correctas para Expo SDK 54

| Paquete | Versión correcta |
|---|---|
| `jest-expo` | `~54.0.17` |
| `@types/jest` | `29.5.14` |
| `babel-preset-expo` | instalado directamente vía `npx expo install` |
| `react-test-renderer` | `19.1.0` (misma versión que `react`) |

---

## Comandos de referencia

```bash
npm start                # Metro en :8083 (simulador/menu interactivo)
npm run device           # Metro LAN en :8083 (iPhone físico)
npm run ios              # Simulador iOS directo
npm run android          # Emulador Android directo
npm test                 # 57 tests
npm run test:coverage    # Con reporte de cobertura
npx expo start --clear   # Limpia caché de Metro (usar cuando hay comportamientos extraños)
```
