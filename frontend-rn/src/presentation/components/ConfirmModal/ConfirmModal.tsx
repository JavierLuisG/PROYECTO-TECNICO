import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface ConfirmModalProps {
  isOpen: boolean;
  productName: string;
  isDeleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ConfirmModal({ isOpen, productName, isDeleting, onCancel, onConfirm }: ConfirmModalProps) {
  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
      accessibilityViewIsModal
    >
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          <Text style={styles.message}>
            ¿Estás seguro de eliminar el producto{' '}
            <Text style={styles.bold}>{productName}</Text>?
          </Text>
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.btnCancel}
              onPress={onCancel}
              disabled={isDeleting}
              accessibilityLabel="Cancelar"
            >
              <Text style={styles.btnCancelText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btnDelete, isDeleting && styles.btnDisabled]}
              onPress={onConfirm}
              disabled={isDeleting}
              accessibilityLabel="Eliminar"
            >
              <Text style={styles.btnDeleteText}>
                {isDeleting ? 'Eliminando...' : 'Eliminar'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dialog: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 28,
    width: '80%',
    maxWidth: 360,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  message: {
    fontSize: 15,
    color: '#1a1a1a',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  bold: {
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  btnCancel: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#e5e7eb',
    borderRadius: 6,
    alignItems: 'center',
  },
  btnCancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  btnDelete: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#dc2626',
    borderRadius: 6,
    alignItems: 'center',
  },
  btnDisabled: {
    opacity: 0.6,
  },
  btnDeleteText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});
