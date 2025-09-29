"use client";

import Footer from '@/components/footer/footer';
import Header from '@/components/header/header';
import { Poppins, Oswald } from 'next/font/google';
import './globals.css';
import { usePathname } from 'next/navigation';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
});

const oswald = Oswald({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-oswald',
});

export default function RootLayout({ children }) {
  const pathname = usePathname();

  const isAdmin = pathname.startsWith('/admin');
  const loginPage = pathname === '/admin/login';

  return (
    <html lang="en" className={`${poppins.variable} ${oswald.variable}`}>
      <body>
        {!isAdmin && !loginPage && <Header />}
        {children}
        {!isAdmin && !loginPage && <Footer />}
      </body>
    </html>
  );
}