import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Staff Operations | Restaurant Platform',
  description: 'Operational staff interface for Waiter, Kitchen, Cashier, Bartender, and Manager',
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
