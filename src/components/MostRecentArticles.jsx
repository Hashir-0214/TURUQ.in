
// src/components/MostRecentArticles.jsx
'use client';

import Image from "next/image";
import Tag from "./ui/tag";

export default function MostRecentArticles({ articles }) {
  
  if (!articles || articles.length === 0) {
    return (
      <div className="flex justify-center items-center h-48">
        <p className="text-xl font-medium text-gray-500">No articles found.</p>
      </div>
    );
  }

  const mainArticle = articles[0];
  const sideArticles = articles.slice(1, 5); 

  return (
    <div className="recent-side-articles mx-auto grid w-[83%] max-w-[1250px] grid-cols-1 lg:grid-cols-2 gap-5">

      {/* Main Article Block */}
      {mainArticle && (
        <article className="side-article lg:row-span-4 flex flex-col gap-5 rounded-xl border border-black p-5 transition-all hover:-translate-y-1 hover:shadow-lg" data-aos="fade-up">
          
          {/* Main Image */}
          <div className="side-article-image w-full rounded-xl overflow-hidden aspect-video">
            <Image
              loader={({ src }) => src}
              src={mainArticle.imageSrc}
              alt={mainArticle.title}
              width={600}
              height={338}
              sizes="(max-width: 768px) 100vw, 50vw"
              className="h-full w-full object-cover transition-transform hover:scale-105"
              style={{ width: '100%', height: '100%' }}
              onError={(e) => { e.currentTarget.src = 'https://placehold.co/1200x675/ccc/333?text=Image+Load+Error'; }}
            />
          </div>

          <div className="w-full flex flex-col justify-between flex-1">
            
            <div className="flex gap-2 mb-2 flex-wrap">
              {mainArticle.categories.map((cat, index) => (
                <Tag key={index} link={cat.link}>{cat.name}</Tag> 
              ))}
            </div>

            <a href={`/${mainArticle.slug}`}> 
              {/* Responsive Text Size: Smaller on mobile, Large on Desktop */}
              <h4 className="side-article-title local-font-rachana text-[24px] sm:text-[40px] md:text-[50px] font-bold leading-7 lg:leading-[1.1] text-[#a82a2a] mt-2 hover:text-red-700 transition-colors">
                {mainArticle.title} 
              </h4>
            </a>

            <p className="side-article-description hidden local-font-rachana text-[16px] md:text-[20px] leading-relaxed font-normal text-black my-3 line-clamp-3 md:line-clamp-none">
              {mainArticle.description} 
            </p>

            <div className="article-meta flex items-center gap-2 mt-auto">
              <span className="author text-sm font-semibold text-black">{mainArticle.author}</span> 
              <span className="divider text-sm text-black">|</span>
              <span className="date text-sm font-normal text-black opacity-45">{mainArticle.date}</span> 
            </div>
          </div>
        </article>
      )}

      {/* Side Articles Block */}
      <div className="grid grid-cols-1 gap-5">
        {sideArticles.map((article, index) => (
          <article
            key={article.id}
            // Mobile: flex-col (Stacked like Featured). Desktop: flex-row (Side by side)
            className="side-article flex flex-col sm:flex-row items-start gap-5 rounded-xl border border-black p-5 transition-all hover:-translate-y-1 hover:shadow-lg"
            data-aos="fade-up"
            data-aos-delay={(index + 1) * 100} 
          >
            {/* Image Container */}
            {/* Mobile: Full Width, 200px Height. Desktop: Fixed Width Square */}
            <div className="side-article-image w-full h-[200px] sm:w-[160px] sm:h-[160px] lg:w-[180px] lg:h-[180px] shrink-0 rounded-xl overflow-hidden">
              <Image
                loader={({ src }) => src}
                src={article.imageSrc} 
                alt={article.title}
                width={180}
                height={180}
                className="h-full w-full object-cover transition-transform hover:scale-105"
                onError={(e) => { e.currentTarget.src = 'https://placehold.co/300x300/ccc/333?text=Image+Load+Error'; }}
              />
            </div>

            {/* Content Container */}
            <div className="side-article-content w-full flex flex-col justify-between sm:h-[160px] lg:h-[180px] gap-2">
              
              <div className="flex flex-col gap-2">
                <div className="flex gap-2 flex-wrap">
                  {article.categories.map((cat, catIndex) => (
                    <Tag key={catIndex} link={cat.link}>{cat.name}</Tag> 
                  ))}
                </div>

                <a href={`/${article.slug}`}> 
                  {/* Title Size adjusted for balance */}
                  <h4 className="side-article-title local-font-rachana text-[24px] md:text-[26px] font-bold leading-7 text-[#a82a2a] hover:text-red-700 transition-colors line-clamp-3">
                    {article.title}
                  </h4>
                </a>
              </div>

              <div className="article-meta flex items-center gap-2 mt-auto">
                <span className="author text-xs font-semibold text-black">{article.author}</span> 
                <span className="divider text-xs text-black">|</span>
                <span className="date text-xs font-normal text-black opacity-45">{article.date}</span> 
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}