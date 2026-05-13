import { renderHook, waitFor, act } from '@testing-library/react-native';
import { useProducts } from '../../../src/application/hooks/useProducts';
import { productService } from '../../../src/infrastructure/api/productService';

jest.mock('../../../src/infrastructure/api/productService');
const mockGetAll = productService.getAll as jest.Mock;

const mockProducts = [
  { id: 'trj-crd', name: 'Tarjetas de Crédito', description: 'Desc', logo: '', date_release: '2023-02-01', date_revision: '2024-02-01' },
];

beforeEach(() => jest.clearAllMocks());

describe('useProducts', () => {
  it('arranca con loading true', () => {
    mockGetAll.mockReturnValue(new Promise(() => {}));
    const { result } = renderHook(() => useProducts());
    expect(result.current.loading).toBe(true);
    expect(result.current.products).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('carga productos correctamente', async () => {
    mockGetAll.mockResolvedValue(mockProducts);
    const { result } = renderHook(() => useProducts());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.products).toEqual(mockProducts);
    expect(result.current.error).toBeNull();
  });

  it('maneja error de fetch', async () => {
    mockGetAll.mockRejectedValue(new Error('Network error'));
    const { result } = renderHook(() => useProducts());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).not.toBeNull();
    expect(result.current.products).toEqual([]);
  });

  it('refresh recarga los productos', async () => {
    mockGetAll.mockResolvedValue(mockProducts);
    const { result } = renderHook(() => useProducts());
    await waitFor(() => expect(result.current.loading).toBe(false));
    mockGetAll.mockResolvedValue([...mockProducts, { id: 'seg-vida', name: 'Seguro', description: 'D', logo: '', date_release: '2023-05-01', date_revision: '2024-05-01' }]);
    act(() => { result.current.refresh(); });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.products).toHaveLength(2);
  });
});
