'use client';

import { useMemo, useState } from 'react';
import { Product } from '../../domain/models/Product';

interface UseSearchResult {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filteredProducts: Product[];
}

export function useSearch(products: Product[]): UseSearchResult {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProducts = useMemo(() => {
    if (!searchTerm.trim()) return products;
    const lower = searchTerm.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(lower) ||
        p.description.toLowerCase().includes(lower)
    );
  }, [products, searchTerm]);

  return { searchTerm, setSearchTerm, filteredProducts };
}
