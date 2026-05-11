import { renderHook, waitFor, act } from '@testing-library/react';
import { useProducts } from '../../../src/application/hooks/useProducts';
import { productService } from '../../../src/infrastructure/api/productService';

jest.mock('../../../src/infrastructure/api/productService');
const mockedService = productService as jest.Mocked<typeof productService>;

const mockProducts = [
  {
    id: 'trj-crd',
    name: 'Tarjetas de Crédito',
    description: 'Tarjeta de consumo bajo la modalidad de crédito',
    logo: 'https://example.com/logo.png',
    date_release: '2023-02-01',
    date_revision: '2024-02-01',
  },
  {
    id: 'seg-vida',
    name: 'Seguro de Vida',
    description: 'Protección de vida para el titular',
    logo: 'https://example.com/logo2.png',
    date_release: '2023-05-15',
    date_revision: '2024-05-15',
  },
];

beforeEach(() => {
  jest.clearAllMocks();
});

describe('useProducts — estado inicial', () => {
  it('arranca con loading true y lista vacía', async () => {
    mockedService.getAll.mockResolvedValue(mockProducts);
    const { result } = renderHook(() => useProducts());

    expect(result.current.loading).toBe(true);
    expect(result.current.products).toEqual([]);
    expect(result.current.error).toBeNull();

    // Esperar a que el fetch resuelva para evitar act() warnings al teardown
    await waitFor(() => expect(result.current.loading).toBe(false));
  });
});

describe('useProducts — fetch exitoso', () => {
  it('popula products y desactiva loading tras la carga', async () => {
    mockedService.getAll.mockResolvedValue(mockProducts);
    const { result } = renderHook(() => useProducts());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.products).toEqual(mockProducts);
    expect(result.current.error).toBeNull();
    expect(mockedService.getAll).toHaveBeenCalledTimes(1);
  });

  it('expone una función refresh', async () => {
    mockedService.getAll.mockResolvedValue(mockProducts);
    const { result } = renderHook(() => useProducts());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(typeof result.current.refresh).toBe('function');
  });
});

describe('useProducts — manejo de errores', () => {
  it('establece error state cuando el fetch falla', async () => {
    mockedService.getAll.mockRejectedValue(new Error('Network error'));
    const { result } = renderHook(() => useProducts());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.products).toEqual([]);
    expect(result.current.error).toContain('No se pudo cargar');
  });

  it('resetea error a null en fetch exitoso tras un fallo', async () => {
    mockedService.getAll.mockRejectedValueOnce(new Error('fail'));
    const { result } = renderHook(() => useProducts());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).not.toBeNull();

    mockedService.getAll.mockResolvedValue(mockProducts);
    act(() => { result.current.refresh(); });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });
    expect(result.current.products).toEqual(mockProducts);
  });
});

describe('useProducts — refresh', () => {
  it('vuelve a llamar getAll al invocar refresh', async () => {
    mockedService.getAll.mockResolvedValue(mockProducts);
    const { result } = renderHook(() => useProducts());

    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => { result.current.refresh(); });

    await waitFor(() => expect(mockedService.getAll).toHaveBeenCalledTimes(2));
  });
});
