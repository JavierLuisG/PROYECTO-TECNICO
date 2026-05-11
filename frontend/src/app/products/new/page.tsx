'use client';

import { useRouter } from 'next/navigation';
import { useProductForm } from '../../../application/hooks/useProductForm';
import { createProduct } from '../../../application/usecases/createProduct';
import { ProductForm } from '../../../presentation/components/ProductForm/ProductForm';
import styles from './page.module.css';

export default function NewProductPage() {
  const router = useRouter();

  const { values, errors, isSubmitting, disableId, handleChange, handleIdBlur, handleSubmit, handleReset } =
    useProductForm({
      onSuccess: async (formValues) => {
        await createProduct({
          id: formValues.id,
          name: formValues.name,
          description: formValues.description,
          logo: formValues.logo,
          date_release: formValues.date_release,
          date_revision: formValues.date_revision,
        });
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
            <h2 className={styles.cardTitle}>Formulario de Registro</h2>
            <button
              type="button"
              className={styles.backLink}
              onClick={() => router.push('/')}
            >
              ← Volver al listado
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
          />
        </div>
      </section>
    </main>
  );
}
