import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useProductForm } from '../../../src/application/hooks/useProductForm';
import { productService } from '../../../src/infrastructure/api/productService';

jest.mock('../../../src/infrastructure/api/productService');
const mockVerifyId = productService.verifyId as jest.Mock;

beforeEach(() => jest.clearAllMocks());

describe('useProductForm — validaciones', () => {
  it('handleChange actualiza el valor del campo', () => {
    const { result } = renderHook(() =>
      useProductForm({ onSuccess: jest.fn() }),
    );
    act(() => result.current.handleChange('name', 'Mi Producto'));
    expect(result.current.values.name).toBe('Mi Producto');
  });

  it('handleChange calcula date_revision al cambiar date_release', () => {
    const { result } = renderHook(() =>
      useProductForm({ onSuccess: jest.fn() }),
    );
    act(() => result.current.handleChange('date_release', '2026-05-12'));
    expect(result.current.values.date_revision).toBe('2027-05-12');
  });

  it('muestra error si name tiene menos de 6 caracteres', async () => {
    const onSuccess = jest.fn();
    const { result } = renderHook(() => useProductForm({ onSuccess }));
    act(() => result.current.handleChange('name', 'abc'));
    await act(async () => { await result.current.handleSubmit(); });
    expect(result.current.errors.name).toBeTruthy();
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it('muestra error si id está vacío', async () => {
    const onSuccess = jest.fn();
    const { result } = renderHook(() => useProductForm({ onSuccess }));
    await act(async () => { await result.current.handleSubmit(); });
    expect(result.current.errors.id).toBeTruthy();
  });

  it('handleReset limpia todos los campos', () => {
    const { result } = renderHook(() =>
      useProductForm({ onSuccess: jest.fn() }),
    );
    act(() => result.current.handleChange('name', 'Test'));
    act(() => result.current.handleReset());
    expect(result.current.values.name).toBe('');
  });
});

describe('useProductForm — handleIdBlur', () => {
  it('marca error si el ID ya existe', async () => {
    mockVerifyId.mockResolvedValue(true);
    const { result } = renderHook(() =>
      useProductForm({ onSuccess: jest.fn() }),
    );
    act(() => result.current.handleChange('id', 'trj-crd'));
    await act(async () => { await result.current.handleIdBlur(); });
    expect(result.current.errors.id).toBe('ID ya registrado');
  });

  it('limpia el error si el ID no existe', async () => {
    mockVerifyId.mockResolvedValue(false);
    const { result } = renderHook(() =>
      useProductForm({ onSuccess: jest.fn() }),
    );
    act(() => result.current.handleChange('id', 'nuevo-id'));
    await act(async () => { await result.current.handleIdBlur(); });
    expect(result.current.errors.id).toBeUndefined();
  });
});

describe('useProductForm — submit exitoso', () => {
  it('llama onSuccess con valores válidos', async () => {
    mockVerifyId.mockResolvedValue(false);
    const onSuccess = jest.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() => useProductForm({ onSuccess }));

    // Cada handleChange en act() separado para que el state se actualice entre llamadas
    act(() => result.current.handleChange('id', 'mi-prod'));
    act(() => result.current.handleChange('name', 'Producto Test'));
    act(() => result.current.handleChange('description', 'Descripción de prueba con suficiente texto'));
    act(() => result.current.handleChange('logo', 'https://example.com/logo.png'));
    act(() => result.current.handleChange('date_release', '2027-01-01'));

    await act(async () => { await result.current.handleSubmit(); });
    expect(onSuccess).toHaveBeenCalledTimes(1);
  });
});
