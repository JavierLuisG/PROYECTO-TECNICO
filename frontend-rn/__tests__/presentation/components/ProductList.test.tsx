import React from 'react';
import { render } from '@testing-library/react-native';
import { ProductList } from '../../../src/presentation/components/ProductList/ProductList';

jest.mock('expo-router', () => ({ router: { push: jest.fn() } }));

const mockProducts = [
  { id: 'p1', name: 'Tarjetas de Crédito', description: 'Tarjeta de consumo', logo: '', date_release: '2023-02-01', date_revision: '2024-02-01' },
  { id: 'p2', name: 'Seguro de Vida', description: 'Protección personal', logo: '', date_release: '2023-05-01', date_revision: '2024-05-01' },
];

describe('ProductList — estado de carga', () => {
  it('muestra spinner y texto cuando loading es true', () => {
    const { getByText } = render(<ProductList products={[]} loading={true} error={null} />);
    expect(getByText('Cargando productos...')).toBeTruthy();
  });
});

describe('ProductList — estado de error', () => {
  it('muestra el mensaje de error', () => {
    const { getByText } = render(<ProductList products={[]} loading={false} error="Error de conexión" />);
    expect(getByText('Error de conexión')).toBeTruthy();
  });
});

describe('ProductList — lista vacía', () => {
  it('muestra mensaje cuando no hay productos', () => {
    const { getByText } = render(<ProductList products={[]} loading={false} error={null} />);
    expect(getByText('No se encontraron productos que coincidan con la búsqueda.')).toBeTruthy();
  });
});

describe('ProductList — con productos', () => {
  it('renderiza los nombres de los productos', () => {
    const { getByText } = render(<ProductList products={mockProducts} loading={false} error={null} />);
    expect(getByText('Tarjetas de Crédito')).toBeTruthy();
    expect(getByText('Seguro de Vida')).toBeTruthy();
  });
});
