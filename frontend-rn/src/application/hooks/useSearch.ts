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
    const term = searchTerm.trim().toLowerCase();
    if (!term) return products;
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        p.description.toLowerCase().includes(term),
    );
  }, [products, searchTerm]);

  return { searchTerm, setSearchTerm, filteredProducts };
}
