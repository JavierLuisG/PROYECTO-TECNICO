jest.mock('axios', () => {
  const mockInstance = {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  };
  return {
    __esModule: true,
    default: {
      create: jest.fn(() => mockInstance),
    },
  };
});

import axios from 'axios';
import { productService } from '../../../src/infrastructure/api/productService';

type MockAxiosInstance = {
  get: jest.Mock;
  post: jest.Mock;
  put: jest.Mock;
  delete: jest.Mock;
};

const api = (axios.create as jest.Mock).mock.results[0].value as MockAxiosInstance;

const mockProduct = {
  id: 'trj-crd',
  name: 'Tarjetas de Crédito',
  description: 'Tarjeta de consumo bajo la modalidad de crédito',
  logo: 'https://example.com/logo.png',
  date_release: '2023-02-01',
  date_revision: '2024-02-01',
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('productService.getAll', () => {
  it('returns products array on success', async () => {
    api.get.mockResolvedValue({ data: { data: [mockProduct] } });
    const result = await productService.getAll();
    expect(result).toEqual([mockProduct]);
    expect(api.get).toHaveBeenCalledWith('/bp/products');
  });

  it('throws on API error', async () => {
    api.get.mockRejectedValue(new Error('Network error'));
    await expect(productService.getAll()).rejects.toThrow('Network error');
  });
});

describe('productService.getById', () => {
  it('returns a single product', async () => {
    api.get.mockResolvedValue({ data: mockProduct });
    const result = await productService.getById('trj-crd');
    expect(result).toEqual(mockProduct);
    expect(api.get).toHaveBeenCalledWith('/bp/products/trj-crd');
  });

  it('throws on 404', async () => {
    api.get.mockRejectedValue({ response: { status: 404 } });
    await expect(productService.getById('no-existe')).rejects.toBeDefined();
  });
});

describe('productService.create', () => {
  it('sends POST with payload and returns created product', async () => {
    api.post.mockResolvedValue({ data: { data: mockProduct } });
    const result = await productService.create(mockProduct);
    expect(result).toEqual(mockProduct);
    expect(api.post).toHaveBeenCalledWith('/bp/products', mockProduct);
  });
});

describe('productService.update', () => {
  it('sends PUT to correct URL with payload', async () => {
    const { id, ...payload } = mockProduct;
    api.put.mockResolvedValue({ data: { data: mockProduct } });
    const result = await productService.update('trj-crd', payload);
    expect(result).toEqual(mockProduct);
    expect(api.put).toHaveBeenCalledWith('/bp/products/trj-crd', payload);
  });
});

describe('productService.remove', () => {
  it('calls DELETE on correct URL', async () => {
    api.delete.mockResolvedValue({});
    await productService.remove('trj-crd');
    expect(api.delete).toHaveBeenCalledWith('/bp/products/trj-crd');
  });

  it('resolves without returning a value', async () => {
    api.delete.mockResolvedValue({});
    const result = await productService.remove('trj-crd');
    expect(result).toBeUndefined();
  });
});

describe('productService.verifyId', () => {
  it('returns true when ID exists', async () => {
    api.get.mockResolvedValue({ data: true });
    const result = await productService.verifyId('trj-crd');
    expect(result).toBe(true);
    expect(api.get).toHaveBeenCalledWith('/bp/products/verification/trj-crd');
  });

  it('returns false when ID does not exist', async () => {
    api.get.mockResolvedValue({ data: false });
    const result = await productService.verifyId('new-id');
    expect(result).toBe(false);
  });
});
