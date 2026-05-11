/** @type {import('jest').Config} */
const config = {
  testEnvironment: 'jest-environment-jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': '<rootDir>/__mocks__/styleMock.ts',
    '^@/(.*)$': '<rootDir>/src/$1',
    '^next/link$': '<rootDir>/__mocks__/next-link.tsx',
  },
  transform: {
    '^.+\\.(ts|tsx|js|jsx)$': 'babel-jest',
  },
  testMatch: ['**/__tests__/**/*.test.{ts,tsx}'],
  collectCoverageFrom: [
    'src/infrastructure/api/productService.ts',
    'src/application/hooks/useProducts.ts',
    'src/application/hooks/useProductForm.ts',
    'src/application/hooks/useSearch.ts',
    'src/presentation/components/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
};

module.exports = config;
