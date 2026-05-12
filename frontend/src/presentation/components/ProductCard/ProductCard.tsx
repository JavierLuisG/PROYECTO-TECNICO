import Link from 'next/link';
import { Product } from '../../../domain/models/Product';
import styles from './ProductCard.module.css';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <tr className={styles.row}>
      <td className={styles.cell}>
        {product.logo ? (
          <img
            src={product.logo}
            alt={`Logo ${product.name}`}
            className={styles.logo}
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        ) : (
          <span className={styles.noLogo}>—</span>
        )}
      </td>
      <td className={styles.cell}>{product.name}</td>
      <td className={styles.cell}>{product.description}</td>
      <td className={styles.cell}>{product.date_release}</td>
      <td className={styles.cell}>{product.date_revision}</td>
      <td className={styles.cell}>
        <Link href={`/products/${product.id}`} className={styles.btnNav} aria-label={`Ver detalle de ${product.name}`}>
          &gt;
        </Link>
      </td>
    </tr>
  );
}
