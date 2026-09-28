import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Kitchen Display System (KDS) | Restaurant Platform',
  description: 'Kitchen display system for real-time ticket management, preparation stages, and order dispatch',
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
