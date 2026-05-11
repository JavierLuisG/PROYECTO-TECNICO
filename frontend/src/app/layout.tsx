import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Banco - Productos Financieros',
  description: 'Catálogo de productos financieros',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
