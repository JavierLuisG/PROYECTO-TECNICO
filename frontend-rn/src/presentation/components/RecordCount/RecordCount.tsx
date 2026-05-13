import { Text, StyleSheet } from 'react-native';

interface RecordCountProps {
  count: number;
}

export function RecordCount({ count }: RecordCountProps) {
  return (
    <Text
      style={styles.text}
      accessibilityLiveRegion="polite"
      accessibilityLabel={`${count} ${count === 1 ? 'resultado' : 'resultados'}`}
    >
      {count} {count === 1 ? 'resultado' : 'resultados'}
    </Text>
  );
}

const styles = StyleSheet.create({
  text: {
    fontSize: 13,
    color: '#555',
    textAlign: 'right',
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
});
