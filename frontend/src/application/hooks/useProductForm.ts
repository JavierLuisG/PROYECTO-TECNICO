'use client';

import { ChangeEvent, useState } from 'react';
import { productService } from '../../infrastructure/api/productService';

export interface ProductFormValues {
  id: string;
  name: string;
  description: string;
  logo: string;
  date_release: string;
  date_revision: string;
}

export type ProductFormErrors = Partial<Record<keyof ProductFormValues | 'submit', string>>;

const EMPTY_VALUES: ProductFormValues = {
  id: '',
  name: '',
  description: '',
  logo: '',
  date_release: '',
  date_revision: '',
};

function addOneYear(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  d.setFullYear(d.getFullYear() + 1);
  return d.toISOString().split('T')[0];
}

function todayStr(): string {
  return new Date().toISOString().split('T')[0];
}

function validateField(name: keyof ProductFormValues, value: string): string {
  switch (name) {
    case 'id':
      if (!value.trim()) return 'ID es requerido';
      if (value.length < 3) return 'ID no válido. Mínimo 3 caracteres';
      if (value.length > 10) return 'ID no válido. Máximo 10 caracteres';
      return '';
    case 'name':
      if (!value.trim()) return 'Nombre es requerido';
      if (value.length < 5) return 'Nombre no válido. Mínimo 5 caracteres';
      if (value.length > 100) return 'Nombre no válido. Máximo 100 caracteres';
      return '';
    case 'description':
      if (!value.trim()) return 'Descripción es requerida';
      if (value.length < 10) return 'Descripción no válida. Mínimo 10 caracteres';
      if (value.length > 200) return 'Descripción no válida. Máximo 200 caracteres';
      return '';
    case 'logo':
      if (!value.trim()) return 'Logo es requerido';
      return '';
    case 'date_release':
      if (!value) return 'Fecha de liberación es requerida';
      if (value < todayStr()) return 'La fecha debe ser igual o mayor a hoy';
      return '';
    default:
      return '';
  }
}

function validateAll(values: ProductFormValues): ProductFormErrors {
  const errors: ProductFormErrors = {};
  (Object.keys(values) as Array<keyof ProductFormValues>).forEach((key) => {
    if (key === 'date_revision') return;
    const msg = validateField(key, values[key]);
    if (msg) errors[key] = msg;
  });
  return errors;
}

interface UseProductFormOptions {
  initialValues?: Partial<ProductFormValues>;
  disableId?: boolean;
  onSuccess: (values: ProductFormValues) => Promise<void>;
}

interface UseProductFormResult {
  values: ProductFormValues;
  errors: ProductFormErrors;
  isSubmitting: boolean;
  disableId: boolean;
  handleChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleIdBlur: () => Promise<void>;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  handleReset: () => void;
}

export function useProductForm({
  initialValues,
  disableId = false,
  onSuccess,
}: UseProductFormOptions): UseProductFormResult {
  const [values, setValues] = useState<ProductFormValues>({
    ...EMPTY_VALUES,
    ...initialValues,
  });
  const [errors, setErrors] = useState<ProductFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const updated = { ...values, [name]: value } as ProductFormValues;

    if (name === 'date_release' && value) {
      updated.date_revision = addOneYear(value);
    }

    setValues(updated);

    const fieldError = name !== 'date_revision' ? validateField(name as keyof ProductFormValues, value) : '';
    setErrors((prev) => ({ ...prev, [name]: fieldError || undefined, submit: undefined }));
  };

  const handleIdBlur = async () => {
    const idError = validateField('id', values.id);
    if (idError) {
      setErrors((prev) => ({ ...prev, id: idError }));
      return;
    }
    try {
      const exists = await productService.verifyId(values.id);
      if (exists) {
        setErrors((prev) => ({ ...prev, id: 'ID ya registrado' }));
      } else {
        setErrors((prev) => ({ ...prev, id: undefined }));
      }
    } catch {
      // Si el servicio falla, no bloqueamos — la validación al enviar lo detectará
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateAll(values);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    if (errors.id) return;

    setIsSubmitting(true);
    try {
      await onSuccess(values);
    } catch {
      setErrors((prev) => ({ ...prev, submit: 'No se pudo crear el producto. Intenta de nuevo.' }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setValues({ ...EMPTY_VALUES, ...(disableId && initialValues ? { id: initialValues.id ?? '' } : {}) });
    setErrors({});
  };

  return { values, errors, isSubmitting, disableId, handleChange, handleIdBlur, handleSubmit, handleReset };
}
