import { CreateProductPayload, Product } from '../../domain/models/Product';
import { productService } from '../../infrastructure/api/productService';

export async function createProduct(payload: CreateProductPayload): Promise<Product> {
  return productService.create(payload);
}
