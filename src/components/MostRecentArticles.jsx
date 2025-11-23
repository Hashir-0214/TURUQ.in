// src/components/MostRecentArticles.jsx
'use client';

import Image from "next/image";
import Tag from "./ui/tag";

export default function MostRecentArticles({ articles }) {
  
  if (!articles || articles.length === 0) {
    return (
      <div className="flex justify-center items-center h-48">
        <p className="text-xl font-medium text-gray-500">No recent articles found.</p>
      </div>
    );
  }

  const mainArticle = articles[0];
  const sideArticles = articles.slice(1, 5); 

  return (
    <div className="recent-side-articles mx-auto grid w-[83%] max-w-[1250px] grid-cols-1 lg:grid-cols-2 gap-5">

      {/* Main Article Block - The absolute latest article */}
      {mainArticle && (
        <article className="side-article lg:row-span-4 flex flex-col gap-5 rounded-2xl border border-black p-5 transition-all hover:-translate-y-1 hover:shadow-lg" data-aos="fade-up">
          
          {/* Image - Use mainArticle.imageSrc directly */}
          <div className="side-article-image w-full rounded-2xl overflow-hidden aspect-video">
            <Image
              src={mainArticle.imageSrc}
              alt={mainArticle.titleMalayalam}
              width={400}
              height={225}
              sizes="(max-width: 768px) 100vw, 25vw"
              className="h-full w-full object-cover transition-transform"
              style={{ width: '100%', height: 'auto', aspectRatio: '16/9' }}
              onError={(e) => { e.currentTarget.src = 'https://placehold.co/1200x675/ccc/333?text=Image+Load+Error'; }}
            />
          </div>

          {/* Content */}
          <div className="w-full h-[50%] flex flex-col justify-between">
            
            {/* Tags */}
            <div className="flex gap-2 mb-2 flex-wrap">
              {/* Using the mapped categories */}
              {mainArticle.categories.map((cat, index) => (
                <Tag key={index} link={cat.link}>{cat.name}</Tag> 
              ))}
            </div>

            {/* Title - Use mainArticle.slug directly */}
            <a href={`/${mainArticle.slug}`}> 
              <h4 className="side-article-title local-font-rachana text-[40px] md:text-[50px] font-bold leading-tight lg:leading-[46px] text-[#a82a2a] mt-2 hover:text-red-700 transition-colors">
                {mainArticle.titleMalayalam} 
              </h4>
            </a>

            {/* Description */}
            <p className="side-article-description local-font-rachana text-[18px] md:text-[20px] leading-tight font-normal text-black my-3">
              {mainArticle.descriptionMalayalam} 
            </p>

            {/* Meta */}
            <div className="article-meta flex items-center gap-2">
              <span className="author text-sm font-semibold text-black">{mainArticle.author}</span> 
              <span className="divider text-sm text-black">|</span>
              <span className="date text-sm font-normal text-black opacity-45">{mainArticle.date}</span> 
            </div>
          </div>
        </article>
      )}

      {/* Side Articles Block - The next four latest articles, stacked in the second column on desktop */}
      <div className="grid grid-cols-1 gap-5">
        {sideArticles.map((article, index) => (
          <article
            key={article.id}
            className="side-article flex flex-col sm:flex-row items-start gap-5 rounded-2xl border border-black p-5 transition-all hover:-translate-y-1 hover:shadow-lg"
            data-aos="fade-up"
            data-aos-delay={(index + 1) * 100} 
          >
            {/* Image - Use article.imageSrc directly */}
            <div className="side-article-image w-full sm:w-[180px] flex-shrink-0 rounded-xl overflow-hidden aspect-square sm:aspect-auto">
              <Image
                src={article.imageSrc} 
                alt={article.titleMalayalam}
                width={180}
                height={180}
                className="h-[180px] w-full object-cover transition-transform sm:h-auto sm:aspect-square"
                style={{ width: '100%', height: '180px', objectFit: 'cover' }}
                onError={(e) => { e.currentTarget.src = 'https://placehold.co/300x300/ccc/333?text=Image+Load+Error'; }}
              />
            </div>

            {/* Content */}
            <div className="side-article-content flex flex-col justify-between flex-1 overflow-hidden gap-0">
              
              {/* Tags */}
              <div className="flex gap-2 mb-2 flex-wrap">
                {article.categories.map((cat, catIndex) => (
                  <Tag key={catIndex} link={cat.link}>{cat.name}</Tag> 
                ))}
              </div>

              {/* Title - Use article.slug directly */}
              <a href={`/article/${article.slug}`}> 
                <h4 className="side-article-title local-font-rachana text-[22px] md:text-[25px] font-bold leading-6 lg:leading-7 text-[#a82a2a] mt-2 hover:text-red-700 transition-colors">
                  {article.titleMalayalam}
                </h4>
              </a>

              {/* Meta */}
              <div className="article-meta flex items-center gap-2 mt-2">
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
