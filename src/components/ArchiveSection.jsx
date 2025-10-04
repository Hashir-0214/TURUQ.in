// src/components/ArchiveSection.jsx

import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

const ArchiveSection = () => {
    return (
        <div className="archive-content mx-auto flex w-[83%] max-w-[1250px] max-h-[350px] flex-col lg:flex-row items-center justify-between gap-10 rounded-2xl border border-black p-[40px] shadow-lg">
            <div className="archive-text flex-1 text-left">
                <h2 className="archive-title text-[45px] font-bold leading-[50px] uppercase text-[#1d1d1d]">
                    Explore Our Exclusive Archives
                </h2>
                <p className="archive-subtitle text-lg lg:text-xl text-[#2b2b2b] mt-2">
                    For Weekly Webzines
                </p>
                <Link
                    href="/archives"
                    className="archive-btn relative mt-6 inline-flex items-center gap-2 overflow-hidden rounded-lg bg-[#c94333] px-6 py-3 font-semibold uppercase text-white transition-all hover:bg-[#a83227] hover:shadow-lg"
                >
                    View more
                    <ArrowRight size={16} />
                </Link>
            </div>
            
            <div className="flex flex-1 items-end justify-center gap-5 mt-[-100px]" data-aos="fade-up" data-aos-delay="200">
                
                <div className="h-[200px] aspect-[14/20] rounded-lg overflow-hidden transition-transform hover:-translate-y-2">
                    <Image
                        src="/images/hero_featured.jpg"
                        alt="Archive Cover 1"
                        width={144}
                        height={192}
                        className="h-full w-full object-cover transition-transform cursor-pointer"
                    />
                </div>
                
                <div className="h-[370px] aspect-[26/37] rounded-lg overflow-hidden transition-transform hover:-translate-y-2">
                    <Image
                        src="/images/hero_featured.jpg"
                        alt="Archive Cover 2"
                        width={224}
                        height={320}
                        className="h-full w-full object-cover transition-transform cursor-pointer"
                    />
                </div>
                
                <div className="h-[240px] aspect-[17/24] rounded-lg overflow-hidden transition-transform hover:-translate-y-2">
                    <Image
                        src="/images/hero_featured.jpg"
                        alt="Archive Cover 3"
                        width={160}
                        height={240}
                        className="h-full w-full object-cover transition-transform cursor-pointer"
                    />
                </div>
            </div>
        </div>
    );
};

export default ArchiveSection;