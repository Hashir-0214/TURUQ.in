// src/components/reusable/ArticleGridCard.jsx

import Tag from "../ui/tag";

/**
 * Displays an article in the visual grid card style.
 * @param {object} props
 * @param {object} props.article 
 * @param {function} props.onClose 
 * @param {boolean} [props.isFeatured=false] 
 */
export default function ArticleGridCard({
  article,
  onClose,
  isFeatured = false,
}) {
  const mainCategory = article.category?.toUpperCase() || "GENERAL";
  const subCategory = article.subcategory
    ? article.subcategory.toUpperCase()
    : null;

  const imageHeightClass = isFeatured ? "h-60" : "h-60";

  const cardLayoutClass = isFeatured
    ? "flex-col sm:flex-row-reverse"
    : "flex-col";

  const imageWrapperClass = isFeatured ? "w-full sm:w-3/5" : "w-full";

  return (
    <div
      className={`rounded-2xl flex overflow-hidden bg-[#ffedd9] border border-gray-500 shadow-xl hover:shadow-2xl transition-shadow duration-300 ${cardLayoutClass}`}
    >
      {/* Article Image/Visual Link */}
      <a href={article.link} onClick={onClose} className={`p-4 ${imageWrapperClass}`}>
        <div
          className={`w-full ${imageHeightClass} bg-cover bg-center rounded-2xl`}
          style={{ backgroundImage: `url(${article.image})` }}
          role="img"
          aria-label={`Visual for ${article.title}`}
        />
      </a>

      {/* Article Content */}
      <div className="p-4 sm:p-6 flex-1 flex flex-col justify-between">
        {/* Category Tags */}
        <div className="flex gap-2 mb-3">
          <Tag className="poppins-regular text-[10px] sm:text-xs bg-gray-100 px-2 py-1 rounded-full border border-gray-300 uppercase font-medium">
            {mainCategory}
          </Tag>
          {subCategory && (
            <Tag className="poppins-regular text-[10px] sm:text-xs bg-gray-100 px-2 py-1 rounded-full border border-gray-300 uppercase font-medium">
              {subCategory}
            </Tag>
          )}
        </div>

        {/* Article Title */}
        <h3
          className={`local-font-rachana font-bold mt-2 mb-3 cursor-pointer text-red-600 transition-colors line-clamp-2 ${
            isFeatured ? "text-2xl sm:text-3xl" : "text-xl sm:text-2xl"
          }`}
        >
          <a href={article.link} onClick={onClose}>
            {article.title}
          </a>
        </h3>

        {/* Author and Date */}
        <div className="text-sm pt-2 border-t border-gray-100 mt-4 flex items-center gap-2">
          {/* Author Name - Black, Semibold/Bold */}
          <span className="font-poppins font-semibold text-xs text-black">
            {article.author}
          </span>

          {/* Divider | */}
          <span className="text-gray-400 font-semibold text-sm">|</span>

          {/* Date - Gray, Semibold */}
          <span className="text-xs font-semibold text-gray-500">
            {article.date}
          </span>
        </div>
      </div>
    </div>
  );
}