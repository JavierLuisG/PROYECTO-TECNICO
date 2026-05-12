import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProductList } from '../../../src/presentation/components/ProductList/ProductList';
import { ProductCard } from '../../../src/presentation/components/ProductCard/ProductCard';
import { RecordCount } from '../../../src/presentation/components/RecordCount/RecordCount';

const mockProducts = [
  {
    id: 'trj-crd',
    name: 'Tarjetas de Crédito',
    description: 'Tarjeta de consumo bajo la modalidad de crédito',
    logo: 'https://example.com/logo.png',
    date_release: '2023-02-01',
    date_revision: '2024-02-01',
  },
  {
    id: 'seg-vida',
    name: 'Seguro de Vida',
    description: 'Protección de vida para el titular y su familia',
    logo: 'https://example.com/logo2.png',
    date_release: '2023-05-15',
    date_revision: '2024-05-15',
  },
];

describe('ProductList — estado de carga', () => {
  it('muestra spinner y texto "Cargando productos..." cuando loading es true', () => {
    render(<ProductList products={[]} loading={true} error={null} />);
    expect(screen.getByText('Cargando productos...')).toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });
});

describe('ProductList — estado de error', () => {
  it('muestra el mensaje de error cuando error no es null', () => {
    render(<ProductList products={[]} loading={false} error="Error de conexión" />);
    expect(screen.getByRole('alert')).toHaveTextContent('Error de conexión');
  });
});

describe('ProductList — lista vacía', () => {
  it('muestra mensaje de lista vacía cuando no hay productos', () => {
    render(<ProductList products={[]} loading={false} error={null} />);
    expect(
      screen.getByText('No se encontraron productos que coincidan con la búsqueda.'),
    ).toBeInTheDocument();
  });
});

describe('ProductList — con productos', () => {
  it('renderiza una fila por cada producto', () => {
    render(<ProductList products={mockProducts} loading={false} error={null} />);
    expect(screen.getByText('Tarjetas de Crédito')).toBeInTheDocument();
    expect(screen.getByText('Seguro de Vida')).toBeInTheDocument();
  });

  it('renderiza las cabeceras de la tabla', () => {
    render(<ProductList products={mockProducts} loading={false} error={null} />);
    expect(screen.getByText('Nombre')).toBeInTheDocument();
    expect(screen.getByText('Descripción')).toBeInTheDocument();
    expect(screen.getByText('Acciones')).toBeInTheDocument();
  });

  it('renderiza enlace de navegación al detalle para cada producto', () => {
    render(<ProductList products={mockProducts} loading={false} error={null} />);
    const navLinks = screen.getAllByRole('link', { name: /Ver detalle de/i });
    expect(navLinks).toHaveLength(2);
    expect(navLinks[0]).toHaveAttribute('href', '/products/trj-crd');
    expect(navLinks[1]).toHaveAttribute('href', '/products/seg-vida');
  });
});

describe('ProductCard', () => {
  const product = {
    id: 'trj-crd',
    name: 'Tarjetas de Crédito',
    description: 'Tarjeta de consumo',
    logo: 'https://example.com/logo.png',
    date_release: '2023-02-01',
    date_revision: '2024-02-01',
  };

  it('renderiza el nombre y descripción del producto', () => {
    render(
      <table>
        <tbody>
          <ProductCard product={product} />
        </tbody>
      </table>,
    );
    expect(screen.getByText('Tarjetas de Crédito')).toBeInTheDocument();
    expect(screen.getByText('Tarjeta de consumo')).toBeInTheDocument();
  });

  it('oculta la imagen cuando se produce un error de carga', () => {
    render(
      <table>
        <tbody>
          <ProductCard product={product} />
        </tbody>
      </table>,
    );
    const img = screen.getByRole('img');
    expect(img).toBeVisible();
    fireEvent.error(img);
    expect(img.style.display).toBe('none');
  });

  it('muestra "—" cuando el logo está vacío', () => {
    render(
      <table>
        <tbody>
          <ProductCard product={{ ...product, logo: '' }} />
        </tbody>
      </table>,
    );
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('incluye el enlace de navegación al detalle con href correcto', () => {
    render(
      <table>
        <tbody>
          <ProductCard product={product} />
        </tbody>
      </table>,
    );
    expect(
      screen.getByRole('link', { name: /Ver detalle de Tarjetas de Crédito/i }),
    ).toHaveAttribute('href', '/products/trj-crd');
  });
});

describe('RecordCount', () => {
  it('muestra "1 resultado" en singular', () => {
    render(<RecordCount count={1} />);
    expect(screen.getByText('1 resultado')).toBeInTheDocument();
  });

  it('muestra "N resultados" en plural', () => {
    render(<RecordCount count={5} />);
    expect(screen.getByText('5 resultados')).toBeInTheDocument();
  });

  it('muestra "0 resultados" cuando no hay resultados', () => {
    render(<RecordCount count={0} />);
    expect(screen.getByText('0 resultados')).toBeInTheDocument();
  });

  it('tiene aria-live="polite" para accesibilidad', () => {
    render(<RecordCount count={3} />);
    const el = screen.getByText('3 resultados');
    expect(el).toHaveAttribute('aria-live', 'polite');
  });
});
