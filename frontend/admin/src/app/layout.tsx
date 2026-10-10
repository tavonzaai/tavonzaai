import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';
import { Toaster } from 'sonner';
import ReduxProvider from '@/redux/ReduxProvider';

export const metadata: Metadata = {
  title: 'Admin Command Center | Tavonza AI Hospitality',
  description: 'Enterprise hospitality platform administration, tenant operations, financials, staff, and multi-branch management.',
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
