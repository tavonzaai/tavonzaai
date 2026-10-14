import type { Metadata } from "next";
import "./globals.css";
import { Suspense } from "react";
import ReduxProvider from "@/redux/ReduxProvider";
import { CartProvider } from "@/context/CartContext";
import QrSessionSync from "@/components/common/QrSessionSync";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Tavonza AI | Customer Hospitality & Dining",
  description: "Discover restaurants around you, order for delivery, pickup, or dine-in, and get personalized Tavonza AI recommendations.",
  icons: {
    icon: [
      { url: "/favicon.png", type: "image/png" },
    ],
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className="dark h-full antialiased font-sans"
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="icon" type="image/png" href="/favicon.png" />
        <link rel="shortcut icon" type="image/png" href="/favicon.png" />
        <link rel="apple-touch-icon" href="/favicon.png" />
      </head>
      <body
        suppressHydrationWarning
        className="min-h-full bg-neutral-950 text-white font-sans flex flex-col selection:bg-yellow-400 selection:text-black"
      >
        <ReduxProvider>
          <Suspense fallback={null}>
            <QrSessionSync />
          </Suspense>
          <CartProvider>{children}</CartProvider>
          <Toaster richColors position="top-right" theme="dark" closeButton />
        </ReduxProvider>
      </body>
    </html>
  );
}

