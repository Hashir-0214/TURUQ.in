// src/components/FeaturedArticles.jsx
'use client'; 

import Tag from "./ui/tag";

export default function FeaturedArticles({ articles }) {
  
  if (!articles || articles.length === 0) {
    return (
      <div className="flex justify-center items-center h-48">
        <p className="text-xl font-medium text-gray-500">No featured articles found.</p>
      </div>
    );
  }
    
  return (
    <div className="articles-grid mx-auto grid w-[83%] max-w-[1250px] grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
      {articles.map((article, index) => (
        <article
          key={article.id}
          className="article-card rounded-xl border border-black p-5 transition-all duration-500 ease-in-out hover:-translate-y-1 hover:shadow-lg"
          data-aos="fade-up"
          data-aos-delay={(index + 1) * 100}
        >
          {/* Image - Use article.imageSrc directly */}
          <div className="article-image mb-4 h-[250px] w-full overflow-hidden rounded-xl">
              <img
                  src={article.imageSrc} // DYNAMIC
                  alt={article.titleMalayalam}
                  className="h-full w-full object-cover transition-transform hover:scale-105"
                  style={{ width: '100%', height: '250px', objectFit: 'cover' }}
                  onError={(e) => { e.currentTarget.src = 'https://placehold.co/400x250/ccc/333?text=Image+Missing'; }}
              />
          </div>

          <div className="flex h-[130px] flex-col justify-between">
            <div className="article-content flex h-auto flex-col">
              <div className="flex gap-2">
                {/* Use article.categories directly */}
                {article.categories.map((cat, catIndex) => (
                  <Tag key={catIndex} link={cat.link}>
                    {cat.name}
                  </Tag>
                ))}
              </div>
            </div>
            {/* Title - Use article.slug directly */}
            <a href={`/${article.slug}`}>
              <h3 className="article-title local-font-rachana text-[25px] h-[70px] overflow-hidden font-bold leading-[22px] py-1 text-[#a82a2a] hover:text-red-700 transition-colors">
                {article.titleMalayalam} {/* DYNAMIC */}
              </h3>
            </a>
            <div className="article-meta flex items-center gap-2">
              <span className="author text-xs font-normal text-black">
                {article.author}
              </span>{' '}
              <span className="divider text-xs text-black">|</span>
              <span className="date text-xs font-normal text-black opacity-45">
                {article.date}
              </span>{' '}
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
