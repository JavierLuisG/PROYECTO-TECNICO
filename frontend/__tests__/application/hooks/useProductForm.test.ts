jest.mock('../../../src/infrastructure/api/productService', () => ({
  productService: {
    verifyId: jest.fn(),
  },
}));

import { renderHook, act, waitFor } from '@testing-library/react';
import { useProductForm } from '../../../src/application/hooks/useProductForm';
import { productService } from '../../../src/infrastructure/api/productService';

const mockedService = productService as jest.Mocked<typeof productService>;

const validValues = {
  id: 'abc',
  name: 'Nombre válido',
  description: 'Descripción válida del producto',
  logo: 'https://example.com/logo.png',
  date_release: '2030-01-01',
  date_revision: '2031-01-01',
};

const makeOnSuccess = () => jest.fn().mockResolvedValue(undefined);

describe('useProductForm — estado inicial', () => {
  it('arranca con valores vacíos', () => {
    const { result } = renderHook(() =>
      useProductForm({ onSuccess: makeOnSuccess() }),
    );
    expect(result.current.values.id).toBe('');
    expect(result.current.values.name).toBe('');
    expect(result.current.errors).toEqual({});
    expect(result.current.isSubmitting).toBe(false);
  });

  it('precarga initialValues cuando se proporcionan', () => {
    const { result } = renderHook(() =>
      useProductForm({ initialValues: { id: 'trj', name: 'Test' }, onSuccess: makeOnSuccess() }),
    );
    expect(result.current.values.id).toBe('trj');
    expect(result.current.values.name).toBe('Test');
  });

  it('respeta disableId=true', () => {
    const { result } = renderHook(() =>
      useProductForm({ disableId: true, onSuccess: makeOnSuccess() }),
    );
    expect(result.current.disableId).toBe(true);
  });
});

describe('useProductForm — handleChange', () => {
  it('actualiza el valor del campo cambiado', () => {
    const { result } = renderHook(() =>
      useProductForm({ onSuccess: makeOnSuccess() }),
    );
    act(() => {
      result.current.handleChange({
        target: { name: 'name', value: 'Nuevo nombre' },
      } as React.ChangeEvent<HTMLInputElement>);
    });
    expect(result.current.values.name).toBe('Nuevo nombre');
  });

  it('recalcula date_revision cuando cambia date_release', () => {
    const { result } = renderHook(() =>
      useProductForm({ onSuccess: makeOnSuccess() }),
    );
    act(() => {
      result.current.handleChange({
        target: { name: 'date_release', value: '2025-03-15' },
      } as React.ChangeEvent<HTMLInputElement>);
    });
    expect(result.current.values.date_revision).toBe('2026-03-15');
  });

  it('valida el campo al cambiar y muestra error', () => {
    const { result } = renderHook(() =>
      useProductForm({ onSuccess: makeOnSuccess() }),
    );
    act(() => {
      result.current.handleChange({
        target: { name: 'name', value: 'ab' },
      } as React.ChangeEvent<HTMLInputElement>);
    });
    expect(result.current.errors.name).toContain('Mínimo');
  });

  it('limpia el error de un campo cuando el valor es válido', () => {
    const { result } = renderHook(() =>
      useProductForm({ onSuccess: makeOnSuccess() }),
    );
    act(() => {
      result.current.handleChange({
        target: { name: 'name', value: 'ab' },
      } as React.ChangeEvent<HTMLInputElement>);
    });
    act(() => {
      result.current.handleChange({
        target: { name: 'name', value: 'Nombre suficientemente largo' },
      } as React.ChangeEvent<HTMLInputElement>);
    });
    expect(result.current.errors.name).toBeUndefined();
  });
});

