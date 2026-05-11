# TASK-19 — Tests Unitarios Frontend (Jest)

**Fecha implementación**: 2026-05-11

---

## Archivos de configuración creados (5)

| Archivo | Descripción |
|---|---|
| `jest.config.js` | Config Jest: jsdom environment, babel-jest transform con `next/babel`, moduleNameMapper para CSS y `next/link` |
| `jest.setup.ts` | Importa `@testing-library/jest-dom` para matchers extendidos |
| `babel.config.js` | Preset `next/babel` — transforma TS/TSX + JSX + módulos ESM a CJS |
| `__mocks__/styleMock.ts` | Proxy que mapea cada clase CSS a su propio nombre (evita errores de importación) |
| `__mocks__/next-link.tsx` | Mock de `next/link` → renderiza como `<a href>` simple en JSDOM |

---

## Archivos de test creados (6)

### Tests especificados en IMPLEMENTATION.md

| Archivo | Tests | Cobertura |
|---|---|---|
| `__tests__/infrastructure/api/productService.test.ts` | 10 | `productService.ts` 100% |
| `__tests__/presentation/components/SearchBar.test.tsx` | 5 | `SearchBar.tsx` 100% |
| `__tests__/presentation/components/ProductForm.test.tsx` | 13 | `ProductForm.tsx` 100% |
| `__tests__/application/hooks/useProducts.test.ts` | 7 | `useProducts.ts` 100% |

### Tests adicionales para alcanzar ≥ 70%

| Archivo | Tests | Archivos cubiertos |
|---|---|---|
| `__tests__/application/hooks/useSearch.test.ts` | 7 | `useSearch.ts` 100% |
| `__tests__/application/hooks/useProductForm.test.ts` | 16 | `useProductForm.ts` 91% |
| `__tests__/presentation/components/ProductList.test.tsx` | 16 | `ProductList.tsx` 100%, `ProductCard.tsx` 100%, `RecordCount.tsx` 100% |

**Total: 74 tests en 7 archivos**

---

## Resultado de cobertura

```
npm run test:coverage

Test Suites: 7 passed, 7 total
Tests:       74 passed, 74 total

-------------------------------------|---------|----------|---------|---------|
File                                 | % Stmts | % Branch | % Funcs | % Lines |
-------------------------------------|---------|----------|---------|---------|
All files                            |   94.24 |    92.07 |   97.14 |   98.30 |
  useProductForm.ts                  |   90.80 |   85.96  |   93.33 |   97.01 |
  useProducts.ts                     |  100.00 |  100.00  |  100.00 |  100.00 |
  useSearch.ts                       |  100.00 |  100.00  |  100.00 |  100.00 |
  productService.ts                  |  100.00 |  100.00  |  100.00 |  100.00 |
  ProductCard.tsx                    |  100.00 |  100.00  |  100.00 |  100.00 |
  ProductForm.tsx                    |  100.00 |  100.00  |  100.00 |  100.00 |
  ProductList.tsx                    |  100.00 |  100.00  |  100.00 |  100.00 |
  RecordCount.tsx                    |  100.00 |  100.00  |  100.00 |  100.00 |
  SearchBar.tsx                      |  100.00 |  100.00  |  100.00 |  100.00 |
-------------------------------------|---------|----------|---------|---------|
Umbral requerido: ≥ 70% ✓
```

---

## Decisiones técnicas

| Decisión | Razón |
|---|---|
| `babel.config.js` con `next/babel` en lugar de `ts-node` | `ts-node` no está instalado; `next/babel` transforma TS/TSX/JSX sin dependencias adicionales |
| `jest.config.js` (no `.ts`) | `ts-node` no disponible; Jest necesita CJS para leer su propia config |
| Mock `next/link` en `moduleNameMapper` | El componente real requiere el router de Next.js que no existe en JSDOM |
| `jest.mock('axios', factory)` con `mock.results[0].value` | `axios.create()` se llama al importar `productService.ts`; la instancia queda accesible tras el hoisting |
| Tests de `useProductForm` con `renderHook` + `act` | El hook tiene estado async; `act` garantiza que las actualizaciones de estado se reflejan antes de los asserts |

---

## Criterios de aceptación cubiertos

| Criterio | Estado |
|---|---|
| `productService.test.ts` | ✅ 10 tests, 100% cobertura |
| `SearchBar.test.tsx` | ✅ 5 tests, 100% cobertura |
| `ProductForm.test.tsx` | ✅ 13 tests, 100% cobertura |
| `useProducts.test.ts` | ✅ 7 tests, 100% cobertura |
| Cobertura global ≥ 70% | ✅ 94.24% statements · 92.07% branches |
