import axios, { AxiosInstance } from 'axios';
import { CreateProductPayload, Product, UpdateProductPayload } from '../../domain/models/Product';

const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:3002';
const PRODUCTS_PATH = '/bp/products';

const api: AxiosInstance = axios.create({ baseURL: BASE_URL });

interface ProductsResponse {
  data: Product[];
}

interface ProductResponse {
  data: Product;
}

function normalizeDate(value: string): string {
  return value ? value.substring(0, 10) : value;
}

function normalizeProduct(p: Product): Product {
  return {
    ...p,
    date_release: normalizeDate(p.date_release),
    date_revision: normalizeDate(p.date_revision),
  };
}

export const productService = {
  async getAll(): Promise<Product[]> {
    const response = await api.get<ProductsResponse>(PRODUCTS_PATH);
    return response.data.data.map(normalizeProduct);
  },

  async create(payload: CreateProductPayload): Promise<Product> {
    const response = await api.post<ProductResponse>(PRODUCTS_PATH, payload);
    return response.data.data;
  },

  async update(id: string, payload: UpdateProductPayload): Promise<Product> {
    const response = await api.put<ProductResponse>(`${PRODUCTS_PATH}/${id}`, payload);
    return response.data.data;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`${PRODUCTS_PATH}/${id}`);
  },

  async getById(id: string): Promise<Product> {
    const response = await api.get<Product>(`${PRODUCTS_PATH}/${id}`);
    return normalizeProduct(response.data);
  },

  async verifyId(id: string): Promise<boolean> {
    const response = await api.get<boolean>(`${PRODUCTS_PATH}/verification/${id}`);
    return response.data;
  },
};
