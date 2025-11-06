// src/components/header/CategoryOverlay.jsx
"use client";

const categories = [
  { name: "FICTION", slug: "fiction" },
  { name: "ARTICLES", slug: "articles", active: true }, // Highlighted as active
  { name: "PHOTO ESSAY", slug: "photo-essay" },
  { name: "SERIES", slug: "series" },
  { name: "REVIEW", slug: "review" },
  { name: "INTERVIEW", slug: "interview" },
  { name: "PODCAST", slug: "podcast" },
];

const sampleArticles = [
  {
    title: "റബീഅ് സുഗന്ധം പരക്കുന്ന മൊറോക്കൻ വിഭവങ്ങൾ",
    excerpt:
      "മൊറോക്കൻ സംസ്കാരവും മതവും സംഗമിക്കുന്ന ദിനമാണ് ഈദുൽ മൗലിദ്. മൊറോക്കൊയിലെ ഒരോ...",
    author: "സിനാൻ കാടൻ",
    date: "22 MAY 2025",
    category: "united",
    link: "#",
    image: "https://placehold.co/300x200/525252/FFFFFF?text=Article+Image+1",
  },
  {
    title: "അൽഫോൻസാമ്മയുടെ സന്ദേശം",
    excerpt:
      "ഒരുപാട് മനോഹരമായ കാഴ്ചകളാലും സംഗീതത്താലും നിറഞ്ഞ ഒരു ലോകം... മൊറോക്കോൻ പശ്ചാത്തലത്തിൽ...",
    author: "മുഹമ്മദ് സൽമാൻ",
    date: "10 MAY 2025",
    category: "literature",
    link: "#",
    image: "https://placehold.co/300x200/808080/FFFFFF?text=Article+Image+2",
  },
];

/**
 * Overlay component for displaying categories and featured content.
 * @param {object} props
 * @param {boolean} props.isOpen - Controls the visibility of the overlay.
 * @param {function} props.onClose - Function to close the overlay.
 */
export default function CategoryOverlay({ isOpen, onClose }) {
  if (!isOpen) return null;

  const activeCategory = categories.find((c) => c.active)?.name || "ARTICLES";

  const ArticleCard = ({ article }) => (
    <div className="flex flex-col sm:flex-row mb-10 border-b border-gray-300 pb-8 last:border-b-0">
      <div className="w-full sm:w-2/3 pr-0 sm:pr-6 order-2 sm:order-1">
        <span className="font-sans text-xs bg-gray-100 px-2 py-1 rounded-full border border-gray-300 uppercase">
          {article.category}
        </span>
        <h3 className="local-font-rachana text-2xl font-medium mt-4 mb-3 cursor-pointer hover:text-red-600 transition-colors">
          <a href={article.link} onClick={onClose}>
            {article.title}
          </a>
        </h3>
        <p className="local-font-rachana text-gray-600 mb-4 line-clamp-3">
          {article.excerpt}
        </p>
        <div className="font-sans text-sm text-gray-500">
          <span className="font-poppins">{article.author}</span>
          <span className="mx-2">|</span>
          <span>{article.date}</span>
        </div>
      </div>

      <div className="w-full sm:w-1/3 flex-shrink-0 mb-4 sm:mb-0 order-1 sm:order-2">
        <a href={article.link} className="block">
          <div
            className="w-full h-48 object-cover rounded-xl shadow-lg transition-transform duration-300 hover:scale-[1.02] bg-cover bg-center"
            style={{ backgroundImage: `url(${article.image})` }}
            role="img"
            aria-label={`Visual for ${article.title}`}
          />
        </a>
      </div>
    </div>
  );

  return (
    <div className="menu-overlay fixed inset-0 bg-[#ffedd9] z-40 pt-[150px] overflow-y-auto transition-opacity duration-300 ease-in-out">
      <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8">
        <div className="flex h-full min-h-[calc(100vh-150px)] flex-col lg:flex-row">
          {/* Left Sidebar with Categories */}
          <div className="w-full lg:w-1/4 pt-10 pb-4 lg:pb-10 lg:border-r border-gray-300 lg:pr-8">
            <h4 className="font-sans text-xs uppercase text-gray-500 mb-6 tracking-widest">
              Categories
            </h4>
            <nav className="flex flex-col flex-wrap lg:block gap-x-6">
              {categories.map((cat) => (
                <a
                  key={cat.slug}
                  href={`/category/${cat.slug}`}
                  onClick={onClose}
                  className={`flex font-oswald uppercase text-xl lg:text-4xl mb-4 lg:mb-6 cursor-pointer transition-colors ${
                    cat.active
                      ? "text-red-600"
                      : "text-black hover:text-red-600"
                  }`}
                >
                  {cat.name}
                </a>
              ))}
            </nav>
            <div className="w-full h-px bg-gray-300 mt-6 lg:hidden"></div>
          </div>

          <div className="w-full lg:w-3/4 overflow-y-auto py-10 lg:pl-8">
            <div className="flex justify-between items-center mb-6 border-b border-red-600 pb-3">
              <h4 className="font-oswald text-sm uppercase text-red-600 font-bold">
                {activeCategory} HIGHLIGHTS
              </h4>
              <a
                href={`/category/${activeCategory.toLowerCase()}`}
                onClick={onClose}
                className="text-sm text-gray-600 hover:text-black transition-colors"
              >
                View All &rarr;
              </a>
            </div>
            {sampleArticles.map((article, index) => (
              <ArticleCard key={index} article={article} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
