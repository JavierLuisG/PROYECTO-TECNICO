import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { productService } from '../../../src/infrastructure/api/productService';
import { updateProduct } from '../../../src/application/usecases/updateProduct';
import { useProductForm } from '../../../src/application/hooks/useProductForm';
import { ProductForm } from '../../../src/presentation/components/ProductForm/ProductForm';
import { Product } from '../../../src/domain/models/Product';

export default function EditProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    productService
      .getById(id)
      .then(setProduct)
      .catch(() => setLoadError('Producto no encontrado.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <View style={styles.center}>
        <Stack.Screen options={{ title: 'Cargando...' }} />
        <ActivityIndicator size="large" color="#ffdd00" />
      </View>
    );
  }

  if (loadError || !product) {
    return (
      <View style={styles.center}>
        <Stack.Screen options={{ title: 'Error' }} />
        <Text style={styles.errorText}>{loadError ?? 'Producto no encontrado.'}</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>← Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return <EditForm productId={id} product={product} />;
}

function EditForm({ productId, product }: { productId: string; product: Product }) {
  const { values, errors, isSubmitting, disableId, handleChange, handleIdBlur, handleSubmit, handleReset } =
    useProductForm({
      initialValues: product,
      disableId: true,
      onSuccess: async (formValues) => {
        await updateProduct(productId, formValues);
        router.replace('/');
      },
    });

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Formulario de Edición' }} />
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#f5f5f5',
  },
  errorText: {
    fontSize: 15,
    color: '#dc2626',
    marginBottom: 16,
    textAlign: 'center',
  },
  backText: {
    fontSize: 14,
    color: '#555',
    textDecorationLine: 'underline',
  },
});
