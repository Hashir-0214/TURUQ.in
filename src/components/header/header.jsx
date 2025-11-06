// components/Header.jsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, Search, X } from 'lucide-react';
import CategoryOverlay from '@/components/header/CategoryOverlay'
import SearchOverlay from '@/components/header/searchOverlay';


export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(prev => !prev);
    // Ensure search closes when menu opens
    if (!isMenuOpen) setIsSearchOpen(false);
  };

  const toggleSearch = () => {
    setIsSearchOpen(prev => !prev);
    // Ensure menu closes when search opens
    if (!isSearchOpen) setIsMenuOpen(false);
  };

  const closeOverlays = () => {
    setIsMenuOpen(false);
    setIsSearchOpen(false);
  }

  // Effect to handle body scroll lock when an overlay is open
  useEffect(() => {
    if (isMenuOpen || isSearchOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    // Cleanup function
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isMenuOpen, isSearchOpen]);

  return (
    <>
      <header className='fixed top-0 left-0 w-full z-50 bg-[#ffedd9]'>
        {/* Added backdrop-blur for a subtle modern effect */}
        <div className="max-w-7xl h-[70px] mx-auto rounded-[50px] border border-black flex items-center justify-between px-6 sm:px-10 mt-[60px] relative bg-[#ffedd9]">
          <nav className="flex items-center gap-6">
            {/* Hamburger/Close Button */}
            <div
              className={`hamburger-menu rounded-full p-2 cursor-pointer border border-black transition-transform duration-300 ease-in-out ${
                isMenuOpen ? 'bg-red-600 rotate-90' : 'bg-black hover:bg-red-600'
              }`}
              onClick={toggleMenu}
            >
              {isMenuOpen ? <X size={22} color="#fff" /> : <Menu size={22} color="#fff" />}
            </div>
            {/* Nav Links */}
            <div className="hidden lg:flex gap-6">
              <Link
                href="/"
                className="font-sans text-lg font-medium text-black transition-colors hover:text-red-600 no-underline"
                onClick={closeOverlays}
              >
                WEBZINE
              </Link>
              <Link
                href="/archives"
                className="font-sans text-lg font-medium text-black transition-colors hover:text-red-600 no-underline"
                onClick={closeOverlays}
              >
                ARCHIVE
              </Link>
            </div>
          </nav>

          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer">
            <Link href="/" onClick={closeOverlays}>
              <h1 className="font-medium text-4xl text-red-600 m-0 font-oswald">TURUQ</h1>
            </Link>
          </div>

          <nav className="flex items-center gap-6">
            <div className="hidden lg:flex gap-6">
              <Link
                href="/about"
                className="font-sans text-lg font-medium text-black transition-colors hover:text-red-600 no-underline"
                onClick={closeOverlays}
              >
                ABOUT
              </Link>
              <Link
                href="/subscribe"
                className="font-sans text-lg font-medium text-black transition-colors hover:text-red-600 no-underline"
                onClick={closeOverlays}
              >
                SUBSCRIBE
              </Link>
            </div>
            {/* Search Button/Close Button */}
            <div
              className={`search-icon cursor-pointer rounded-full p-2 transition-colors border border-black ${
                isSearchOpen ? 'bg-black' : 'bg-white hover:bg-gray-200'
              }`}
              onClick={toggleSearch}
            >
              {isSearchOpen ? <X className="w-6 h-6 text-white" /> : <Search className="w-6 h-6" />}
            </div>
          </nav>
        </div>
      </header>
      
      {/* Categories Overlay Component */}
      <CategoryOverlay isOpen={isMenuOpen} onClose={closeOverlays} />

      {/* Search Overlay Component */}
      <SearchOverlay isOpen={isSearchOpen} onClose={closeOverlays} />
      
      {/* Adds necessary padding so content doesn't hide behind the fixed header */}
      <div className="pt-[140px] w-full"></div>
    </>
  );
}