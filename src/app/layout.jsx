"use client";

import Footer from "@/components/footer/footer";
import Header from "@/components/header/header";
import "./globals.css";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";

export default function RootLayout({ children }) {
  const [loading, setLoading] = useState(false);
  const pathname = usePathname();

  const isAdmin = pathname.startsWith("/admin");
  const loginPage = pathname === "/admin/login";
  const registerPage = pathname === "/admin/register";

  useEffect(() => {
    setLoading(true);

    const timer = setTimeout(() => {
      setLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <html lang="en">
      <head>
        <title>TURUQ | Webzine</title>
        <meta
          name="description"
          content="TURUQ is a platform dedicated to fostering thoughtful discourse on culture, art, and society."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <link
          href="https://fonts.googleapis.com/css2?family=Oswald:wght@200..700&display=swap"
          rel="stylesheet"
        />
      </head>
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
        <div
          className={loading ? "opacity-50 pointer-events-none" : "opacity-100"}
        >
          {children}
        </div>
        {!isAdmin && !loginPage && !registerPage && <Footer />}
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
