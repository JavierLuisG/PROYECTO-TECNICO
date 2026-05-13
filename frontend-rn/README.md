# Frontend React Native — Catálogo de Productos Financieros

Aplicación **React Native 0.81** con **Expo SDK 54** y **TypeScript**, siguiendo arquitectura limpia por capas.

**Metro bundler**: puerto **8083**
Consume la API `repo-interview-main` en `http://localhost:3002` (ejecutar localmente — no dockerizada).

> **Nota de puertos**: Expo Metro usa por defecto el puerto 8081, que entra en conflicto con ms-cliente.
> Por eso todos los scripts arrancan con `--port 8083`.

---

## Funcionalidades implementadas

| Feature | Pantalla | Descripción |
|---|---|---|
| F1 — Listado | `app/index.tsx` | Lista completa con estado de carga y error |
| F1 — Detalle | `app/products/[id]/index.tsx` | Vista completa del producto al seleccionarlo |
| F2 — Búsqueda | `app/index.tsx` | Filtro en tiempo real por nombre o descripción |
| F3 — Contador | `app/index.tsx` | Contador de registros actualizado con el filtro |
| F4 — Crear | `app/products/new.tsx` | Formulario con validaciones y fecha revisión auto-calculada |
| F5 — Editar | `app/products/[id]/edit.tsx` | Formulario pre-cargado, campo ID deshabilitado |
| F6 — Eliminar | `app/products/[id]/index.tsx` | Botón Eliminar + modal de confirmación nativo |

---

## Arquitectura por capas

```
src/
├── domain/models/
│   └── Product.ts                  ← interfaz Product + tipos payload
│
├── application/
│   ├── usecases/
│   │   ├── createProduct.ts
│   │   ├── updateProduct.ts
│   │   └── deleteProduct.ts
│   └── hooks/
│       ├── useProducts.ts          ← fetch + estado loading/error + refresh()
│       ├── useProductForm.ts       ← estado del formulario, validaciones (RN: sin ChangeEvent)
│       └── useSearch.ts            ← filtro en memoria
│
├── infrastructure/api/
│   └── productService.ts           ← getAll, getById, create, update, remove, verifyId
│
└── presentation/components/
    ├── ProductList/                 ← FlatList + estados: loading, error, vacío, con datos
    ├── ProductCard/                 ← TouchableOpacity navegable al detalle
    ├── ProductForm/                 ← TextInput, KeyboardAvoidingView, ScrollView
    ├── SearchBar/                   ← TextInput con onChangeText
    ├── RecordCount/                 ← Text con accessibilityLiveRegion
    └── ConfirmModal/                ← Modal nativo (transparent + animationType="fade")
```

**Regla de dependencia**: `presentation` → `application` → `domain`. `infrastructure` se llama solo desde `application`.

> Estilos con **StyleSheet.create()** por componente — sin frameworks de estilos ni UI kits.

---

## Equivalencias web → React Native (referencia rápida)

| Web | React Native |
|---|---|
| `<div>` | `<View>` |
| `<p>` / `<span>` | `<Text>` |
| `<input>` | `<TextInput onChangeText={fn}>` |
| `<textarea>` | `<TextInput multiline>` |
| `<button onClick>` | `<TouchableOpacity onPress>` |
| `<img src>` | `<Image source={{ uri }}>` |
| `<ul> + map()` | `<FlatList data renderItem>` |
| `CSS Modules` | `StyleSheet.create({})` |
| `next/link` | `router.push()` de expo-router |
| Modal overlay div | `<Modal visible transparent>` |

---

## Prerequisitos

| Herramienta | Versión | Para |
|---|---|---|
| Node.js | 20+ | npm / metro |
| Xcode | 15+ | Simulador iOS (solo macOS) |
| Android Studio | 2023+ | Emulador Android |
| Expo Go (app) | última | Dispositivo físico (opcional) |

### Instalar simuladores

```bash
# iOS — instalar desde Mac App Store, luego:
xcode-select --install
sudo xcodebuild -license accept

# Android — agregar al ~/.zshrc:
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
source ~/.zshrc
```

---

## URL de la API según plataforma

La variable `EXPO_PUBLIC_API_BASE_URL` se lee en `productService.ts`. Por defecto apunta a `localhost:3002`.

| Plataforma | URL a usar | Archivo |
|---|---|---|
| Simulador iOS | `http://localhost:3002` ✅ | `.env` (por defecto) |
| Emulador Android | `http://10.0.2.2:3002` | `.env` (cambiar) |
| Dispositivo físico | `http://<tu-IP-local>:3002` | `.env` (cambiar) |

