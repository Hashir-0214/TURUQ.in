'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Search, Loader2 } from 'lucide-react';

export default function SearchOverlay({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setResults([]);
      setHasSearched(false);
      setLoading(false);
    }
  }, [isOpen]);

  const performSearch = async (searchTerm) => {
    if (!searchTerm.trim()) {
        setResults([]);
        setHasSearched(false);
        setLoading(false);
        return;
    }

    setLoading(true);
    setHasSearched(true);

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(searchTerm)}`);
      if (res.ok) {
        const data = await res.json();
        setResults(data);
      } else {
        setResults([]);
      }
    } catch (error) {
      console.error("Search error:", error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (query) {
        performSearch(query);
      } else {
        setResults([]);
        setHasSearched(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const handleFormSubmit = (e) => {
    e.preventDefault();
  };

  if (!isOpen) return null;

  const ResultCard = ({ result }) => (
    <div className="border border-black rounded-xl p-4 transition-shadow duration-300 hover:shadow-xl bg-white h-full flex flex-col">
      <Link href={result.link} onClick={onClose} className="flex-grow">
        <div className="mb-4">
          <div className="overflow-hidden rounded-lg">
            <Image
              src={result.image}
              alt={result.title}
              width={200}
              height={150}
              className="w-full h-40 object-cover rounded-lg"
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mb-3">
          {result.categories.map((cat, idx) => (
            <span
              key={idx}
              className="font-sans text-xs bg-gray-100 px-2 py-1 rounded-full border border-gray-300 uppercase"
            >
              {cat}
            </span>
          ))}
        </div>
        <h3 className="font-sans text-lg font-bold mb-2 text-black hover:text-red-600 transition-colors line-clamp-2">
          {result.title}
        </h3>
        <div className="font-sans text-xs text-gray-500 mt-auto pt-2 border-t border-gray-100">
          <span>{result.author}</span>
          <span className="mx-2">|</span>
          <span>{result.date}</span>
        </div>
      </Link>
    </div>
  );

  return (
    <div
      className="search-overlay fixed inset-0 bg-[#ffedd9] z-40 pt-[150px] overflow-y-auto transition-opacity duration-300 ease-in-out"
    >
      <div className="max-w-4xl mx-auto p-6">
        <h2 className="font-oswald text-4xl text-black text-center mb-12 uppercase">
          SEARCH HERE
        </h2>

        {/* Search Bar */}
        <form onSubmit={handleFormSubmit} className="mb-16">
          <div className="flex items-center border border-black rounded-[50px] bg-white p-2.5 shadow-lg">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="TYPE SOMETHING........"
              className="font-sans text-lg w-full bg-transparent outline-none px-6 py-2.5 placeholder:text-gray-400"
              aria-label="Search input"
              autoFocus
            />
            {/* Button is mostly visual now, or for instant search if clicked */}
            <button
              type="submit"
              disabled={loading}
              className="ml-4 flex-shrink-0 bg-red-600 rounded-full p-3 transition-transform duration-200 hover:scale-105 disabled:opacity-70"
              aria-label="Submit search"
            >
              {loading ? (
                <Loader2 className="w-6 h-6 text-white animate-spin" />
              ) : (
                <Search className="w-6 h-6 text-white" />
              )}
            </button>
          </div>
        </form>

        {/* Results Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {results.map((result, index) => (
            <ResultCard key={result.id || index} result={result} />
          ))}
        </div>

        {/* Empty State Message */}
        {hasSearched && !loading && results.length === 0 && query.trim() !== '' && (
            <div className="text-center text-gray-500 mt-10">
                <p className="font-sans text-lg">No results found for &quot;{query}&quot;</p>
            </div>
        )}

        {/* See More Button */}
        {results.length > 0 && (
            <div className="text-center mt-12">
                <button className="bg-red-600 text-white font-bold py-3 px-12 rounded-full border border-red-600 transition-all duration-300 hover:bg-white hover:text-red-600 shadow-xl">
                    SEE MORE
                </button>
            </div>
        )}
      </div>
    </div>
  );
}