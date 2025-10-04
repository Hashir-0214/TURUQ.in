// app/page.js
'use client';
import { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import Tag from '@/components/ui/tag';
import MostRecentArticles from '@/components/MostRecentArticles';
import SectionHeader from '@/components/reusable/SectionHeader';
import ArchiveSection from '@/components/ArchiveSection';
import FeaturedArticles from '@/components/FeaturedArticles';
import HeroSection from '@/components/HeroSection';

export default function Home() {
  useEffect(() => {
    // Initialize AOS only on client side
    if (typeof window !== 'undefined') {
      const initAOS = async () => {
        const AOS = (await import('aos')).default;
        await import('aos/dist/aos.css');
        AOS.init({
          duration: 300,
          once: true,
        });
      };
      initAOS();
    }
  }, []);

  return (
    <main className="mt-[170px] bg-[#ffedd9] w-full">
      {/* Hero Section */}
      <div>
        <HeroSection />
      </div>

      {/* Featured Articles Section */}
      <section className="mb-28 w-full">
        <SectionHeader> Featured Articles </SectionHeader>
        <FeaturedArticles />
      </section>

      {/* Archive Section */}
      <section className="flex justify-center py-10 lg:py-16" data-aos="fade-up">
        <ArchiveSection />
      </section>

      {/* Most Recent Section */}
      <section className="most-recent mb-16 w-full">
        <SectionHeader> Most Recent </SectionHeader>

        <MostRecentArticles />
      </section>
    </main>
  );
}