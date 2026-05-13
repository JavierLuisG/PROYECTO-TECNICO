export interface Product {
  id: string;
  name: string;
  description: string;
  logo: string;
  date_release: string;
  date_revision: string;
}

export type CreateProductPayload = Product;

export type UpdateProductPayload = Omit<Product, 'id'>;
