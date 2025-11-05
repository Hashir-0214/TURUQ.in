'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Search } from 'lucide-react';

// Sample data for search results
const searchResults = [
  {
    title: 'മാംഗ: ജാപ്പനീസ് കലാമണ്ഡലത്തിൽ ഇസ്ലാമിന്റെ',
    author: 'സിനാൻ',
    date: '22 MAY 2025',
    categories: ['UNITED', 'ARCHITECTURE'],
    link: '#',
    image: 'https://placehold.co/200x150/D64545/FFFFFF?text=Result+1',
  },
  {
    title: 'ചരിത്രത്തിന്റെ ഇരുണ്ട ഇടനാഴികൾ',
    author: 'സമീർ',
    date: '18 APR 2025',
    categories: ['HISTORY', 'FICTION'],
    link: '#',
    image: 'https://placehold.co/200x150/525252/FFFFFF?text=Result+2',
  },
  {
    title: 'പ്രകൃതി സൗഹൃദ വാസ്തുവിദ്യ',
    author: 'ജെയിംസ്',
    date: '01 MAR 2025',
    categories: ['ARCHITECTURE', 'SUSTAINABILITY'],
    link: '#',
    image: 'https://placehold.co/200x150/808080/FFFFFF?text=Result+3',
  },
];

/**
 * Overlay component for displaying the search interface and results.
 * @param {object} props
 * @param {boolean} props.isOpen - Controls the visibility of the overlay.
 * @param {function} props.onClose - Function to close the overlay.
 */
export default function SearchOverlay({ isOpen, onClose }) {
  if (!isOpen) return null;

  // Component to render a single search result card
  const ResultCard = ({ result }) => (
    <div className="border border-black rounded-xl p-4 transition-shadow duration-300 hover:shadow-xl bg-white">
      <Link href={result.link} onClick={onClose}>
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
          {result.categories.map((cat) => (
            <span
              key={cat}
              className="font-sans text-xs bg-gray-100 px-2 py-1 rounded-full border border-gray-300 uppercase"
            >
              {cat}
            </span>
          ))}
        </div>
        <h3 className="font-sans text-lg font-bold mb-2 text-black hover:text-red-600 transition-colors">
          {result.title}
        </h3>
        <div className="font-sans text-xs text-gray-500">
          <span>{result.author}</span>
          <span className="mx-2">|</span>
          <span>{result.date}</span>
        </div>
      </Link>
    </div>
  );

  const handleSearch = (e) => {
    e.preventDefault();
    // In a real application, you would make an API call here
    console.log('Search initiated with query...');
    // You could update state here to show new results
  };

  return (
    <div
      className="search-overlay fixed inset-0 bg-[#ffedd9] z-40 pt-[150px] overflow-y-auto transition-opacity duration-300 ease-in-out"
    >
      <div className="max-w-4xl mx-auto p-6">
        <h2 className="font-sans text-4xl font-extrabold text-black text-center mb-12 uppercase tracking-widest">
          SEARCH HERE
        </h2>

        {/* Search Bar - Styled to match the provided design */}
        <form onSubmit={handleSearch} className="mb-16">
          <div className="flex items-center border border-black rounded-[50px] bg-white p-2.5 shadow-lg">
            <input
              type="text"
              placeholder="TYPE SOMETHING........"
              className="font-sans text-lg w-full bg-transparent outline-none px-6 py-2.5 placeholder:text-gray-400"
              aria-label="Search input"
            />
            <button
              type="submit"
              className="ml-4 flex-shrink-0 bg-red-600 rounded-full p-3 transition-transform duration-200 hover:scale-105"
              aria-label="Submit search"
            >
              <Search className="w-6 h-6 text-white" />
            </button>
          </div>
        </form>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {searchResults.map((result, index) => (
            <ResultCard key={index} result={result} />
          ))}
        </div>

        <div className="text-center mt-12">
            <button className="bg-red-600 text-white font-bold py-3 px-12 rounded-full border border-red-600 transition-all duration-300 hover:bg-white hover:text-red-600 shadow-xl">
                SEE MORE
            </button>
        </div>
      </div>
    </div>
  );
}