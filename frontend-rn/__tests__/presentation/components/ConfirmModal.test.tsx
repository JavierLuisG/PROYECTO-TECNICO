import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ConfirmModal } from '../../../src/presentation/components/ConfirmModal/ConfirmModal';

const baseProps = {
  isOpen: true,
  productName: 'Tarjetas de Crédito',
  isDeleting: false,
  onCancel: jest.fn(),
  onConfirm: jest.fn(),
};

beforeEach(() => jest.clearAllMocks());

describe('ConfirmModal', () => {
  it('no renderiza nada cuando isOpen es false', () => {
    const { queryByText } = render(<ConfirmModal {...baseProps} isOpen={false} />);
    expect(queryByText('Cancelar')).toBeNull();
  });

  it('renderiza el nombre del producto en el mensaje', () => {
    const { getByText } = render(<ConfirmModal {...baseProps} />);
    expect(getByText('Tarjetas de Crédito')).toBeTruthy();
  });

  it('muestra los botones Cancelar y Eliminar', () => {
    const { getByLabelText } = render(<ConfirmModal {...baseProps} />);
    expect(getByLabelText('Cancelar')).toBeTruthy();
    expect(getByLabelText('Eliminar')).toBeTruthy();
  });

  it('llama onCancel al presionar Cancelar', () => {
    const { getByLabelText } = render(<ConfirmModal {...baseProps} />);
    fireEvent.press(getByLabelText('Cancelar'));
    expect(baseProps.onCancel).toHaveBeenCalledTimes(1);
  });

  it('llama onConfirm al presionar Eliminar', () => {
    const { getByLabelText } = render(<ConfirmModal {...baseProps} />);
    fireEvent.press(getByLabelText('Eliminar'));
    expect(baseProps.onConfirm).toHaveBeenCalledTimes(1);
  });

  it('muestra "Eliminando..." cuando isDeleting es true', () => {
    const { getByText } = render(<ConfirmModal {...baseProps} isDeleting={true} />);
    expect(getByText('Eliminando...')).toBeTruthy();
  });
});
