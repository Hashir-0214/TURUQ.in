"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image"; // Ensure Image is imported
import { ArrowRight } from "lucide-react";
import Tag from "../ui/tag";
import "@/app/search-articlecard.css";

// Utility to strip HTML tags for preview text
const stripHtml = (html) => {
  if (!html) return "";
  if (typeof window !== "undefined") {
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  }
  return html.replace(/<[^>]*>?/gm, "");
};

export default function CategoryOverlay({ isOpen, onClose }) {
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [articlesCache, setArticlesCache] = useState({});
  const [activeCategorySlug, setActiveCategorySlug] = useState(null);
  const [activeSubCategorySlug, setActiveSubCategorySlug] = useState(null);
  const [loading, setLoading] = useState(false);
  const [articlesLoading, setArticlesLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const fetchMetaData = async () => {
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
  }, [isOpen]);

  const activeCategory = categories.find((c) => c.slug === activeCategorySlug);

  const currentSubCategories = activeCategory
    ? subCategories.filter((sub) => sub.parent_id === activeCategory._id)
    : [];

  const getCacheKey = () => {
    return activeSubCategorySlug
      ? `sub:${activeSubCategorySlug}`
      : `cat:${activeCategorySlug}`;
  };

  useEffect(() => {
    const fetchArticles = async () => {
      if (!activeCategorySlug) return;

      const cacheKey = getCacheKey();

      if (articlesCache[cacheKey]) {
        setArticlesLoading(false);
        return;
      }

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

          const mappedData = rawData.map((post) => {
            const previewText = post.excerpt
              ? post.excerpt
              : stripHtml(post.content).substring(0, 150) + "...";

            // Prepare subcategory object with Name AND Link
            const subObj = post.subcategory_ids?.[0];
            const subcategoryData = subObj
              ? {
                  name: subObj.name,
                  link: `/category/${activeCategory?.slug}/${subObj.slug}`,
                }
              : null;

            return {
              _id: post._id,
              title: post.title,
              content: previewText,
              image: post.featured_image || "https://placehold.co/600x400",
              link: `/${post.slug}`,
              category: activeCategory?.name,
              subcategory: subcategoryData,
              author: post.author_id?.name || "Author",
              date: new Date(post.created_at).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              }),
            };
          });

          setArticlesCache((prev) => ({
            ...prev,
            [cacheKey]: mappedData,
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

  const handleCategoryInteraction = (slug) => {
    if (slug === activeCategorySlug) return;
    setActiveCategorySlug(slug);
    setActiveSubCategorySlug(null);
  };

  const handleSubCategoryHover = (slug) => {
    if (slug === activeSubCategorySlug) return;
    setActiveSubCategorySlug(slug);
  };

  const currentArticles = articlesCache[getCacheKey()] || [];

  if (!isOpen) return null;

  return (
    <div className="menu-overlay fixed inset-0 bg-[#ffedd9] z-40 pt-[150px] overflow-y-auto transition-opacity duration-300 ease-in-out">
      <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8">
        <div className="flex h-full min-h-[calc(100vh-150px)] flex-col lg:flex-row">
          {/* --- LEFT SIDEBAR: CATEGORIES --- */}
          <div className="w-full lg:w-1/4 pt-10 pb-4 lg:pb-10 lg:border-r border-gray-300 lg:pr-8">
            {loading ? (
              <div className="space-y-4 animate-pulse">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-8 bg-gray-300 rounded w-3/4"></div>
                ))}
              </div>
            ) : (
              <nav className="flex flex-col flex-wrap lg:block gap-x-6">
                {categories.map((cat) => (
                  <button
                    key={cat.slug}
                    onMouseEnter={() => handleCategoryInteraction(cat.slug)}
                    onClick={() => handleCategoryInteraction(cat.slug)}
                    onFocus={() => handleCategoryInteraction(cat.slug)}
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
            {/* Subcategories Header Area */}
            <div className="flex flex-wrap items-center justify-between mb-6 border-b border-red-600 pb-3 min-h-[50px]">
              <div className="flex flex-wrap gap-3 items-center">
                {currentSubCategories.length > 0 ? (
                  currentSubCategories.map((sub) => (
                    <div
                      key={sub.slug}
                      onMouseEnter={() => handleSubCategoryHover(sub.slug)}
                      onFocus={() => handleSubCategoryHover(sub.slug)}
                      className="inline-block"
                    >
                      <Tag
                        className={
                          activeSubCategorySlug === sub.slug
                            ? "bg-red-600 text-white"
                            : ""
                        }
                        link={
                          activeCategory
                            ? `/category/${activeCategory.slug}/${sub.slug}`
                            : "#"
                        }
                        onClick={onClose}
                      >
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

              {activeCategory && (
                <Link
                  href={`/category/${activeCategory.slug}`}
                  onClick={onClose}
                  className="flex items-center gap-2 text-sm font-bold text-red-600 hover:text-black transition-colors uppercase ml-auto whitespace-nowrap pl-4"
                >
                  Go to {activeCategory.name}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </div>

            {/* Grid */}
            {articlesLoading ? (
              <div className="flex items-center justify-center h-40">
                <p className="text-gray-500 animate-pulse">
                  Loading articles...
                </p>
              </div>
            ) : (
              // RESTORED: Responsive Grid (1 col mobile, 2 cols desktop)
              <div className="gap-8">
                {currentArticles.length > 0 ? (
                  currentArticles.map((article, index) => {
                    const subName = article.subcategory?.name?.toUpperCase();
                    const subLink = article.subcategory?.link;

                    return (
                      <div
                        key={article._id || index}
                        className="search-article-card-container h-full"
                      >
                        {/* INLINED CARD COMPONENT */}
                        <div className="search-article-card rounded-2xl flex flex-col overflow-hidden bg-[#ffedd9] border border-gray-500 shadow-xl hover:shadow-2xl transition-shadow duration-300 h-full p-6">
                          {/* Article Image */}
                          <Link
                            href={article.link || "#"}
                            onClick={onClose}
                            className="search-article-image-container w-full block relative w-full"
                          >
                            <div className="w-full h-60 relative overflow-hidden rounded-2xl">
                              <Image
                                src={article.image}
                                alt={article.title || "Article Image"}
                                fill
                                sizes="(max-width: 768px) 100vw, 50vw"
                                className="object-cover transition-transform duration-500 hover:scale-105"
                                onError={(e) => {
                                  e.currentTarget.src =
                                    "https://placehold.co/600x400/ccc/333?text=Image+Missing";
                                }}
                              />
                            </div>
                          </Link>

                          {/* Content */}
                          <div className="search-article-content-container max-h-[240px] w-full px-4 sm:px-6 flex flex-col justify-between">
                            <div className="flex items-center">
                              {subName && (
                                <Tag
                                  link={subLink}
                                  className="z-50 relative"
                                  onClick={onClose}
                                >
                                  {subName}
                                </Tag>
                              )}
                            </div>
                            <div className="flex flex-col gap-1">
                              <Link
                                href={article.link || "#"}
                                onClick={onClose}
                              >
                                <h3 className="local-font-rachana font-bold text-[24px] sm:text-[30px] cursor-pointer leading-[32px] text-red-600 hover:text-red-700 transition-colors line-clamp-2">
                                  {article.title}
                                </h3>
                              </Link>

                              {/* Content Preview */}
                              <div className="local-font-rachana text-gray-700 line-clamp-4 text-base sm:text-[18px] leading-[20px]">
                                {article.content}
                              </div>
                            </div>

                            <div className="text-sm border-t border-gray-100 flex items-center gap-2">
                              <span className="font-poppins font-semibold text-xs text-black">
                                {article.author}
                              </span>
                              <span className="text-gray-400 font-semibold text-sm">
                                |
                              </span>
                              <span className="text-xs font-semibold text-gray-500">
                                {article.date}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-gray-500 local-font-rachana text-lg mt-4 col-span-full">
                    No highlights available for{" "}
                    {activeSubCategorySlug
                      ? "this subcategory"
                      : activeCategory?.name}
                    .
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
