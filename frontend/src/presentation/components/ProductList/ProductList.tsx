import { Product } from '../../../domain/models/Product';
import { ProductCard } from '../ProductCard/ProductCard';
import styles from './ProductList.module.css';

interface ProductListProps {
  products: Product[];
  loading: boolean;
  error: string | null;
}

export function ProductList({ products, loading, error }: ProductListProps) {
  if (loading) {
    return (
      <div className={styles.state} role="status" aria-label="Cargando productos">
        <div className={styles.spinner} />
        <p>Cargando productos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.error} role="alert">
        <p>{error}</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className={styles.state}>
        <p className={styles.empty}>No se encontraron productos que coincidan con la búsqueda.</p>
      </div>
    );
  }

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr className={styles.headerRow}>
            <th className={styles.th}>Logo</th>
            <th className={styles.th}>Nombre</th>
            <th className={styles.th}>Descripción</th>
            <th className={styles.th}>Fecha Liberación</th>
            <th className={styles.th}>Fecha Revisión</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
