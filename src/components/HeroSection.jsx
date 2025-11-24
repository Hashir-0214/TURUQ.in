// src/components/HeroSection.jsx
"use client";

import Image from 'next/image';
import Link from 'next/link';
import React, { useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import Tag from './ui/tag';

export default function HeroSection({ articles }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFading, setIsFading] = useState(false);

    // If no data, hide the section or show nothing
    if (!articles || articles.length === 0) {
        return null; 
    }

    const currentSlide = articles[currentIndex];
    const totalSlides = articles.length;
    const fadeDuration = 300;

    // --- Navigation Functions ---
    const changeSlide = (newIndex) => {
        if (newIndex === currentIndex) return;

        setIsFading(true); 

        setTimeout(() => {
            setCurrentIndex(newIndex);
            setIsFading(false); 
        }, fadeDuration);
    };

    const handleNext = () => {
        const newIndex = (currentIndex + 1) % totalSlides;
        changeSlide(newIndex);
    };

    const handlePrev = () => {
        const newIndex = (currentIndex - 1 + totalSlides) % totalSlides;
        changeSlide(newIndex);
    };

    // Mapping the incoming data to the UI
    // The structure comes from mapArticleData in article-service.js
    const title = currentSlide.titleMalayalam;
    const description = currentSlide.descriptionMalayalam;
    const link = `/article/${currentSlide.slug}`;
    const image = currentSlide.imageSrc;
    const categories = currentSlide.categories || [];
    const author = currentSlide.author;
    const date = currentSlide.date;

    const paginationDisplay = `${(currentIndex + 1).toString().padStart(2, '0')} - ${totalSlides.toString().padStart(2, '0')}`;

    return (
        <section className="mb-[100px] w-full">
            <div className="mx-auto flex w-[83%] max-w-[1250px] h-[510px] flex-col lg:flex-row items-center justify-between gap-10 overflow-hidden rounded-2xl border border-black p-[40px]">

                {/* Left Content Area (Text and Controls) */}
                <div className={`w-full max-w-[400px] h-auto p-0 flex flex-1 flex-col justify-between gap-[25px] overflow-hidden transition-opacity duration-${fadeDuration}`} style={{ opacity: isFading ? 0 : 1 }}>

                    {/* Tags */}
                    <div className="flex gap-[8px]">
                        {categories.map((cat, index) => (
                            <Tag key={index} link={cat.link}>{cat.name}</Tag>
                        ))}
                    </div>

                    {/* Title */}
                    <Link href={link}>
                        <h2 className="local-font-rachana max-w-[400px] h-[120px] text-[49px] font-[700] leading-[45px] text-[#a82a2a] hover:text-red-700 transition-colors line-clamp-3">
                            {title}
                        </h2>
                    </Link>

                    {/* Description */}
                    <p className="local-font-rachana max-w-[400px] text-[18px] h-[100px] leading-tight font-normal text-black line-clamp-4">
                        {description}
                    </p>

                    {/* Meta (Author and Date) */}
                    <div className="max-w-[400px] flex items-center gap-2">
                        <span className="font-poppins author text-sm font-semibold text-black">{author}</span>
                        <span className="divider text-xs text-black">|</span>
                        <span className="date text-xs font-normal text-black opacity-45">{date}</span>
                    </div>

                    {/* Pagination and Navigation Buttons */}
                    <div className="max-w-[400px] flex w-full items-center justify-between">
                        <div className="pagination text-xl lg:text-2xl font-normal text-black">{paginationDisplay}</div>
                        <div className="flex gap-3">
                            <button
                                onClick={handlePrev}
                                className="nav-btn flex h-7 w-10 items-center justify-center rounded border border-black bg-red-600 transition-colors hover:bg-red-700 cursor-pointer"
                                aria-label="Previous article"
                            >
                                <ArrowLeft size={16} color="white" />
                            </button>
                            <button
                                onClick={handleNext}
                                className="nav-btn flex h-7 w-10 items-center justify-center rounded border border-black bg-red-600 transition-colors hover:bg-red-700 cursor-pointer"
                                aria-label="Next article"
                            >
                                <ArrowRight size={16} color="white" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Content Area (Image) */}
                <div className={`flex-shrink-0 h-64 lg:h-full lg:max-h-[430px] w-full lg:w-[60%] max-w-[700px] overflow-hidden rounded-2xl transition-opacity duration-${fadeDuration}`} style={{ opacity: isFading ? 0 : 1 }}>
                    <Link href={link} className="block h-full w-full">
                        <Image
                            key={currentSlide.id || currentIndex}
                            src={image}
                            alt={title}
                            width={630}
                            height={430}
                            className="h-full w-full object-cover rounded-2xl transition-transform duration-500 ease-in-out hover:scale-[1.02]"
                            priority
                            onError={(e) => { e.currentTarget.src = 'https://placehold.co/630x430/ccc/333?text=Image+Load+Error'; }}
                        />
                    </Link>
                </div>
            </div>
        </section>
    );
}