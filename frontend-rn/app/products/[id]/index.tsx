import { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { productService } from '../../../src/infrastructure/api/productService';
import { deleteProduct } from '../../../src/application/usecases/deleteProduct';
import { ConfirmModal } from '../../../src/presentation/components/ConfirmModal/ConfirmModal';
import { Product } from '../../../src/domain/models/Product';

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [product, setProduct] = useState<Product | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    productService
      .getById(id)
      .then(setProduct)
      .catch(() => setLoadError('Producto no encontrado.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleConfirmDelete = async () => {
    if (!product) return;
    setIsDeleting(true);
    try {
      await deleteProduct(product.id);
      router.replace('/');
    } finally {
      setIsDeleting(false);
    }
  };

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
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>← Volver al listado</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: `ID: ${product.id}` }} />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.subtitle}>Información extra</Text>

        <View style={styles.card}>
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Nombre</Text>
            <Text style={styles.fieldValue}>{product.name}</Text>
          </View>
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Descripción</Text>
            <Text style={styles.fieldValue}>{product.description}</Text>
          </View>
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Logo</Text>
            <View>
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
          </View>
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Fecha liberación</Text>
            <Text style={styles.fieldValue}>{product.date_release}</Text>
          </View>
          <View style={[styles.fieldRow, styles.lastRow]}>
            <Text style={styles.fieldLabel}>Fecha revisión</Text>
            <Text style={styles.fieldValue}>{product.date_revision}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.btnEdit}
          onPress={() => router.push(`/products/${product.id}/edit`)}
        >
          <Text style={styles.btnEditText}>Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.btnDelete}
          onPress={() => setShowModal(true)}
        >
          <Text style={styles.btnDeleteText}>Eliminar</Text>
        </TouchableOpacity>
      </ScrollView>

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#f5f5f5',
  },
  subtitle: {
    fontSize: 13,
    color: '#888',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    overflow: 'hidden',
    marginBottom: 24,
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  fieldLabel: {
    width: 130,
    fontSize: 14,
    color: '#555',
    fontWeight: '500',
  },
  fieldValue: {
    flex: 1,
    fontSize: 14,
    color: '#1a1a1a',
    fontWeight: '600',
  },
  logo: {
    width: 120,
    height: 80,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  noLogo: {
    color: '#aaa',
  },
  btnEdit: {
    backgroundColor: '#e5e7eb',
    paddingVertical: 14,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 12,
  },
  btnEditText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  btnDelete: {
    backgroundColor: '#dc2626',
    paddingVertical: 14,
    borderRadius: 6,
    alignItems: 'center',
  },
  btnDeleteText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  errorText: {
    fontSize: 15,
    color: '#dc2626',
    marginBottom: 16,
    textAlign: 'center',
  },
  backBtn: {
    padding: 8,
  },
  backBtnText: {
    fontSize: 14,
    color: '#555',
    textDecorationLine: 'underline',
  },
});
