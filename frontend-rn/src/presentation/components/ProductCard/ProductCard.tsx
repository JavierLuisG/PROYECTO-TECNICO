import { TouchableOpacity, View, Text, Image, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Product } from '../../../domain/models/Product';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <TouchableOpacity
      style={styles.row}
      onPress={() => router.push(`/products/${product.id}`)}
      accessibilityLabel={`Ver detalle de ${product.name}`}
      accessibilityRole="button"
    >
      <View style={styles.logoContainer}>
        {product.logo ? (
          <Image
            source={{ uri: product.logo }}
            style={styles.logo}
            resizeMode="contain"
          />
        ) : (
          <Text style={styles.noLogo}>—</Text>
        )}
      </View>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{product.name}</Text>
        <Text style={styles.id} numberOfLines={1}>ID: {product.id}</Text>
      </View>
      <Text style={styles.arrow}>›</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  logoContainer: {
    width: 48,
    height: 36,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 48,
    height: 36,
  },
  noLogo: {
    color: '#aaa',
    fontSize: 16,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  id: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  arrow: {
    fontSize: 22,
    color: '#aaa',
    marginLeft: 8,
  },
});
