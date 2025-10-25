"use client";

import Footer from '@/components/footer/footer';
import Header from '@/components/header/header';
import { Poppins, Oswald } from 'next/font/google';
import './globals.css';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

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
  const [loading, setLoading] = useState(false);
  const pathname = usePathname();

  const isAdmin = pathname.startsWith('/admin');
  const loginPage = pathname === '/admin/login';
  const registerPage = pathname === '/admin/register';

  useEffect(() => {
    setLoading(true);
    
    const timer = setTimeout(() => {
      setLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <html lang="en" className={`${poppins.variable} ${oswald.variable}`}>
      <body suppressHydrationWarning>
        {/* Loading Overlay */}
        {loading && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-3">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
              <p className="text-sm font-medium text-gray-600">Loading...</p>
            </div>
          </div>
        )}

        {!isAdmin && !loginPage && !registerPage && <Header />}
        <div className={loading ? 'opacity-50 pointer-events-none' : 'opacity-100'}>
          {children}
        </div>
        {!isAdmin && !loginPage && !registerPage && <Footer />}
      </body>
    </html>
  );
}