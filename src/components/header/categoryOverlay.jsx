"use client";

import { useState, useEffect } from "react";
import ArticleGridCard from "../reusable/ArticleGridCard";
import Tag from "../ui/tag";

export default function CategoryOverlay({ isOpen, onClose }) {
  // --- STATE MANAGEMENT ---
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  
  // CACHE STATE: Stores data we've already fetched
  // Format: { "category-slug": [articles], "subcategory-slug": [articles] }
  const [articlesCache, setArticlesCache] = useState({}); 

  // Selection State
  const [activeCategorySlug, setActiveCategorySlug] = useState(null);
  const [activeSubCategorySlug, setActiveSubCategorySlug] = useState(null);

  // Loading State
  const [loading, setLoading] = useState(false); // For initial menu load
  const [articlesLoading, setArticlesLoading] = useState(false); // For specific grid load

  // --- 1. FETCH METADATA (Categories & Subcategories) ---
  useEffect(() => {
    if (isOpen) {
      const fetchMetaData = async () => {
        // Only fetch if we haven't loaded categories yet
        if (categories.length > 0) return;

        setLoading(true);
        try {
          const [catRes, subCatRes] = await Promise.all([
            fetch("/api/categories"),
            fetch("/api/subcategories"),
          ]);

          const catsData = await catRes.json();
          const subCatsData = await subCatRes.json();

          if (Array.isArray(catsData)) {
            setCategories(catsData);
            if (!activeCategorySlug && catsData.length > 0) {
              setActiveCategorySlug(catsData[0].slug);
            }
          }

          if (Array.isArray(subCatsData)) {
            setSubCategories(subCatsData);
          }
        } catch (error) {
          console.error("Error fetching metadata:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchMetaData();
    }
  }, [isOpen]); // Removed dependencies to prevent re-fetching

  // --- 2. DERIVED STATE ---
  const activeCategory = categories.find((c) => c.slug === activeCategorySlug);

  const currentSubCategories = activeCategory
    ? subCategories.filter((sub) => sub.parent_id === activeCategory._id)
    : [];

  // Helper to determine the unique key for the cache
  const getCacheKey = () => {
    return activeSubCategorySlug 
      ? `sub:${activeSubCategorySlug}` 
      : `cat:${activeCategorySlug}`;
  };

  // --- 3. FETCH ARTICLES (WITH CACHING) ---
  useEffect(() => {
    const fetchArticles = async () => {
      if (!activeCategorySlug) return;

      const cacheKey = getCacheKey();

      // STRATEGY: Check Cache First
      if (articlesCache[cacheKey]) {
        // Data exists! No loading, just use it.
        setArticlesLoading(false);
        return;
      }

      // Data not in cache, fetch from API
      setArticlesLoading(true);
      try {
        let url = `/api/articles?`;

        if (activeSubCategorySlug) {
          url += `subcategory=${activeSubCategorySlug}`;
        } else {
          url += `category=${activeCategorySlug}`;
        }

        const res = await fetch(url);

        if (res.ok) {
          const rawData = await res.json();
          
          // MAPPING: Convert DB format to ArticleGridCard props format
          const mappedData = rawData.map(post => ({
            _id: post._id,
            title: post.title,
            image: post.featured_image || 'https://placehold.co/600x400',
            link: `/article/${post.slug}`, // Assuming you have an article page
            category: activeCategory?.name, // Use current context name
            subcategory: post.subcategory_ids?.[0]?.name, // Optional: Grab first subcat name
            author: post.author_id?.name || 'Author',
            date: new Date(post.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
          }));

          // SAVE TO CACHE
          setArticlesCache(prev => ({
            ...prev,
            [cacheKey]: mappedData
          }));
        }
      } catch (error) {
        console.error("Error fetching articles:", error);
      } finally {
        setArticlesLoading(false);
      }
    };

    if (isOpen && activeCategorySlug) {
      fetchArticles();
    }
  }, [activeCategorySlug, activeSubCategorySlug, isOpen]);

  // --- HANDLERS ---
  const handleCategoryChange = (slug) => {
    if (slug === activeCategorySlug) return;
    setActiveCategorySlug(slug);
    setActiveSubCategorySlug(null);
  };

  const handleSubCategoryClick = (slug) => {
    setActiveSubCategorySlug(slug);
  };

  // Get articles from cache for rendering
  const currentArticles = articlesCache[getCacheKey()] || [];

  if (!isOpen) return null;

  return (
    <div className="menu-overlay fixed inset-0 bg-[#ffedd9] z-40 pt-[150px] overflow-y-auto transition-opacity duration-300 ease-in-out">
      <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8">
        <div className="flex h-full min-h-[calc(100vh-150px)] flex-col lg:flex-row">
          
          {/* --- LEFT SIDEBAR --- */}
          <div className="w-full lg:w-1/4 pt-10 pb-4 lg:pb-10 lg:border-r border-gray-300 lg:pr-8">
            {loading ? (
              <div className="space-y-4 animate-pulse">
                {[1,2,3,4].map(i => <div key={i} className="h-8 bg-gray-300 rounded w-3/4"></div>)}
              </div>
            ) : (
              <nav className="flex flex-col flex-wrap lg:block gap-x-6">
                {categories.map((cat) => (
                  <button
                    key={cat.slug}
                    onMouseEnter={() => handleCategoryChange(cat.slug)}
                    onClick={() => handleCategoryChange(cat.slug)}
                    onFocus={() => handleCategoryChange(cat.slug)}
                    className={`text-left flex font-oswald uppercase text-xl lg:text-4xl mb-4 lg:mb-6 transition-colors focus:outline-none ${
                      cat.slug === activeCategorySlug
                        ? "text-red-600 font-bold"
                        : "text-black hover:text-red-600"
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </nav>
            )}
            <div className="w-full h-px bg-gray-300 mt-6 lg:hidden"></div>
          </div>

          {/* --- RIGHT AREA --- */}
          <div className="w-full lg:w-3/4 overflow-y-auto py-10 lg:pl-8">
            
            {/* Subcategories */}
            <div className="flex flex-wrap gap-3 items-center mb-6 border-b border-red-600 pb-3 min-h-[50px]">
              {currentSubCategories.length > 0 ? (
                currentSubCategories.map((sub) => (
                  <div
                    key={sub.slug}
                    onClick={() => handleSubCategoryClick(sub.slug)}
                    className="cursor-pointer"
                  >
                    <Tag className={activeSubCategorySlug === sub.slug ? "bg-red-600 text-white" : ""}>
                      {sub.name}
                    </Tag>
                  </div>
                ))
              ) : (
                <span className="text-gray-400 text-sm italic">
                  {activeCategory ? `Viewing ${activeCategory.name}` : ""}
                </span>
              )}
            </div>

            {/* Grid */}
            {articlesLoading ? (
              <div className="flex items-center justify-center h-40">
                <p className="text-gray-500 animate-pulse">Loading articles...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-8">
                {currentArticles.length > 0 ? (
                  currentArticles.map((article, index) => (
                    <div
                      key={article._id || index}
                      className={index === 0 ? "sm:col-span-2" : ""}
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
                    No highlights available for {activeSubCategorySlug ? "this subcategory" : activeCategory?.name}.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}