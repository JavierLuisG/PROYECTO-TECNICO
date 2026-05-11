import axios, { AxiosInstance } from 'axios';
import { CreateProductPayload, Product, UpdateProductPayload } from '../../domain/models/Product';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3002';
const PRODUCTS_PATH = '/bp/products';

const api: AxiosInstance = axios.create({ baseURL: BASE_URL });

interface ProductsResponse {
  data: Product[];
}

interface ProductResponse {
  data: Product;
}

export const productService = {
  async getAll(): Promise<Product[]> {
    const response = await api.get<ProductsResponse>(PRODUCTS_PATH);
    return response.data.data;
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

  async verifyId(id: string): Promise<boolean> {
    const response = await api.get<boolean>(`${PRODUCTS_PATH}/verification/${id}`);
    return response.data;
  },
};
