import { FlatList, View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { Product } from '../../../domain/models/Product';
import { ProductCard } from '../ProductCard/ProductCard';

interface ProductListProps {
  products: Product[];
  loading: boolean;
  error: string | null;
}

export function ProductList({ products, loading, error }: ProductListProps) {
  if (loading) {
    return (
      <View style={styles.center} accessibilityRole="progressbar" accessibilityLabel="Cargando productos">
        <ActivityIndicator size="large" color="#ffdd00" />
        <Text style={styles.stateText}>Cargando productos...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center} accessibilityRole="alert">
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={products}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <ProductCard product={item} />}
      style={styles.list}
      ListEmptyComponent={
        <View style={styles.center}>
          <Text style={styles.stateText}>No se encontraron productos que coincidan con la búsqueda.</Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    overflow: 'hidden',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  stateText: {
    fontSize: 14,
    color: '#555',
    marginTop: 12,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 14,
    color: '#dc2626',
    textAlign: 'center',
  },
});
