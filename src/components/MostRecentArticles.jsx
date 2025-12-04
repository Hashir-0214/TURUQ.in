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
        <article className="side-article lg:row-span-4 flex flex-col gap-5 rounded-2xl border border-black p-5 transition-all hover:-translate-y-1 hover:shadow-lg" data-aos="fade-up">
          
          <div className="side-article-image w-full rounded-2xl overflow-hidden aspect-video">
            <Image
              src={mainArticle.imageSrc}
              alt={mainArticle.title}
              width={400}
              height={225}
              sizes="(max-width: 768px) 100vw, 25vw"
              className="h-full w-full object-cover transition-transform"
              style={{ width: '100%', height: 'auto', aspectRatio: '16/9' }}
              onError={(e) => { e.currentTarget.src = 'https://placehold.co/1200x675/ccc/333?text=Image+Load+Error'; }}
            />
          </div>

          <div className="w-full h-[50%] flex flex-col justify-between">
            
            <div className="flex gap-2 mb-2 flex-wrap">
              {mainArticle.categories.map((cat, index) => (
                <Tag key={index} link={cat.link}>{cat.name}</Tag> 
              ))}
            </div>

            <a href={`/${mainArticle.slug}`}> 
              <h4 className="side-article-title local-font-rachana text-[40px] md:text-[50px] font-bold leading-tight lg:leading-[46px] text-[#a82a2a] mt-2 hover:text-red-700 transition-colors">
                {mainArticle.title} 
              </h4>
            </a>

            <p className="side-article-description local-font-rachana text-[18px] md:text-[20px] leading-tight font-normal text-black my-3">
              {mainArticle.description} 
            </p>

            <div className="article-meta flex items-center gap-2">
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
            className="side-article flex flex-col sm:flex-row items-start gap-5 rounded-2xl border border-black p-5 transition-all hover:-translate-y-1 hover:shadow-lg"
            data-aos="fade-up"
            data-aos-delay={(index + 1) * 100} 
          >
            <div className="side-article-image h-full w-full sm:w-[180px] shrink-0 rounded-xl overflow-hidden aspect-square sm:aspect-auto">
              <Image
                src={article.imageSrc} 
                alt={article.title}
                width={180}
                height={180}
                className="max-h-[110px] h-auto w-full object-cover transition-transform sm:h-auto sm:aspect-square"
                onError={(e) => { e.currentTarget.src = 'https://placehold.co/300x300/ccc/333?text=Image+Load+Error'; }}
              />
            </div>

            <div className="side-article-content h-full flex flex-col justify-between flex-1 overflow-hidden gap-0">
              <div className="flex gap-2 mb-2 flex-wrap">
                {article.categories.map((cat, catIndex) => (
                  <Tag key={catIndex} link={cat.link}>{cat.name}</Tag> 
                ))}
              </div>

              <a href={`/article/${article.slug}`}> 
                <h4 className="side-article-title local-font-rachana text-[22px] md:text-[25px] font-bold leading-6 lg:leading-7 text-[#a82a2a] mt-2 hover:text-red-700 transition-colors">
                  {article.title}
                </h4>
              </a>

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