```env
# frontend-rn/.env
EXPO_PUBLIC_API_BASE_URL=http://localhost:3002
```

---

## Mapa de puertos del proyecto completo

| Servicio | Puerto | Cómo arranca |
|---|---|---|
| ms-cliente | **8081** | Docker Compose |
| ms-cuenta | **8082** | Docker Compose |
| frontend Next.js | **3000** | Docker Compose |
| PostgreSQL | **5432** | Docker Compose |
| RabbitMQ AMQP | **5672** | Docker Compose |
| RabbitMQ Management | **15672** | Docker Compose |
| repo-interview-main | **3002** | Local (`npm run start:dev`) |
| frontend-rn (Expo Metro) | **8083** | Local (`npm start`) |

> Expo Metro se configuró en el **8083** para evitar conflicto con ms-cliente (8081).

---

## Instalación y arranque

```bash
cd frontend-rn
npm install

# Arrancar Metro (el menú interactivo permite elegir plataforma)
npm start

# O directamente en una plataforma:
npm run ios        # abre simulador iOS
npm run android    # abre emulador Android
```

Después de `npm start` verás un menú en terminal:
```
› Press i │ open iOS simulator
› Press a │ open Android
› Press w │ open web browser
› Press r │ reload app
› Press ? │ show all commands
```

---

## Tests

**Framework**: Jest 29 + React Native Testing Library 13 + jest-expo

```bash
npm test                # ejecuta los 57 tests
npm run test:coverage   # con reporte de cobertura (umbral ≥ 70%)
```

**Cobertura actual: 86% statements · 76% branches · 80% functions · 90% lines**

| Archivo de test | Qué verifica |
|---|---|
| `productService.test.ts` | Todos los métodos (axios mock), normalización de fechas ISO |
| `useProducts.test.ts` | Estado inicial, fetch exitoso, error, refresh |
| `useSearch.test.ts` | Filtrado por nombre, descripción, case-insensitive |
| `useProductForm.test.ts` | handleChange, handleIdBlur, handleSubmit, validaciones |
| `SearchBar.test.tsx` | TextInput con onChangeText, accessibilityLabel |
| `RecordCount.test.tsx` | Singular/plural, 0 resultados |
| `ProductCard.test.tsx` | Render, logo vacío, navegación al detalle |
| `ProductList.test.tsx` | Loading, error, vacío, con productos |
| `ProductForm.test.tsx` | 6 campos, errors, disableId, submitLabel, onChange |
| `ConfirmModal.test.tsx` | isOpen, productName, Cancelar, Eliminar, isDeleting |

---

## Estructura de archivos

```
frontend-rn/
├── app/                              # Expo Router (file-based routing)
│   ├── _layout.tsx                   # Stack navigator con header amarillo
│   ├── index.tsx                     # Home: listado + búsqueda (F1, F2, F3)
│   └── products/
│       ├── new.tsx                   # Crear producto (F4)
│       └── [id]/
│           ├── index.tsx             # Detalle + Eliminar con modal (F1, F6)
│           └── edit.tsx              # Editar producto (F5)
├── src/
│   ├── domain/models/Product.ts
│   ├── application/
│   │   ├── usecases/{create,update,delete}Product.ts
│   │   └── hooks/{useProducts,useProductForm,useSearch}.ts
│   ├── infrastructure/api/productService.ts
│   └── presentation/components/
│       └── {ProductList,ProductCard,ProductForm,SearchBar,RecordCount,ConfirmModal}/
├── __tests__/
├── .env                              # EXPO_PUBLIC_API_BASE_URL=http://localhost:3002
├── app.json                          # Config Expo (scheme, slug, platforms)
├── package.json
└── tsconfig.json
```

---

## Troubleshooting

| Problema | Causa | Solución |
|---|---|---|
| Puerto 8083 ocupado | Otro proceso | `npx expo start --port 8084` |
| API no responde en Android | `localhost` no funciona en emulator | Cambiar `.env` a `http://10.0.2.2:3002` |
| Teclado tapa campos | Sin KeyboardAvoidingView | Ya incluido en `ProductForm` |
| Imágenes HTTP bloqueadas (iOS) | ATS de iOS | Agregar `NSAllowsArbitraryLoads: true` en `app.json → expo.ios.infoPlist` |
| Metro no recarga | Caché corrupta | `npx expo start --clear` |
| Tests fallan (transformIgnorePatterns) | Módulo Expo sin transpilar | Agregar el módulo al patrón en `package.json → jest.transformIgnorePatterns` |
