import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';
import { Toaster } from 'sonner';
import ReduxProvider from '@/redux/ReduxProvider';

export const metadata: Metadata = {
  title: 'TablePilot Super Admin | Tavonza AI Hospitality',
  description: 'Enterprise multi-tenant restaurant and hospitality SaaS super administrative command center.',
  icons: {
    icon: [
      { url: '/favicon.png', type: 'image/png' },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en" className="dark" style={{ backgroundColor: '#000000', color: '#ffffff' }}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Poppins:wght@400;500;600;700&display=swap"
        />
      </head>
      <body
        style={{ backgroundColor: '#000000', color: '#ffffff' }}
        className="bg-black text-white antialiased min-h-screen font-inter selection:bg-yellow-400 selection:text-black"
      >
        <ReduxProvider>
          {children}
        </ReduxProvider>
        <Toaster richColors position="top-right" theme="dark" closeButton />
      </body>
    </html>
  );
}
