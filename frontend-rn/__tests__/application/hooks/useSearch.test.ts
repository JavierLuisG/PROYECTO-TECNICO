import { renderHook, act } from '@testing-library/react-native';
import { useSearch } from '../../../src/application/hooks/useSearch';

const products = [
  { id: 'p1', name: 'Tarjetas de Crédito', description: 'Tarjeta de consumo', logo: '', date_release: '2023-01-01', date_revision: '2024-01-01' },
  { id: 'p2', name: 'Seguro de Vida', description: 'Protección personal', logo: '', date_release: '2023-01-01', date_revision: '2024-01-01' },
];

describe('useSearch', () => {
  it('devuelve todos los productos cuando el término está vacío', () => {
    const { result } = renderHook(() => useSearch(products));
    expect(result.current.filteredProducts).toHaveLength(2);
  });

  it('filtra por nombre (case-insensitive)', () => {
    const { result } = renderHook(() => useSearch(products));
    act(() => result.current.setSearchTerm('tarjeta'));
    expect(result.current.filteredProducts).toHaveLength(1);
    expect(result.current.filteredProducts[0].id).toBe('p1');
  });

  it('filtra por descripción', () => {
    const { result } = renderHook(() => useSearch(products));
    act(() => result.current.setSearchTerm('protección'));
    expect(result.current.filteredProducts).toHaveLength(1);
    expect(result.current.filteredProducts[0].id).toBe('p2');
  });

  it('devuelve vacío si no hay coincidencias', () => {
    const { result } = renderHook(() => useSearch(products));
    act(() => result.current.setSearchTerm('xyzabc'));
    expect(result.current.filteredProducts).toHaveLength(0);
  });

  it('limpiar término restaura el listado completo', () => {
    const { result } = renderHook(() => useSearch(products));
    act(() => result.current.setSearchTerm('tarjeta'));
    act(() => result.current.setSearchTerm(''));
    expect(result.current.filteredProducts).toHaveLength(2);
  });
});
