'use client';

import styles from './ConfirmModal.module.css';

interface ConfirmModalProps {
  isOpen: boolean;
  productName: string;
  isDeleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ConfirmModal({ isOpen, productName, isDeleting, onCancel, onConfirm }: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className={styles.dialog}>
        <p id="modal-title" className={styles.message}>
          ¿Estás seguro de eliminar el producto <strong>{productName}</strong>?
        </p>
        <div className={styles.actions}>
          <button
            className={styles.btnCancel}
            onClick={onCancel}
            disabled={isDeleting}
          >
            Cancelar
          </button>
          <button
            className={styles.btnDelete}
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? 'Eliminando...' : 'Eliminar'}
          </button>
        </div>
      </div>
    </div>
  );
}
