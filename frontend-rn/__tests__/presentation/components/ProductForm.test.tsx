import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ProductForm } from '../../../src/presentation/components/ProductForm/ProductForm';

const baseValues = {
  id: 'trj-crd',
  name: 'Tarjetas de Crédito',
  description: 'Tarjeta de consumo',
  logo: 'https://example.com/logo.png',
  date_release: '2027-01-01',
  date_revision: '2028-01-01',
};

const baseProps = {
  values: baseValues,
  errors: {},
  isSubmitting: false,
  disableId: false,
  onChange: jest.fn(),
  onIdBlur: jest.fn(),
  onSubmit: jest.fn(),
  onReset: jest.fn(),
};

beforeEach(() => jest.clearAllMocks());

describe('ProductForm', () => {
  it('renderiza los 6 campos', () => {
    const { getByLabelText } = render(<ProductForm {...baseProps} />);
    expect(getByLabelText('ID del producto')).toBeTruthy();
    expect(getByLabelText('Nombre del producto')).toBeTruthy();
    expect(getByLabelText('Descripción del producto')).toBeTruthy();
    expect(getByLabelText('URL del logo')).toBeTruthy();
    expect(getByLabelText('Fecha de liberación')).toBeTruthy();
    expect(getByLabelText('Fecha de revisión (calculada automáticamente)')).toBeTruthy();
  });

  it('muestra el submitLabel personalizado', () => {
    const { getByLabelText } = render(<ProductForm {...baseProps} submitLabel="Actualizar" />);
    expect(getByLabelText('Actualizar')).toBeTruthy();
  });

  it('llama onSubmit al presionar el botón de submit', () => {
    const { getByLabelText } = render(<ProductForm {...baseProps} />);
    fireEvent.press(getByLabelText('Agregar'));
    expect(baseProps.onSubmit).toHaveBeenCalledTimes(1);
  });

  it('llama onReset al presionar Reiniciar', () => {
    const { getByLabelText } = render(<ProductForm {...baseProps} />);
    fireEvent.press(getByLabelText('Reiniciar formulario'));
    expect(baseProps.onReset).toHaveBeenCalledTimes(1);
  });

  it('muestra errores de validación', () => {
    const { getByText } = render(
      <ProductForm {...baseProps} errors={{ name: 'Nombre es requerido' }} />,
    );
    expect(getByText('Nombre es requerido')).toBeTruthy();
  });

  it('el campo ID está deshabilitado cuando disableId es true', () => {
    const { getByLabelText } = render(<ProductForm {...baseProps} disableId={true} />);
    const idInput = getByLabelText('ID del producto');
    expect(idInput.props.editable).toBe(false);
  });

  it('llama onChange al escribir en el campo nombre', () => {
    const { getByLabelText } = render(<ProductForm {...baseProps} />);
    fireEvent.changeText(getByLabelText('Nombre del producto'), 'Nuevo nombre');
    expect(baseProps.onChange).toHaveBeenCalledWith('name', 'Nuevo nombre');
  });

  it('muestra el error de submit', () => {
    const { getByText } = render(
      <ProductForm {...baseProps} errors={{ submit: 'No se pudo guardar el producto.' }} />,
    );
    expect(getByText('No se pudo guardar el producto.')).toBeTruthy();
  });
});
