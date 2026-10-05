import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';
import { ReduxProvider } from '../redux';

export const metadata: Metadata = {
  title: 'Tavonza | Manager Console',
  description: 'Manager operational console for shifts, inventory, live orders, tables, and staff',
  icons: {
    icon: '/icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en" className="dark h-full antialiased">
      <body className="min-h-full bg-black text-white font-sans overflow-x-hidden selection:bg-amber-400 selection:text-black">
        <ReduxProvider>{children}</ReduxProvider>
      </body>
    </html>
  );
}
