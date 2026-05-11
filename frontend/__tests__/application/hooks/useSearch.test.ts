import { renderHook, act } from '@testing-library/react';
import { useSearch } from '../../../src/application/hooks/useSearch';

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
    description: 'Protección de vida para el titular y su familia',
    logo: 'https://example.com/logo2.png',
    date_release: '2023-05-15',
    date_revision: '2024-05-15',
  },
  {
    id: 'ahorro-plus',
    name: 'Cuenta de Ahorros Plus',
    description: 'Cuenta de ahorros con rendimientos competitivos',
    logo: 'https://example.com/logo3.png',
    date_release: '2023-01-10',
    date_revision: '2024-01-10',
  },
];

describe('useSearch', () => {
  it('devuelve todos los productos cuando searchTerm está vacío', () => {
    const { result } = renderHook(() => useSearch(mockProducts));
    expect(result.current.filteredProducts).toEqual(mockProducts);
    expect(result.current.searchTerm).toBe('');
  });

  it('devuelve todos los productos cuando searchTerm es solo espacios', () => {
    const { result } = renderHook(() => useSearch(mockProducts));
    act(() => result.current.setSearchTerm('   '));
    expect(result.current.filteredProducts).toEqual(mockProducts);
  });

  it('filtra productos por nombre (case-insensitive)', () => {
    const { result } = renderHook(() => useSearch(mockProducts));
    act(() => result.current.setSearchTerm('tarjeta'));
    expect(result.current.filteredProducts).toHaveLength(1);
    expect(result.current.filteredProducts[0].id).toBe('trj-crd');
  });

  it('filtra productos por descripción', () => {
    const { result } = renderHook(() => useSearch(mockProducts));
    act(() => result.current.setSearchTerm('protección'));
    expect(result.current.filteredProducts).toHaveLength(1);
    expect(result.current.filteredProducts[0].id).toBe('seg-vida');
  });

  it('devuelve lista vacía cuando no hay coincidencias', () => {
    const { result } = renderHook(() => useSearch(mockProducts));
    act(() => result.current.setSearchTerm('xyznoexiste'));
    expect(result.current.filteredProducts).toHaveLength(0);
  });

  it('actualiza searchTerm correctamente', () => {
    const { result } = renderHook(() => useSearch(mockProducts));
    act(() => result.current.setSearchTerm('Seguro'));
    expect(result.current.searchTerm).toBe('Seguro');
  });

  it('expone función setSearchTerm', () => {
    const { result } = renderHook(() => useSearch([]));
    expect(typeof result.current.setSearchTerm).toBe('function');
  });
});
