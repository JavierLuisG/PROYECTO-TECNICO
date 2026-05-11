'use client';

import { useProducts } from '../application/hooks/useProducts';
import { useSearch } from '../application/hooks/useSearch';
import { ProductList } from '../presentation/components/ProductList/ProductList';
import { RecordCount } from '../presentation/components/RecordCount/RecordCount';
import { SearchBar } from '../presentation/components/SearchBar/SearchBar';
import styles from './page.module.css';

export default function HomePage() {
  const { products, loading, error } = useProducts();
  const { searchTerm, setSearchTerm, filteredProducts } = useSearch(products);

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <h1 className={styles.title}>Banco - Productos Financieros</h1>
      </header>

      <section className={styles.content}>
        <div className={styles.toolbar}>
          <SearchBar value={searchTerm} onChange={setSearchTerm} />
        </div>

        <RecordCount count={filteredProducts.length} />

        <ProductList
          products={filteredProducts}
          loading={loading}
          error={error}
        />
      </section>
    </main>
  );
}
