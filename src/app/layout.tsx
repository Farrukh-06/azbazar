import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { CartProvider } from '@/lib/CartContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AzBazar — Azərbaycanın Yerli Bazarı',
  description: 'Əl işi məmulatlar, keramika, məişət texnikası və yerli məhsullar',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="az">
      <body className={inter.className}>
        <CartProvider>
          <Header />
          <main className="min-h-screen bg-gray-50">{children}</main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
