import { Product, UpdateProductPayload } from '../../domain/models/Product';
import { productService } from '../../infrastructure/api/productService';
import { ProductFormValues } from '../hooks/useProductForm';

export async function updateProduct(id: string, values: ProductFormValues): Promise<Product> {
  const payload: UpdateProductPayload = {
    name: values.name,
    description: values.description,
    logo: values.logo,
    date_release: values.date_release,
    date_revision: values.date_revision,
  };
  return productService.update(id, payload);
}
