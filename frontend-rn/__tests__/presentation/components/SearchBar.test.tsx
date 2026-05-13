import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { SearchBar } from '../../../src/presentation/components/SearchBar/SearchBar';

describe('SearchBar', () => {
  it('renderiza el input de búsqueda', () => {
    const { getByPlaceholderText } = render(<SearchBar value="" onChange={jest.fn()} />);
    expect(getByPlaceholderText('Buscar...')).toBeTruthy();
  });

  it('muestra el valor actual', () => {
    const { getByDisplayValue } = render(<SearchBar value="tarjeta" onChange={jest.fn()} />);
    expect(getByDisplayValue('tarjeta')).toBeTruthy();
  });

  it('llama onChange con el texto nuevo', () => {
    const onChange = jest.fn();
    const { getByPlaceholderText } = render(<SearchBar value="" onChange={onChange} />);
    fireEvent.changeText(getByPlaceholderText('Buscar...'), 'seguro');
    expect(onChange).toHaveBeenCalledWith('seguro');
  });

  it('tiene accessibilityLabel', () => {
    const { getByLabelText } = render(<SearchBar value="" onChange={jest.fn()} />);
    expect(getByLabelText('Buscar productos')).toBeTruthy();
  });
});
