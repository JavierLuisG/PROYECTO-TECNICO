import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProductForm } from '../../../src/presentation/components/ProductForm/ProductForm';
import {
  ProductFormErrors,
  ProductFormValues,
} from '../../../src/application/hooks/useProductForm';

const emptyValues: ProductFormValues = {
  id: '',
  name: '',
  description: '',
  logo: '',
  date_release: '',
  date_revision: '',
};

const filledValues: ProductFormValues = {
  id: 'trj-crd',
  name: 'Tarjetas de Crédito',
  description: 'Tarjeta de consumo bajo la modalidad de crédito',
  logo: 'https://example.com/logo.png',
  date_release: '2023-02-01',
  date_revision: '2024-02-01',
};

const noopAsync = jest.fn().mockResolvedValue(undefined);

const defaultProps = {
  values: emptyValues,
  errors: {} as ProductFormErrors,
  isSubmitting: false,
  disableId: false,
  onChange: jest.fn(),
  onIdBlur: noopAsync,
  onSubmit: noopAsync,
  onReset: jest.fn(),
};

describe('ProductForm — renderizado', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renderiza los 6 campos del formulario', () => {
    render(<ProductForm {...defaultProps} />);
    expect(screen.getByLabelText('ID')).toBeInTheDocument();
    expect(screen.getByLabelText('Nombre')).toBeInTheDocument();
    expect(screen.getByLabelText('Descripción')).toBeInTheDocument();
    expect(screen.getByLabelText('Logo (URL)')).toBeInTheDocument();
    expect(screen.getByLabelText('Fecha de Liberación')).toBeInTheDocument();
    expect(
      screen.getByLabelText('Fecha de revisión (calculada automáticamente)'),
    ).toBeInTheDocument();
  });

  it('muestra el botón "Agregar" por defecto', () => {
    render(<ProductForm {...defaultProps} />);
    expect(screen.getByRole('button', { name: 'Agregar' })).toBeInTheDocument();
  });

  it('muestra submitLabel personalizado ("Actualizar")', () => {
    render(<ProductForm {...defaultProps} submitLabel="Actualizar" />);
    expect(screen.getByRole('button', { name: 'Actualizar' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Agregar' })).not.toBeInTheDocument();
  });

  it('muestra el botón "Reiniciar"', () => {
    render(<ProductForm {...defaultProps} />);
    expect(screen.getByRole('button', { name: 'Reiniciar' })).toBeInTheDocument();
  });

  it('pre-carga los campos con los valores proporcionados', () => {
    render(<ProductForm {...defaultProps} values={filledValues} />);
    expect(screen.getByLabelText('ID')).toHaveValue('trj-crd');
    expect(screen.getByLabelText('Nombre')).toHaveValue('Tarjetas de Crédito');
    expect(screen.getByLabelText('Logo (URL)')).toHaveValue('https://example.com/logo.png');
  });
});

describe('ProductForm — prop disableId', () => {
  it('deshabilita el campo ID cuando disableId es true', () => {
    render(<ProductForm {...defaultProps} values={filledValues} disableId={true} />);
    expect(screen.getByLabelText('ID')).toBeDisabled();
  });

  it('mantiene el campo ID habilitado cuando disableId es false', () => {
    render(<ProductForm {...defaultProps} />);
    expect(screen.getByLabelText('ID')).not.toBeDisabled();
  });
});

describe('ProductForm — mensajes de error', () => {
  it('muestra errores individuales bajo cada campo', () => {
    const errors: ProductFormErrors = {
      id: 'ID es requerido',
      name: 'Nombre es requerido',
      description: 'Descripción es requerida',
      logo: 'Logo es requerido',
      date_release: 'Fecha de liberación es requerida',
    };
    render(<ProductForm {...defaultProps} errors={errors} />);
    expect(screen.getByText('ID es requerido')).toBeInTheDocument();
    expect(screen.getByText('Nombre es requerido')).toBeInTheDocument();
    expect(screen.getByText('Descripción es requerida')).toBeInTheDocument();
    expect(screen.getByText('Logo es requerido')).toBeInTheDocument();
    expect(screen.getByText('Fecha de liberación es requerida')).toBeInTheDocument();
  });

  it('muestra el error de submit con role alert', () => {
    const errors: ProductFormErrors = { submit: 'No se pudo crear el producto.' };
    render(<ProductForm {...defaultProps} errors={errors} />);
    expect(screen.getByRole('alert')).toHaveTextContent('No se pudo crear el producto.');
  });

  it('no muestra el bloque de error submit cuando no hay error', () => {
    render(<ProductForm {...defaultProps} />);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});

describe('ProductForm — interacciones', () => {
  it('llama a onReset al hacer clic en "Reiniciar"', () => {
    const onReset = jest.fn();
    render(<ProductForm {...defaultProps} onReset={onReset} />);
    fireEvent.click(screen.getByRole('button', { name: 'Reiniciar' }));
    expect(onReset).toHaveBeenCalledTimes(1);
  });

  it('llama a onSubmit al enviar el formulario', () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    const { container } = render(<ProductForm {...defaultProps} onSubmit={onSubmit} />);
    fireEvent.submit(container.querySelector('form')!);
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });
});

describe('ProductForm — estado isSubmitting', () => {
  it('muestra "Guardando..." cuando isSubmitting es true', () => {
    render(<ProductForm {...defaultProps} isSubmitting={true} />);
    expect(screen.getByRole('button', { name: 'Guardando...' })).toBeInTheDocument();
  });

  it('deshabilita ambos botones mientras isSubmitting es true', () => {
    render(<ProductForm {...defaultProps} isSubmitting={true} />);
    expect(screen.getByRole('button', { name: 'Guardando...' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Reiniciar' })).toBeDisabled();
  });

  it('habilita los botones cuando isSubmitting es false', () => {
    render(<ProductForm {...defaultProps} isSubmitting={false} />);
    expect(screen.getByRole('button', { name: 'Agregar' })).not.toBeDisabled();
    expect(screen.getByRole('button', { name: 'Reiniciar' })).not.toBeDisabled();
  });
});
