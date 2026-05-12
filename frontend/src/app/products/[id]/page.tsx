'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { productService } from '../../../infrastructure/api/productService';
import { deleteProduct } from '../../../application/usecases/deleteProduct';
import { ConfirmModal } from '../../../presentation/components/ConfirmModal/ConfirmModal';
import { Product } from '../../../domain/models/Product';
import styles from './page.module.css';

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const productId = params.id;

  const [product, setProduct] = useState<Product | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    productService
      .getById(productId)
      .then(setProduct)
      .catch(() => setLoadError('Producto no encontrado.'))
      .finally(() => setLoading(false));
  }, [productId]);

  const handleConfirmDelete = async () => {
    if (!product) return;
    setIsDeleting(true);
    try {
      await deleteProduct(product.id);
      router.push('/');
    } finally {
      setIsDeleting(false);
    }
  };

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

  return (
    <>
      <main className={styles.main}>
        <header className={styles.header}>
          <h1 className={styles.title}>Banco - Productos Financieros</h1>
        </header>

        <section className={styles.content}>
          <div className={styles.card}>
            <div className={styles.cardTop}>
              <button className={styles.backLink} onClick={() => router.push('/')}>
                ← Volver
              </button>
            </div>

            <h2 className={styles.productId}>ID: {product.id}</h2>
            <p className={styles.subtitle}>Información extra</p>

            <dl className={styles.fields}>
              <div className={styles.fieldRow}>
                <dt className={styles.fieldLabel}>Nombre</dt>
                <dd className={styles.fieldValue}>{product.name}</dd>
              </div>
              <div className={styles.fieldRow}>
                <dt className={styles.fieldLabel}>Descripción</dt>
                <dd className={styles.fieldValue}>{product.description}</dd>
              </div>
              <div className={styles.fieldRow}>
                <dt className={styles.fieldLabel}>Logo</dt>
                <dd className={styles.fieldValue}>
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
                </dd>
              </div>
              <div className={styles.fieldRow}>
                <dt className={styles.fieldLabel}>Fecha liberación</dt>
                <dd className={styles.fieldValue}>{product.date_release}</dd>
              </div>
              <div className={styles.fieldRow}>
                <dt className={styles.fieldLabel}>Fecha revisión</dt>
                <dd className={styles.fieldValue}>{product.date_revision}</dd>
              </div>
            </dl>

            <div className={styles.actions}>
              <button
                className={styles.btnEdit}
                onClick={() => router.push(`/products/${product.id}/edit`)}
              >
                Editar
              </button>
              <button
                className={styles.btnDelete}
                onClick={() => setShowModal(true)}
              >
                Eliminar
              </button>
            </div>
          </div>
        </section>
      </main>

      <ConfirmModal
        isOpen={showModal}
        productName={product.name}
        isDeleting={isDeleting}
        onCancel={() => setShowModal(false)}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}
