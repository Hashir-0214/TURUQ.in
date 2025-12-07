// src/components/popularSection.jsx
"use client";

import Image from "next/image";
import Tag from "./ui/tag";
import cloudinaryLoader from "@/lib/cloudinary-loader";

export default function PopularArticles({ articles }) {
    if (!articles || articles.length === 0) {
        return (
            <div className="flex justify-center items-center h-48">
                <p className="text-xl font-medium text-gray-500">
                    No featured articles found.
                </p>
            </div>
        );
    }

    return (
        <div className="mx-auto flex flex-col w-full max-w-[1250px] gap-4 px-4 md:px-6 lg:w-[83%]">
            {articles.map((article, index) => {
                const src =
                    article?.imageSrc &&
                    typeof article.imageSrc === "string" &&
                    article.imageSrc.trim() !== ""
                        ? article.imageSrc
                        : "https://placehold.co/400x250/ccc/333?text=Image+Missing";

                const isCloudinary = src.startsWith(
                    "https://res.cloudinary.com/"
                );

                return (
                    <article
                        key={article.id ?? index}
                        className="w-full rounded-xl flex flex-col sm:flex-row gap-4 sm:gap-6 md:gap-8 lg:gap-10 border border-black p-4 sm:p-5 transition-all duration-500 ease-in-out hover:-translate-y-1 hover:shadow-lg"
                        data-aos="fade-up"
                        data-aos-delay={(index + 1) * 100}
                    >
                        {/* Date - Hidden on mobile, shown as sidebar on larger screens */}
                        <div className="hidden sm:block sm:w-[120px] md:w-[150px] lg:w-[200px] flex-shrink-0">
                            <span className="text-sm md:text-base">{article.date}</span>
                        </div>

                        {/* Image */}
                        <div className="w-full sm:w-[180px] md:w-[220px] lg:w-[250px] h-[200px] sm:h-[150px] md:h-[180px] lg:h-[200px] flex-shrink-0 overflow-hidden rounded-xl">
                            <Image
                                loader={isCloudinary ? cloudinaryLoader : undefined}
                                src={src}
                                alt={article.title}
                                width={400}
                                height={250}
                                sizes="(max-width: 640px) 100vw, (max-width: 768px) 180px, (max-width: 1024px) 220px, 250px"
                                className="h-full w-full object-cover transition-transform hover:scale-105"
                            />
                        </div>

                        {/* Content */}
                        <div className="flex-1 flex flex-col justify-between gap-3 min-w-0">
                            {/* Categories */}
                            <div className="flex flex-wrap gap-2">
                                {(article.categories || []).map((cat, catIndex) => (
                                    <Tag key={catIndex} link={cat.link}>
                                        {cat.name}
                                    </Tag>
                                ))}
                            </div>

                            {/* Title */}
                            <a href={`/${article.slug}`} className="block">
                                <h3 className="article-title local-font-rachana text-xl sm:text-2xl lg:text-[25px] font-bold leading-tight sm:leading-[22px] py-1 text-[#a82a2a] hover:text-red-700 transition-colors line-clamp-2">
                                    {article.title}
                                </h3>
                            </a>

                            {/* Description */}
                            <p className="local-font-rachana text-sm sm:text-base line-clamp-2 sm:line-clamp-3">
                                {article.description}
                            </p>

                            {/* Meta information */}
                            <div className="flex items-center gap-2 text-xs sm:text-sm flex-wrap">
                                <span className="author font-normal text-black">
                                    {article.author}
                                </span>
                                <span className="divider text-black">|</span>
                                <span className="date font-normal text-black opacity-45 sm:hidden">
                                    {article.date}
                                </span>
                            </div>
                        </div>
                    </article>
                );
            })}
        </div>
    );
}