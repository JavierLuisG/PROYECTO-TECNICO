'use client';

import { useEffect, useState } from 'react';
import { Product } from '../../domain/models/Product';
import { productService } from '../../infrastructure/api/productService';

interface UseProductsResult {
  products: Product[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useProducts(): UseProductsResult {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await productService.getAll();
      setProducts(data);
    } catch {
      setError('No se pudo cargar la lista de productos. Verifica que el servicio esté disponible.');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return { products, loading, error, refresh: fetchProducts };
}
