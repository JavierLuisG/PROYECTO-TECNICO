import { productService } from '../../infrastructure/api/productService';

export async function deleteProduct(id: string): Promise<void> {
  return productService.remove(id);
}
