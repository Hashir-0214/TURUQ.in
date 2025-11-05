// arc/app/page.js

import { getHomeArticleData } from '@/lib/data';

import MostRecentArticles from '@/components/MostRecentArticles';
import SectionHeader from '@/components/reusable/SectionHeader';
import ArchiveSection from '@/components/ArchiveSection';
import FeaturedArticles from '@/components/FeaturedArticles';
import HeroSection from '@/components/HeroSection';

export default async function Home() {

  const { featuredArticles, mostRecentArticles } = await getHomeArticleData();

  if (!featuredArticles || !mostRecentArticles) {
    return (
      <main className="flex justify-center items-center h-screen bg-[#ffedd9]">
        <p className="text-2xl text-red-600">Failed to load articles. Please try again later.</p>
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
        {/* Pass the fully prepared data as props */}
        <FeaturedArticles articles={featuredArticles} /> 
      </section>

      {/* Archive Section */}
      <section className="flex justify-center py-10 lg:py-16">
        <ArchiveSection />
      </section>

      {/* Most Recent Section */}
      <section className="most-recent mb-16 w-full">
        <SectionHeader> Most Recent </SectionHeader>
        {/* Pass the fully prepared data as props */}
        <MostRecentArticles articles={mostRecentArticles} />
      </section>
    </main>
  );
}