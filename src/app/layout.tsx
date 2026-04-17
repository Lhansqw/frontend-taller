import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ProxyMonitor — Sistema de Observabilidad',
  description: 'Dashboard de monitoreo de microservicios con Patrón Proxy',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
