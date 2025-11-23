"use client";

import { useState, useEffect } from "react";
import ArticleGridCard from "../reusable/ArticleGridCard";
import Tag from "../ui/tag";

export default function CategoryOverlay({ isOpen, onClose }) {
  // --- STATE MANAGEMENT ---
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [articles, setArticles] = useState([]);

  // Selection State
  const [activeCategorySlug, setActiveCategorySlug] = useState(null);
  const [activeSubCategorySlug, setActiveSubCategorySlug] = useState(null);

  // Loading State
  const [loading, setLoading] = useState(false);
  const [articlesLoading, setArticlesLoading] = useState(false);

  // Use the key for Admin routes (Categories/Subcats), but not for Articles
  const apiKey = process.env.NEXT_PUBLIC_API_KEY;

  // --- 1. FETCH METADATA (FIXED: Now actually fetches Categories/Subcats) ---
  useEffect(() => {
    if (isOpen) {
      const fetchMetaData = async () => {
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
            // Automatically select the first category so the screen isn't empty
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
  }, [isOpen, apiKey]); // Removed activeCategorySlug to prevent reset loops

  // --- 2. DERIVED STATE ---
  const activeCategory = categories.find((c) => c.slug === activeCategorySlug);

  // Filter subcategories: Only show ones belonging to the selected Category
  const currentSubCategories = activeCategory
    ? subCategories.filter((sub) => sub.parent_id === activeCategory._id)
    : [];

  // --- 3. FETCH ARTICLES (FIXED: Uses the public /api/articles route) ---
  useEffect(() => {
    const fetchArticles = async () => {
      if (!activeCategorySlug) return;

      setArticlesLoading(true);
      try {
        // Use the PUBLIC route we created in the previous step
        let url = `/api/articles?`;

        if (activeSubCategorySlug) {
          url += `subcategory=${activeSubCategorySlug}`;
        } else {
          url += `category=${activeCategorySlug}`;
        }

        // No API Key needed for the public articles route
        const res = await fetch(url);

        if (res.ok) {
          const data = await res.json();
          setArticles(data);
        } else {
          setArticles([]);
        }
      } catch (error) {
        console.error("Error fetching articles:", error);
        setArticles([]);
      } finally {
        setArticlesLoading(false);
      }
    };

    if (isOpen && activeCategorySlug) {
      fetchArticles();
    }
  }, [activeCategorySlug, activeSubCategorySlug, isOpen]);

  // --- HANDLERS ---
  const handleCategoryClick = (slug) => {
    setActiveCategorySlug(slug);
    setActiveSubCategorySlug(null); // Reset subcategory when switching main tabs
  };

  const handleSubCategoryClick = (slug) => {
    setActiveSubCategorySlug(slug);
  };

  if (!isOpen) return null;

  return (
    <div className="menu-overlay fixed inset-0 bg-[#ffedd9] z-40 pt-[150px] overflow-y-auto transition-opacity duration-300 ease-in-out">
      <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8">
        <div className="flex h-full min-h-[calc(100vh-150px)] flex-col lg:flex-row">
          {/* --- LEFT SIDEBAR: CATEGORIES --- */}
          <div className="w-full lg:w-1/4 pt-10 pb-4 lg:pb-10 lg:border-r border-gray-300 lg:pr-8">
            <h4 className="font-sans text-xs uppercase text-gray-500 mb-6 tracking-widest">
              Categories
            </h4>

            {loading ? (
              <p className="text-gray-400 animate-pulse">Loading...</p>
            ) : (
              <nav className="flex flex-col flex-wrap lg:block gap-x-6">
                {categories.map((cat) => (
                  <button
                    key={cat.slug}
                    onClick={() => handleCategoryClick(cat.slug)}
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

          {/* --- RIGHT AREA: SUBCATEGORIES & ARTICLES --- */}
          <div className="w-full lg:w-3/4 overflow-y-auto py-10 lg:pl-8">
            {/* Subcategory Bar */}
            <div className="flex flex-wrap gap-3 items-center mb-6 border-b border-red-600 pb-3 min-h-[50px]">
              {currentSubCategories.length > 0 ? (
                currentSubCategories.map((sub) => (
                  <div
                    key={sub.slug}
                    onClick={() => handleSubCategoryClick(sub.slug)}
                    className="cursor-pointer"
                  >
                    <Tag
                      className={
                        activeSubCategorySlug === sub.slug
                          ? "bg-red-600 text-white"
                          : ""
                      }
                    >
                      {sub.name}
                    </Tag>
                  </div>
                ))
              ) : (
                <span className="text-gray-400 text-sm italic">
                  {activeCategory
                    ? `Viewing ${activeCategory.name}`
                    : "Select a category"}
                </span>
              )}
            </div>

            {/* Dynamic Grid Layout */}
            {articlesLoading ? (
              <div className="flex items-center justify-center h-40">
                <p className="text-gray-500 animate-pulse">
                  Loading articles...
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-8">
                {articles.length > 0 ? (
                  articles.map((article, index) => (
                    <div
                      key={article._id || index}
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
                    No highlights available for{" "}
                    {activeSubCategorySlug
                      ? "this subcategory"
                      : activeCategory?.name}{" "}
                    at the moment.
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
