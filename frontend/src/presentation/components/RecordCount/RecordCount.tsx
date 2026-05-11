import styles from './RecordCount.module.css';

interface RecordCountProps {
  count: number;
}

export function RecordCount({ count }: RecordCountProps) {
  return (
    <p className={styles.text} aria-live="polite">
      {count} {count === 1 ? 'resultado' : 'resultados'}
    </p>
  );
}
