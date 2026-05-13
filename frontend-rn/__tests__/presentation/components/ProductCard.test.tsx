import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ProductCard } from '../../../src/presentation/components/ProductCard/ProductCard';

const mockPush = jest.fn();
jest.mock('expo-router', () => ({ router: { push: jest.fn() } }));

import { router } from 'expo-router';
const mockRouterPush = router.push as jest.Mock;

const product = {
  id: 'trj-crd',
  name: 'Tarjetas de Crédito',
  description: 'Tarjeta de consumo',
  logo: 'https://example.com/logo.png',
  date_release: '2023-02-01',
  date_revision: '2024-02-01',
};

beforeEach(() => jest.clearAllMocks());

describe('ProductCard', () => {
  it('renderiza el nombre del producto', () => {
    const { getByText } = render(<ProductCard product={product} />);
    expect(getByText('Tarjetas de Crédito')).toBeTruthy();
  });

  it('renderiza el ID del producto', () => {
    const { getByText } = render(<ProductCard product={product} />);
    expect(getByText('ID: trj-crd')).toBeTruthy();
  });

  it('no muestra "—" cuando hay logo', () => {
    const { queryByText } = render(<ProductCard product={product} />);
    expect(queryByText('—')).toBeNull();
  });

  it('muestra "—" cuando el logo está vacío', () => {
    const { getByText } = render(<ProductCard product={{ ...product, logo: '' }} />);
    expect(getByText('—')).toBeTruthy();
  });

  it('navega al detalle al presionar la fila', () => {
    const { getByLabelText } = render(<ProductCard product={product} />);
    fireEvent.press(getByLabelText('Ver detalle de Tarjetas de Crédito'));
    expect(mockRouterPush).toHaveBeenCalledWith('/products/trj-crd');
  });
});
