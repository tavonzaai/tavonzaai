import type { Metadata } from "next";
import { Inter, Outfit, Poppins, Montserrat, DM_Sans } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

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

import { Suspense } from "react";
import ReduxProvider from "@/redux/ReduxProvider";
import { CartProvider } from "@/context/CartContext";
import QrSessionSync from "@/components/common/QrSessionSync";
import { Toaster } from "sonner";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${outfit.variable} ${poppins.variable} ${montserrat.variable} ${dmSans.variable} dark h-full antialiased`}
    >
      <head>
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

