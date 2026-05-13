import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { ProductFormErrors, ProductFormValues } from '../../../application/hooks/useProductForm';

interface ProductFormProps {
  values: ProductFormValues;
  errors: ProductFormErrors;
  isSubmitting: boolean;
  disableId: boolean;
  onChange: (name: keyof ProductFormValues, value: string) => void;
  onIdBlur: () => void;
  onSubmit: () => void;
  onReset: () => void;
  submitLabel?: string;
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
  submitLabel = 'Agregar',
}: ProductFormProps) {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.wrapper}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {errors.submit && (
          <View style={styles.submitError} accessibilityRole="alert">
            <Text style={styles.submitErrorText}>{errors.submit}</Text>
          </View>
        )}

        <View style={styles.field}>
          <Text style={styles.label}>ID</Text>
          <TextInput
            style={[styles.input, errors.id ? styles.inputError : null, disableId ? styles.inputDisabled : null]}
            value={values.id}
            onChangeText={(v) => onChange('id', v)}
            onBlur={!disableId ? onIdBlur : undefined}
            editable={!disableId}
            maxLength={10}
            autoCapitalize="none"
            accessibilityLabel="ID del producto"
          />
          {errors.id && <Text style={styles.errorMsg}>{errors.id}</Text>}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Nombre</Text>
          <TextInput
            style={[styles.input, errors.name ? styles.inputError : null]}
            value={values.name}
            onChangeText={(v) => onChange('name', v)}
            maxLength={100}
            accessibilityLabel="Nombre del producto"
          />
          {errors.name && <Text style={styles.errorMsg}>{errors.name}</Text>}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Descripción</Text>
          <TextInput
            style={[styles.input, styles.textarea, errors.description ? styles.inputError : null]}
            value={values.description}
            onChangeText={(v) => onChange('description', v)}
            multiline
            numberOfLines={3}
            maxLength={200}
            textAlignVertical="top"
            accessibilityLabel="Descripción del producto"
          />
          {errors.description && <Text style={styles.errorMsg}>{errors.description}</Text>}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Logo (URL)</Text>
          <TextInput
            style={[styles.input, errors.logo ? styles.inputError : null]}
            value={values.logo}
            onChangeText={(v) => onChange('logo', v)}
            autoCapitalize="none"
            keyboardType="url"
            accessibilityLabel="URL del logo"
          />
          {errors.logo && <Text style={styles.errorMsg}>{errors.logo}</Text>}
        </View>

        <View style={styles.row}>
          <View style={styles.fieldHalf}>
            <Text style={styles.label}>Fecha de Liberación</Text>
            <TextInput
              style={[styles.input, errors.date_release ? styles.inputError : null]}
              value={values.date_release}
              onChangeText={(v) => onChange('date_release', v)}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#aaa"
              maxLength={10}
              accessibilityLabel="Fecha de liberación"
            />
            {errors.date_release && <Text style={styles.errorMsg}>{errors.date_release}</Text>}
          </View>

          <View style={styles.fieldHalf}>
            <Text style={styles.label}>Fecha de Revisión</Text>
            <TextInput
              style={[styles.input, styles.inputDisabled]}
              value={values.date_revision}
              editable={false}
              accessibilityLabel="Fecha de revisión (calculada automáticamente)"
            />
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.btnReset, isSubmitting ? styles.btnDisabled : null]}
            onPress={onReset}
            disabled={isSubmitting}
            accessibilityLabel="Reiniciar formulario"
          >
            <Text style={styles.btnResetText}>Reiniciar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.btnSubmit, isSubmitting ? styles.btnDisabled : null]}
            onPress={onSubmit}
            disabled={isSubmitting}
            accessibilityLabel={submitLabel}
          >
            <Text style={styles.btnSubmitText}>
              {isSubmitting ? 'Guardando...' : submitLabel}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  scroll: {
    padding: 16,
    paddingBottom: 40,
  },
  submitError: {
    backgroundColor: '#fee2e2',
    borderRadius: 6,
    padding: 12,
    marginBottom: 16,
  },
  submitErrorText: {
    color: '#dc2626',
    fontSize: 13,
  },
  field: {
    marginBottom: 16,
  },
  fieldHalf: {
    flex: 1,
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1a1a1a',
    backgroundColor: '#fff',
  },
  textarea: {
    height: 80,
    paddingTop: 10,
  },
  inputError: {
    borderColor: '#dc2626',
  },
  inputDisabled: {
    backgroundColor: '#f3f4f6',
    color: '#9ca3af',
  },
  errorMsg: {
    fontSize: 12,
    color: '#dc2626',
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  btnReset: {
    flex: 1,
    paddingVertical: 14,
    backgroundColor: '#e5e7eb',
    borderRadius: 6,
    alignItems: 'center',
  },
  btnResetText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  btnSubmit: {
    flex: 1,
    paddingVertical: 14,
    backgroundColor: '#ffdd00',
    borderRadius: 6,
    alignItems: 'center',
  },
  btnSubmitText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  btnDisabled: {
    opacity: 0.6,
  },
});
