import { TextInput, StyleSheet } from 'react-native';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <TextInput
      style={styles.input}
      value={value}
      onChangeText={onChange}
      placeholder="Buscar..."
      placeholderTextColor="#aaa"
      accessibilityLabel="Buscar productos"
      clearButtonMode="while-editing"
    />
  );
}

const styles = StyleSheet.create({
  input: {
    flex: 1,
    height: 42,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    paddingHorizontal: 12,
    fontSize: 14,
    backgroundColor: '#fff',
    color: '#1a1a1a',
  },
});
