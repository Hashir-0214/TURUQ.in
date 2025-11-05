// src/components/HeroSection.jsx
"use client";

import Image from 'next/image';
import Link from 'next/link';
import React, { useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import Tag from './ui/tag';

const featuredSlides = [
    {
        id: 1,
        article_id: '12fs1f2sdf',
        titleMalayalam: 'മാംഗ: ജാപ്പനീസ് കലാമണ്ഡലത്തിൽ ഇസ്ലാമിന്റെ ഇടം',
        slug: 'manga-islam-in-japanese-art',
        descriptionMalayalam: 'നാം നേരിടുന്ന എപിസ്റ്റമിക് കോളനിവൽക്കരണത്തിൻ്റെ അനന്തരഫലമെന്നോണം തന്നെ അക്കാദമിക ഗവേഷണതലങ്ങളിൽ സംഭവിക്കുന്നു. നാം നേരിടുന്ന എപിസ്റ്റമിക് കോളനിവൽക്കരണത്തിൻ്റെ',
        imageSrc: 'https://res.cloudinary.com/dgoz15sps/image/upload/v1762102011/turuq/fzxluar5cn16be4a6afd.webp',
        categories: [
            { name: 'UNITED', link: '/category/united' },
            { name: 'ARCHITECTURE', link: '/category/architecture' },
        ],
        author: 'സിനാൻ കാടൻ',
        date: '22 MAY 2025',
    },
    {
        id: 2,
        article_id: null, 
        custom_titleMalayalam: 'ഇരുളടഞ്ഞ ഇടനാഴികളിലെ വിപ്ലവകാരി',
        custom_descriptionMalayalam: 'ഇരുളടഞ്ഞ ചരിത്രത്തിൻ്റെ ഇടനാഴികളിൽ ഒരു വിപ്ലവകാരിയുടെ ഉയിർത്തെഴുന്നേറ്റ കഥയാണിത്. (കസ്റ്റം ബാനർ ടെക്സ്റ്റ്)',
        image_link: 'https://res.cloudinary.com/dgoz15sps/image/upload/v1762102011/turuq/fzxluar5cn16be4a6afd.webp',
        redirection_link: '/article/malcom-x-space-travel',
        categories: [{ name: 'PROMO', link: '/promo' }],
        author: 'വെബ്സിൻ എഡിറ്റർ',
        date: 'കസ്റ്റം സ്ലൈഡ്',
    },
];

// --- Main Component ---

export default function HeroSection() {
    const [currentIndex, setCurrentIndex] = useState(0);
    // NEW STATE for fade effect
    const [isFading, setIsFading] = useState(false);

    const currentSlide = featuredSlides[currentIndex];
    const totalSlides = featuredSlides.length;

    // Duration for the fade transition (must match the CSS transition duration)
    const fadeDuration = 300;

    // --- Navigation Functions ---
    const changeSlide = (newIndex) => {
        if (newIndex === currentIndex) return;

        setIsFading(true); // Start fade-out

        // After the fade-out duration, change the content and start fade-in
        setTimeout(() => {
            setCurrentIndex(newIndex);
            setIsFading(false); // Start fade-in
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

    if (!currentSlide) {
        return null;
    }

    const isArticleSlide = currentSlide.article_id !== null;

    const title = isArticleSlide ? currentSlide.titleMalayalam : currentSlide.custom_titleMalayalam || 'ശീർഷകം ലഭ്യമല്ല';
    const description = isArticleSlide ? currentSlide.descriptionMalayalam : currentSlide.custom_descriptionMalayalam || 'വിവരണം ലഭ്യമല്ല';
    const link = isArticleSlide ? `/article/${currentSlide.slug}` : currentSlide.redirection_link || '#';
    const image = isArticleSlide ? currentSlide.imageSrc : currentSlide.image_link;
    const categories = currentSlide.categories || [];
    const author = currentSlide.author || 'അജ്ഞാതം';
    const date = currentSlide.date || '';

    // Calculate pagination display
    const paginationDisplay = `${(currentIndex + 1).toString().padStart(2, '0')} - ${totalSlides.toString().padStart(2, '0')}`;

    // Conditional CSS class for opacity and transition
    const fadeClass = isFading ? 'opacity-0' : 'opacity-100';

    return (
        <section className="mb-[100px] w-full">
            <div className="mx-auto flex w-[83%] max-w-[1250px] h-[510px] flex-col lg:flex-row items-center justify-between gap-10 overflow-hidden rounded-2xl border border-black p-[40px]">

                {/* Left Content Area (Text and Controls) */}
                {/* ADDED: transition and dynamic opacity class */}
                <div className={`w-full max-w-[400px] h-auto p-0 flex flex-1 flex-col justify-between gap-[25px] overflow-hidden transition-opacity duration-${fadeDuration}`} style={{ opacity: isFading ? 0 : 1 }}>

                    {/* Tags */}
                    <div className="flex gap-[8px]">
                        {categories.map((cat, index) => (
                            <Tag key={index} link={cat.link}>{cat.name}</Tag>
                        ))}
                    </div>

                    {/* Title */}
                    <Link href={link}>
                        <h2 className="local-font-rachana max-w-[400px] h-[120px] text-[49px] font-[700] leading-[40px] text-[#a82a2a] hover:text-red-700 transition-colors">
                            {title}
                        </h2>
                    </Link>

                    {/* Description */}
                    <p className="local-font-rachana max-w-[400px] text-[18px] h-[100px] leading-tight font-normal text-black">
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
                {/* ADDED: transition and dynamic opacity class to the Image container */}
                <div className={`flex-shrink-0 h-64 lg:h-full lg:max-h-[430px] w-full lg:w-[60%] max-w-[700px] overflow-hidden rounded-2xl transition-opacity duration-${fadeDuration}`} style={{ opacity: isFading ? 0 : 1 }}>
                    <Link href={link} className="block h-full w-full">
                        <Image
                            // Using a key forces React to replace the DOM element, which is useful for transitions
                            key={currentSlide.id}
                            src={image}
                            alt="Featured article hero image"
                            width={630}
                            height={430}
                            className="h-full w-full object-cover rounded-2xl transition-transform duration-500 ease-in-out hover:scale-[1.02]"
                            priority
                        />
                    </Link>
                </div>
            </div>
        </section>
    );
}