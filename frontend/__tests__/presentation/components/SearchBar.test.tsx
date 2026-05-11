import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { SearchBar } from '../../../src/presentation/components/SearchBar/SearchBar';

describe('SearchBar', () => {
  it('renders with default placeholder', () => {
    render(<SearchBar value="" onChange={() => {}} />);
    expect(
      screen.getByPlaceholderText('Buscar por nombre o descripción...'),
    ).toBeInTheDocument();
  });

  it('renders with a custom placeholder', () => {
    render(<SearchBar value="" onChange={() => {}} placeholder="Filtrar..." />);
    expect(screen.getByPlaceholderText('Filtrar...')).toBeInTheDocument();
  });

  it('displays the current value', () => {
    render(<SearchBar value="Tarjeta" onChange={() => {}} />);
    expect(screen.getByDisplayValue('Tarjeta')).toBeInTheDocument();
  });

  it('calls onChange with the typed value', () => {
    const handleChange = jest.fn();
    render(<SearchBar value="" onChange={handleChange} />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Seguro' } });
    expect(handleChange).toHaveBeenCalledWith('Seguro');
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it('has an accessible aria-label', () => {
    render(<SearchBar value="" onChange={() => {}} />);
    expect(screen.getByLabelText('Buscar productos')).toBeInTheDocument();
  });
});
