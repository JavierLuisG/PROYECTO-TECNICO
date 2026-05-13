import React from 'react';
import { render } from '@testing-library/react-native';
import { RecordCount } from '../../../src/presentation/components/RecordCount/RecordCount';

describe('RecordCount', () => {
  it('muestra "1 resultado" en singular', () => {
    const { getByText } = render(<RecordCount count={1} />);
    expect(getByText('1 resultado')).toBeTruthy();
  });

  it('muestra "N resultados" en plural', () => {
    const { getByText } = render(<RecordCount count={5} />);
    expect(getByText('5 resultados')).toBeTruthy();
  });

  it('muestra "0 resultados" cuando no hay resultados', () => {
    const { getByText } = render(<RecordCount count={0} />);
    expect(getByText('0 resultados')).toBeTruthy();
  });
});
