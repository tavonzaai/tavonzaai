import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';
import { Toaster } from 'sonner';
import ReduxProvider from '@/redux/ReduxProvider';

export const metadata: Metadata = {
  title: 'Cashier Command Center | Tavonza AI Hospitality',
  description: 'Point-of-sale terminal, bill settlement, live orders, table view, and payments.',
  icons: {
    icon: [
      { url: '/favicon.png', type: 'image/png' },
    ],
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-black text-white antialiased min-h-screen">
        <ReduxProvider>
          {children}
        </ReduxProvider>
        <Toaster richColors position="top-right" theme="dark" closeButton />
      </body>
    </html>
  );
}
