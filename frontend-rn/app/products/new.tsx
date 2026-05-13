import { View, StyleSheet } from 'react-native';
import { Stack, router } from 'expo-router';
import { useProductForm } from '../../src/application/hooks/useProductForm';
import { createProduct } from '../../src/application/usecases/createProduct';
import { ProductForm } from '../../src/presentation/components/ProductForm/ProductForm';

export default function NewProductScreen() {
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
        router.replace('/');
      },
    });

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Formulario de Registro' }} />
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});
