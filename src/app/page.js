// src/app/page.js

import MostRecentArticles from '@/components/MostRecentArticles';
import SectionHeader from '@/components/reusable/SectionHeader';
import ArchiveSection from '@/components/ArchiveSection';
import FeaturedArticles from '@/components/FeaturedArticles';
import HeroSection from '@/components/HeroSection';

// Helper to get the correct URL in Dev and Prod
const getBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return 'http://localhost:3000';
};

async function fetchHomeData() {
  const baseUrl = getBaseUrl();
  try {
    // We use { cache: 'no-store' } ensures we always get fresh data. 
    // Change to { next: { revalidate: 60 } } to cache for 60 seconds if you want speed.
    const res = await fetch(`${baseUrl}/api/home`, { cache: 'no-store' });
    
    if (!res.ok) {
      throw new Error('Failed to fetch home data');
    }
    
    return res.json();
  } catch (error) {
    console.error("Home Page Fetch Error:", error);
    return { featuredArticles: [], mostRecentArticles: [] };
  }
}

export default async function Home() {
  const { featuredArticles, mostRecentArticles } = await fetchHomeData();

  // Fallback UI if API fails completely
  if (!featuredArticles.length && !mostRecentArticles.length) {
    return (
      <main className="flex justify-center items-center h-screen bg-[#ffedd9]">
        <div className="text-center">
           <p className="text-2xl text-red-600 mb-2">Unable to load articles.</p>
           <p className="text-gray-500">Please check your connection or try again later.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="mt-[20px] bg-[#ffedd9] w-full">
      {/* Hero Section */}
      <div>
        <HeroSection />
      </div>

      {/* Featured Articles Section */}
      <section className="mb-28 w-full">
        <SectionHeader> Featured Articles </SectionHeader>
        <FeaturedArticles articles={featuredArticles} /> 
      </section>

      {/* Archive Section */}
      <section className="flex justify-center py-10 lg:py-16">
        <ArchiveSection />
      </section>

      {/* Most Recent Section */}
      <section className="most-recent mb-16 w-full">
        <SectionHeader> Most Recent </SectionHeader>
        <MostRecentArticles articles={mostRecentArticles} />
      </section>
    </main>
  );
}