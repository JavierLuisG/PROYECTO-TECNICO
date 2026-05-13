import { View, Pressable, Text, StyleSheet } from 'react-native';
import { Link, Stack } from 'expo-router';
import { useProducts } from '../src/application/hooks/useProducts';
import { useSearch } from '../src/application/hooks/useSearch';
import { SearchBar } from '../src/presentation/components/SearchBar/SearchBar';
import { RecordCount } from '../src/presentation/components/RecordCount/RecordCount';
import { ProductList } from '../src/presentation/components/ProductList/ProductList';

export default function HomeScreen() {
  const { products, loading, error } = useProducts();
  const { searchTerm, setSearchTerm, filteredProducts } = useSearch(products);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Banco - Productos' }} />

      <View style={styles.toolbar}>
        <SearchBar value={searchTerm} onChange={setSearchTerm} />
        <Link href="/products/new" asChild>
          <Pressable style={styles.btnAdd} accessibilityLabel="Agregar producto">
            <Text style={styles.btnAddText}>Agregar</Text>
          </Pressable>
        </Link>
      </View>

      <RecordCount count={filteredProducts.length} />

      <ProductList products={filteredProducts} loading={loading} error={error} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 16,
  },
  btnAdd: {
    backgroundColor: '#ffdd00',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
  },
  btnAddText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1a1a1a',
  },
});
