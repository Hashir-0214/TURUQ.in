// src/components/header/CategoryOverlay.jsx
"use client";

import { useState } from "react";
import ArticleGridCard from "../reusable/ArticleGridCard";

const categories = [
  { name: "FICTION", slug: "fiction" },
  { name: "ARTICLES", slug: "articles", active: true },
  { name: "PHOTO ESSAY", slug: "photo-essay" },
  { name: "SERIES", slug: "series" },
  { name: "REVIEW", slug: "review" },
  { name: "INTERVIEW", slug: "interview" },
  { name: "PODCAST", slug: "podcast" },
];

// Re-defining sampleArticles with a category_slug for tab filtering
const sampleArticles = [
  {
    title: "റബീഅ് സുഗന്ധം പരക്കുന്ന മൊറോക്കൻ വിഭവങ്ങൾ",
    excerpt:
      "മൊറോക്കൻ സംസ്കാരവും മതവും സംഗമിക്കുന്ന ദിനമാണ് ഈദുൽ മൗലിദ്. മൊറോക്കൊയിലെ ഒരോ...",
    author: "സിനാൻ കാടൻ",
    date: "22 MAY 2025",
    category: "UNITED",
    link: "#",
    image:
      "https://placehold.co/1200x500/525252/FFFFFF?text=Featured+Article+Image", // Larger size for featured card
    category_slug: "articles",
  },
  {
    title: "അൽഫോൻസാമ്മയുടെ സന്ദേശം",
    excerpt:
      "ഒരുപാട് മനോഹരമായ കാഴ്ചകളാലും സംഗീതത്താലും നിറഞ്ഞ ഒരു ലോകം... മൊറോക്കോൻ പശ്ചാത്തലത്തിൽ...",
    author: "മുഹമ്മദ് സൽമാൻ",
    date: "10 MAY 2025",
    category: "LITERATURE",
    link: "#",
    image: "https://placehold.co/600x400/808080/FFFFFF?text=Visual+2",
    category_slug: "articles",
  },
  {
    title: "മറ്റൊരു ഫിക്ഷൻ ആർട്ടിക്കിൾ",
    excerpt:
      "ഇതൊരു സാങ്കൽപ്പിക കഥയുടെ ചെറിയൊരു ഭാഗമാണ്. വായനക്കാരെ ആകർഷിക്കാനുള്ള...",
    author: "അജ്ഞാതൻ",
    date: "05 MAY 2025",
    category: "FICTION",
    link: "#",
    image: "https://placehold.co/600x400/CC6666/FFFFFF?text=Fiction+Cover",
    category_slug: "articles", // Changed to 'articles' so it appears in the default view
  },
  // Adding one more for a better visual grid
  {
    title: "പ്രധാനപ്പെട്ട നാലാമത്തെ വാർത്ത",
    excerpt: "നാലാമത്തെ വാർത്തയുടെ ചെറിയ വിവരണം ഇവിടെ നൽകിയിരിക്കുന്നു...",
    author: "സമീർ",
    date: "01 MAY 2025",
    category: "NEWS",
    link: "#",
    image: "https://placehold.co/600x400/3399CC/FFFFFF?text=News+Update",
    category_slug: "articles",
  },
];

/**
 * Overlay component for displaying categories and featured content.
 * @param {object} props
 * @param {boolean} props.isOpen - Controls the visibility of the overlay.
 * @param {function} props.onClose - Function to close the overlay.
 */
export default function CategoryOverlay({ isOpen, onClose }) {
  // Find the initial active category slug
  const initialActiveSlug =
    categories.find((c) => c.active)?.slug || "articles";
  const [activeTabSlug, setActiveTabSlug] = useState(initialActiveSlug);

  if (!isOpen) return null;

  const activeCategory = categories.find((c) => c.slug === activeTabSlug);
  const activeCategoryName = activeCategory?.name || "ARTICLES";

  // Filter articles for the active tab (Simulating the tab content)
  const filteredArticles = sampleArticles.filter(
    (article) => article.category_slug === activeTabSlug
  );

  const handleCategoryClick = (slug) => {
    setActiveTabSlug(slug);
    // In a real application, you would trigger a data fetch here to load articles for 'slug'
  };

  return (
    <div className="menu-overlay fixed inset-0 bg-[#ffedd9] z-40 pt-[150px] overflow-y-auto transition-opacity duration-300 ease-in-out">
      <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8">
        <div className="flex h-full min-h-[calc(100vh-150px)] flex-col lg:flex-row">
          {/* Left Sidebar with Categories (Tabs) */}
          <div className="w-full lg:w-1/4 pt-10 pb-4 lg:pb-10 lg:border-r border-gray-300 lg:pr-8">
            <h4 className="font-sans text-xs uppercase text-gray-500 mb-6 tracking-widest">
              Categories
            </h4>
            <nav className="flex flex-col flex-wrap lg:block gap-x-6">
              {categories.map((cat) => (
                <button
                  key={cat.slug}
                  onClick={() => handleCategoryClick(cat.slug)}
                  className={`text-left flex font-oswald uppercase text-xl lg:text-4xl mb-4 lg:mb-6 transition-colors focus:outline-none ${
                    cat.slug === activeTabSlug
                      ? "text-red-600 font-bold"
                      : "text-black hover:text-red-600"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </nav>
            <div className="w-full h-px bg-gray-300 mt-6 lg:hidden"></div>
          </div>

          {/* Main Content Area (Articles for the Active Tab) */}
          <div className="w-full lg:w-3/4 overflow-y-auto py-10 lg:pl-8">
            <div className="flex justify-between items-center mb-6 border-b border-red-600 pb-3">
              <h4 className="font-oswald text-sm uppercase text-red-600 font-bold">
                {activeCategoryName} HIGHLIGHTS
              </h4>
              <a
                href={`/category/${activeTabSlug}`}
                onClick={onClose}
                className="text-sm text-gray-600 hover:text-black transition-colors"
              >
                View All {activeCategoryName} &rarr;
              </a>
            </div>

            {/* DYNAMIC GRID LAYOUT */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-8">
              {filteredArticles.length > 0 ? (
                filteredArticles.map((article, index) => (
                  <div
                    key={index}
                    className={
                      index === 0
                        ? "sm:col-span-2 transition-all duration-500 ease-in-out"
                        : "transition-all duration-500 ease-in-out"
                    }
                  >
                    <ArticleGridCard
                      article={article}
                      onClose={onClose}
                      isFeatured={index === 0}
                    />
                  </div>
                ))
              ) : (
                <p className="text-gray-500 local-font-rachana text-lg mt-4 col-span-full">
                  No highlights available for {activeCategoryName} at the
                  moment.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
