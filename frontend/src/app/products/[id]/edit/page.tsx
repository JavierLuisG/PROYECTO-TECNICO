'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { productService } from '../../../../infrastructure/api/productService';
import { updateProduct } from '../../../../application/usecases/updateProduct';
import { useProductForm } from '../../../../application/hooks/useProductForm';
import { ProductForm } from '../../../../presentation/components/ProductForm/ProductForm';
import { Product } from '../../../../domain/models/Product';
import styles from './page.module.css';

export default function EditProductPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const productId = params.id;

  const [product, setProduct] = useState<Product | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    productService
      .getById(productId)
      .then(setProduct)
      .catch(() => setLoadError('Producto no encontrado.'))
      .finally(() => setLoading(false));
  }, [productId]);

  if (loading) {
    return (
      <main className={styles.main}>
        <header className={styles.header}>
          <h1 className={styles.title}>Banco - Productos Financieros</h1>
        </header>
        <section className={styles.content}>
          <p>Cargando producto...</p>
        </section>
      </main>
    );
  }

  if (loadError || !product) {
    return (
      <main className={styles.main}>
        <header className={styles.header}>
          <h1 className={styles.title}>Banco - Productos Financieros</h1>
        </header>
        <section className={styles.content}>
          <div className={styles.card}>
            <p className={styles.notFoundMsg}>{loadError ?? 'Producto no encontrado.'}</p>
            <button className={styles.backLink} onClick={() => router.push('/')}>
              ← Volver al listado
            </button>
          </div>
        </section>
      </main>
    );
  }

  return <EditForm productId={productId} product={product} />;
}

function EditForm({ productId, product }: { productId: string; product: Product }) {
  const router = useRouter();

  const { values, errors, isSubmitting, disableId, handleChange, handleIdBlur, handleSubmit, handleReset } =
    useProductForm({
      initialValues: product,
      disableId: true,
      onSuccess: async (values) => {
        await updateProduct(productId, values);
        router.push('/');
      },
    });

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <h1 className={styles.title}>Banco - Productos Financieros</h1>
      </header>
      <section className={styles.content}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Formulario de Edición</h2>
            <button className={styles.backLink} onClick={() => router.push('/')}>
              ← Volver
            </button>
          </div>
          <ProductForm
            values={values}
            errors={errors}
            isSubmitting={isSubmitting}
            disableId={disableId}
            onChange={handleChange}
            onIdBlur={handleIdBlur}
            onSubmit={handleSubmit}
            onReset={handleReset}
            submitLabel="Actualizar"
          />
        </div>
      </section>
    </main>
  );
}
