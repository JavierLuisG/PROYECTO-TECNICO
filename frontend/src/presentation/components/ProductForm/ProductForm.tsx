'use client';

import { ProductFormErrors, ProductFormValues } from '../../../application/hooks/useProductForm';
import styles from './ProductForm.module.css';

interface ProductFormProps {
  values: ProductFormValues;
  errors: ProductFormErrors;
  isSubmitting: boolean;
  disableId: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onIdBlur: () => Promise<void>;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onReset: () => void;
}

export function ProductForm({
  values,
  errors,
  isSubmitting,
  disableId,
  onChange,
  onIdBlur,
  onSubmit,
  onReset,
}: ProductFormProps) {
  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate>
      {errors.submit && (
        <div className={styles.submitError} role="alert">
          {errors.submit}
        </div>
      )}

      <div className={styles.field}>
        <label className={styles.label} htmlFor="id">ID</label>
        <input
          id="id"
          name="id"
          type="text"
          className={`${styles.input} ${errors.id ? styles.inputError : ''}`}
          value={values.id}
          onChange={onChange}
          onBlur={!disableId ? onIdBlur : undefined}
          disabled={disableId}
          maxLength={10}
          aria-describedby="id-error"
        />
        {errors.id && <span id="id-error" className={styles.errorMsg}>{errors.id}</span>}
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="name">Nombre</label>
        <input
          id="name"
          name="name"
          type="text"
          className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
          value={values.name}
          onChange={onChange}
          maxLength={100}
          aria-describedby="name-error"
        />
        {errors.name && <span id="name-error" className={styles.errorMsg}>{errors.name}</span>}
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="description">Descripción</label>
        <textarea
          id="description"
          name="description"
          className={`${styles.textarea} ${errors.description ? styles.inputError : ''}`}
          value={values.description}
          onChange={onChange}
          maxLength={200}
          rows={3}
          aria-describedby="description-error"
        />
        {errors.description && (
          <span id="description-error" className={styles.errorMsg}>{errors.description}</span>
        )}
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="logo">Logo (URL)</label>
        <input
          id="logo"
          name="logo"
          type="text"
          className={`${styles.input} ${errors.logo ? styles.inputError : ''}`}
          value={values.logo}
          onChange={onChange}
          aria-describedby="logo-error"
        />
        {errors.logo && <span id="logo-error" className={styles.errorMsg}>{errors.logo}</span>}
      </div>

      <div className={styles.row}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="date_release">Fecha de Liberación</label>
          <input
            id="date_release"
            name="date_release"
            type="date"
            className={`${styles.input} ${errors.date_release ? styles.inputError : ''}`}
            value={values.date_release}
            onChange={onChange}
            aria-describedby="date_release-error"
          />
          {errors.date_release && (
            <span id="date_release-error" className={styles.errorMsg}>{errors.date_release}</span>
          )}
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="date_revision">Fecha de Revisión</label>
          <input
            id="date_revision"
            name="date_revision"
            type="date"
            className={`${styles.input} ${styles.inputReadonly}`}
            value={values.date_revision}
            readOnly
            tabIndex={-1}
            aria-label="Fecha de revisión (calculada automáticamente)"
          />
        </div>
      </div>

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.btnReset}
          onClick={onReset}
          disabled={isSubmitting}
        >
          Reiniciar
        </button>
        <button
          type="submit"
          className={styles.btnSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Guardando...' : 'Agregar'}
        </button>
      </div>
    </form>
  );
}
