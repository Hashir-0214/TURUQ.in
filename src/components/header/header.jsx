// components/Header.jsx
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Menu, Search, X } from 'lucide-react';
import Tag from '../ui/tag';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    if (isSearchOpen) setIsSearchOpen(false);
  };

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
    if (isMenuOpen) setIsMenuOpen(false);
  };

  // Close menu/search when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMenuOpen && !event.target.closest('.menu-overlay') && !event.target.closest('.hamburger-menu')) {
        setIsMenuOpen(false);
      }
      if (isSearchOpen && !event.target.closest('.search-overlay') && !event.target.closest('.search-icon')) {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen, isSearchOpen]);

  return (
    <>
      <header className='fixed top-0 left-0 w-full z-50 bg-[#ffedd9] pb-2.5'>
        <div className="max-w-7xl h-[70px] mx-auto rounded-[50px] border border-black flex items-center justify-between px-10 mt-[60px] relative">
          <nav className="flex items-center gap-6">
            <div
              className={`hamburger-menu bg-red-600 rounded-full p-2 cursor-pointer border border-black transition-transform duration-300 ease-in-out ${isMenuOpen ? 'rotate-90' : ''
                }`}
              onClick={toggleMenu}
            >
              {isMenuOpen ? <X size={22} color="#fff" /> : <Menu size={22} color="#fff" />}
            </div>
            <div className="hidden md:flex gap-6">
              <Link
                href="/"
                className="font-sans text-lg font-medium text-black transition-colors hover:text-red-600 no-underline"
              >
                WEBZINE
              </Link>
              <Link
                href="/archives"
                className="font-sans text-lg font-medium text-black transition-colors hover:text-red-600 no-underline"
              >
                ARCHIVE
              </Link>
            </div>
          </nav>

          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer">
            <Link href="/">
              <h1 className="font-medium text-4xl text-red-600 m-0">TURUQ</h1>
            </Link>
          </div>

          <nav className="flex items-center gap-6">
            <div className="hidden md:flex gap-6">
              <Link
                href="/about"
                className="font-sans text-lg font-medium text-black transition-colors hover:text-red-600 no-underline"
              >
                ABOUT
              </Link>
              <Link
                href="/subscribe"
                className="font-sans text-lg font-medium text-black transition-colors hover:text-red-600 no-underline"
              >
                SUBSCRIBE
              </Link>
            </div>
            <div className="search-icon cursor-pointer" onClick={toggleSearch}>
              <Search className="w-6 h-6" />
            </div>
          </nav>
        </div>
      </header>

      {/* Menu Overlay */}
      <div
        className={`menu-overlay ${isMenuOpen ? 'block' : 'hidden'} fixed inset-0 bg-[#ffedd9] z-40 pt-20`}
      >
        <div className="h-full">
          <div className="flex h-full">
            {/* Left Sidebar with Categories */}
            <div className="w-1/4 pl-10 pt-10">
              <div>
                <div className="font-sans text-lg mb-4 cursor-pointer hover:text-red-600 transition-colors">
                  FICTION
                </div>
                <div className="font-sans text-lg mb-4 cursor-pointer text-red-600">
                  ARTICLES
                </div>
                <div className="font-sans text-lg mb-4 cursor-pointer hover:text-red-600 transition-colors">
                  PHOTO ESSAY
                </div>
                <div className="font-sans text-lg mb-4 cursor-pointer hover:text-red-600 transition-colors">
                  SERIES
                </div>
                <div className="font-sans text-lg mb-4 cursor-pointer hover:text-red-600 transition-colors">
                  REVIEW
                </div>
                <div className="font-sans text-lg mb-4 cursor-pointer hover:text-red-600 transition-colors">
                  INTERVIEW
                </div>
                <div className="font-sans text-lg mb-4 cursor-pointer hover:text-red-600 transition-colors">
                  PODCAST
                </div>
              </div>
            </div>

            <div className="w-px bg-gray-300 mx-8 my-10"></div>

            {/* Article Cards Section */}
            <div className="w-3/4 overflow-y-auto py-10 pr-10">
              {/* Sample Article Card */}
              <div className="flex mb-10">
                <div className="w-2/3 pr-6">
                  <Tag link="/category/united" className="w-fit">united</Tag>
                  <h3 className="font-rachana text-2xl font-medium mt-4 mb-3">
                    റബീഅ് സുഗന്ധം പരക്കുന്ന മൊറോക്കൻ വിഭവങ്ങൾ
                  </h3>
                  <p className="font-rachana text-gray-600 mb-4">
                    മൊറോക്കൻ സംസ്കാരവും മതവും സംഗമിക്കുന്ന ദിനമാണ് ഈദുൽ മൗലിദ്.
                    മൊറോക്കൊയിലെ മൊറോക്കൻ സംസ്കാരവും മതവും ദിനമാണ് ഈദുൽ മൗലിദ്.
                    മൊറോക്കൊയിലെ ഒരോ...
                  </p>
                  <div className="font-sans text-sm text-gray-500">
                    <span className="font-poppins">സിനാൻ കാടൻ</span>
                    <span className="mx-2">|</span>
                    <span>22 MAY 2025</span>
                  </div>
                </div>

                <div className="w-1/3">
                  <Image
                    src="/images/hero_featured.jpg"
                    alt="Featured article image"
                    width={300}
                    height={200}
                    className="w-full h-48 object-cover rounded-lg"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search Overlay */}
      <div
        className={`search-overlay ${isSearchOpen ? 'block' : 'hidden'} fixed inset-0 bg-white z-40 pt-20`}
      >
        <div className="max-w-4xl mx-auto p-6">
          <div>
            <h2 className="font-bold text-3xl font-medium text-center mb-10">
              SEARCH HERE
            </h2>

            <div className="flex items-center border-b border-black pb-3 mb-10">
              <input
                type="text"
                placeholder="TYPE SOMETHING........"
                className="font-sans text-lg w-full bg-transparent outline-none"
              />
              <button className="ml-4" type="button" aria-label="Search">
                <svg width="47" height="47" viewBox="0 0 47 47" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M41.125 41.125L32.6199 32.62L41.125 41.125ZM32.6199 32.62C34.0748 31.1651 35.2288 29.438 36.0161 27.5372C36.8035 25.6364 37.2087 23.5991 37.2087 21.5417C37.2087 19.4842 36.8035 17.447 36.0161 15.5461C35.2288 13.6453 34.0748 11.9182 32.6199 10.4634C31.1651 9.00856 29.438 7.85453 27.5372 7.06719C25.6364 6.27984 23.5991 5.8746 21.5416 5.8746C19.4842 5.8746 17.4469 6.27984 15.5461 7.06719C13.6453 7.85453 11.9182 9.00856 10.4634 10.4634C7.52521 13.4015 5.87457 17.3865 5.87457 21.5417C5.87457 25.6968 7.52521 29.6818 10.4634 32.62C13.4015 35.5581 17.3865 37.2087 21.5416 37.2087C25.6968 37.2087 29.6818 35.5581 32.6199 32.62Z"
                    fill="#D64545"
                  />
                  <path
                    d="M41.125 41.125L32.6199 32.62M32.6199 32.62C34.0748 31.1651 35.2288 29.438 36.0161 27.5372C36.8035 25.6364 37.2087 23.5991 37.2087 21.5417C37.2087 19.4842 36.8035 17.447 36.0161 15.5461C35.2288 13.6453 34.0748 11.9182 32.6199 10.4634C31.1651 9.00856 29.438 7.85453 27.5372 7.06719C25.6364 6.27984 23.5991 5.8746 21.5416 5.8746C19.4842 5.8746 17.4469 6.27984 15.5461 7.06719C13.6453 7.85453 11.9182 9.00856 10.4634 10.4634C7.52521 13.4015 5.87457 17.3865 5.87457 21.5417C5.87457 25.6968 7.52521 29.6818 10.4634 32.62C13.4015 35.5581 17.3865 37.2087 21.5416 37.2087C25.6968 37.2087 29.6818 35.5581 32.6199 32.62Z"
                    stroke="black"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <div className="border border-gray-200 p-4 rounded-lg">
                  <div className="mb-4">
                    <div className="overflow-hidden rounded-lg">
                      <Image
                        src="/images/hero_featured.jpg"
                        alt="മാംഗ: ജാപ്പനീസ് കലാമണ്ഡലത്തിൽ ഇസ്ലാമിന്റെ"
                        width={200}
                        height={150}
                        className="w-full h-40 object-cover"
                      />
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="font-sans text-xs bg-gray-100 px-2 py-1 rounded">
                      UNITED
                    </span>
                    <span className="font-sans text-xs bg-gray-100 px-2 py-1 rounded">
                      ARCHITECTURE
                    </span>
                  </div>
                  <h3 className="font-sans text-lg font-medium mb-3">
                    മാംഗ: ജാപ്പനീസ് കലാമണ്ഡലത്തിൽ ഇസ്ലാമിന്റെ
                  </h3>
                  <div className="font-sans text-xs text-gray-500">
                    <span>സിനാൻ</span>
                    <span className="mx-2">|</span>
                    <span>22 MAY 2025</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}