describe('useProductForm — handleIdBlur', () => {
  beforeEach(() => jest.clearAllMocks());

  it('no llama verifyId si el ID tiene error de formato', async () => {
    const { result } = renderHook(() =>
      useProductForm({ onSuccess: makeOnSuccess() }),
    );
    await act(async () => {
      await result.current.handleIdBlur();
    });
    expect(mockedService.verifyId).not.toHaveBeenCalled();
    expect(result.current.errors.id).toBe('ID es requerido');
  });

  it('establece error "ID ya registrado" si verifyId retorna true', async () => {
    mockedService.verifyId.mockResolvedValue(true);
    const { result } = renderHook(() =>
      useProductForm({
        initialValues: { id: 'abc' },
        onSuccess: makeOnSuccess(),
      }),
    );
    await act(async () => {
      await result.current.handleIdBlur();
    });
    expect(result.current.errors.id).toBe('ID ya registrado');
  });

  it('limpia error de ID si verifyId retorna false', async () => {
    mockedService.verifyId.mockResolvedValue(false);
    const { result } = renderHook(() =>
      useProductForm({
        initialValues: { id: 'abc' },
        onSuccess: makeOnSuccess(),
      }),
    );
    await act(async () => {
      await result.current.handleIdBlur();
    });
    expect(result.current.errors.id).toBeUndefined();
  });

  it('no bloquea si verifyId falla (degradación graceful)', async () => {
    mockedService.verifyId.mockRejectedValue(new Error('Network'));
    const { result } = renderHook(() =>
      useProductForm({
        initialValues: { id: 'abc' },
        onSuccess: makeOnSuccess(),
      }),
    );
    await act(async () => {
      await result.current.handleIdBlur();
    });
    expect(result.current.errors.id).toBeUndefined();
  });
});

describe('useProductForm — handleSubmit', () => {
  const preventDefault = jest.fn();

  it('muestra errores sin llamar onSuccess si el formulario es inválido', async () => {
    const onSuccess = makeOnSuccess();
    const { result } = renderHook(() =>
      useProductForm({ onSuccess }),
    );
    await act(async () => {
      await result.current.handleSubmit({
        preventDefault,
      } as unknown as React.FormEvent);
    });
    expect(onSuccess).not.toHaveBeenCalled();
    expect(result.current.errors.id).toBeDefined();
  });

  it('llama onSuccess cuando el formulario es válido', async () => {
    const onSuccess = makeOnSuccess();
    const { result } = renderHook(() =>
      useProductForm({ initialValues: validValues, onSuccess }),
    );
    await act(async () => {
      await result.current.handleSubmit({
        preventDefault,
      } as unknown as React.FormEvent);
    });
    expect(onSuccess).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'abc', name: 'Nombre válido' }),
    );
  });

  it('establece isSubmitting=true durante el envío y false al terminar', async () => {
    let resolveSuccess!: () => void;
    const onSuccess = jest.fn(
      () => new Promise<void>((res) => { resolveSuccess = res; }),
    );
    const { result } = renderHook(() =>
      useProductForm({ initialValues: validValues, onSuccess }),
    );

    act(() => {
      result.current.handleSubmit({
        preventDefault,
      } as unknown as React.FormEvent);
    });

    await waitFor(() => expect(result.current.isSubmitting).toBe(true));
    act(() => resolveSuccess());
    await waitFor(() => expect(result.current.isSubmitting).toBe(false));
  });

  it('no envía si errors.id está presente', async () => {
    const onSuccess = makeOnSuccess();
    const { result } = renderHook(() =>
      useProductForm({ initialValues: validValues, onSuccess }),
    );
    act(() => {
      result.current.handleChange({
        target: { name: 'id', value: 'abc' },
      } as React.ChangeEvent<HTMLInputElement>);
    });
    // manually inject ID error
    mockedService.verifyId.mockResolvedValue(true);
    await act(async () => {
      await result.current.handleIdBlur();
    });
    await act(async () => {
      await result.current.handleSubmit({
        preventDefault,
      } as unknown as React.FormEvent);
    });
    expect(onSuccess).not.toHaveBeenCalled();
  });
});

describe('useProductForm — handleReset', () => {
  it('limpia valores y errores', () => {
    const { result } = renderHook(() =>
      useProductForm({ initialValues: validValues, onSuccess: makeOnSuccess() }),
    );
    act(() => result.current.handleReset());
    expect(result.current.values.name).toBe('');
    expect(result.current.errors).toEqual({});
  });

  it('preserva el ID cuando disableId=true', () => {
    const { result } = renderHook(() =>
      useProductForm({
        initialValues: validValues,
        disableId: true,
        onSuccess: makeOnSuccess(),
      }),
    );
    act(() => result.current.handleReset());
    expect(result.current.values.id).toBe('abc');
  });
});
