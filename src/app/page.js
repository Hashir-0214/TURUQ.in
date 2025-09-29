// app/page.js
'use client';
import { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import Tag from '@/components/ui/tag';

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
    <main className="mt-[150px] w-full">
      {/* Hero Section */}
      <section className="mb-16 w-full">
        <div className="mx-auto flex w-[83%] max-w-[1250px] flex-col lg:flex-row items-center justify-between gap-10 overflow-hidden rounded-2xl border border-black p-10">
          <div className="flex flex-1 flex-col justify-between gap-4">
            <div className="flex gap-2">
              <Tag link="/category/united">UNITED</Tag>
              <Tag link="/category/architecture">ARCHITECTURE</Tag>
            </div>
            <Link href="/article/featured">
              <h2 className="font-rachana text-2xl lg:text-4xl font-bold leading-tight lg:leading-[46px] text-[#a82a2a] hover:text-red-700 transition-colors">
                മാംഗ: ജാപ്പനീസ് കലാമണ്ഡലത്തിൽ ഇസ്ലാമിന്റെ ഇടം
              </h2>
            </Link>
            <p className="font-rachana text-base lg:text-lg font-normal text-black">
              നാം നേരിടുന്ന എപിസ്റ്റമിക് കോളനിവൽക്കരണത്തിൻ്റെ അനന്തരഫലമെന്നോണം
              തന്നെ അക്കാദമിക ഗവേഷണതലങ്ങളിൽ സംഭവിക്കുന്നു. നാം നേരിടുന്ന
              എപിസ്റ്റമിക് കോളനിവൽക്കരണത്തിൻ്റെ
            </p>
            <div className="flex items-center gap-2">
              <span className="font-poppins author text-xs font-normal text-black">സിനാൻ കാടൻ</span>
              <span className="divider text-xs text-black">|</span>
              <span className="date text-xs font-normal text-black opacity-45">22 MAY 2025</span>
            </div>
            <div className="flex w-full items-center justify-between">
              <div className="pagination text-xl lg:text-2xl font-normal text-black">01 - 02</div>
              <div className="flex gap-3">
                <button
                  className="nav-btn flex h-7 w-10 items-center justify-center rounded border border-black bg-red-600 transition-colors hover:bg-red-700"
                  aria-label="Previous article"
                >
                  <ChevronLeft size={16} color="white" />
                </button>
                <button
                  className="nav-btn flex h-7 w-10 items-center justify-center rounded border border-black bg-red-600 transition-colors hover:bg-red-700"
                  aria-label="Next article"
                >
                  <ChevronRight size={16} color="white" />
                </button>
              </div>
            </div>
          </div>
          <div className="flex-shrink-0 h-64 lg:h-full lg:max-h-[430px] w-full lg:w-[60%] max-w-[630px] overflow-hidden rounded-2xl">
            <Image
              src="/images/hero_featured.png"
              alt="Featured article hero image"
              width={630}
              height={430}
              className="h-full w-full object-cover rounded-2xl"
              priority
            />
          </div>
        </div>
      </section>

      {/* Featured Articles Section */}
      <section className="mb-28 w-full">
        <div className="section-header mx-auto mb-10 flex h-20 lg:h-28 w-[83%] max-w-[1250px] items-center justify-between rounded-2xl border border-black bg-orange-50 px-6 lg:px-14">
          <h2 className="section-title text-2xl lg:text-4xl font-normal text-black">FEATURED ARTICLES</h2>
          <ArrowRight size={24} className="lg:w-[34px] lg:h-[34px]" />
        </div>
        <div className="articles-grid mx-auto grid w-[83%] max-w-[1250px] grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Article Cards */}
          {[1, 2, 3, 4].map((item) => (
            <article
              key={item}
              className="article-card rounded-xl border border-black bg-orange-50 p-5 transition-all hover:-translate-y-1 hover:shadow-lg"
              data-aos="fade-up"
              data-aos-delay={item * 100}
            >
              <div className="article-image mb-4 h-48 w-full overflow-hidden rounded-xl">
                <Image
                  src={`/images/article-${item}.png`}
                  alt={`Article ${item} image`}
                  width={200}
                  height={192}
                  className="h-full w-full object-cover transition-transform hover:scale-105"
                />
              </div>
              <div className="featured-articles-content flex h-36 flex-col justify-between">
                <div className="article-content flex h-24 flex-col">
                  <div className="flex gap-2 mb-2">
                    <Tag link="/category/united">UNITED</Tag>
                    <Tag link="/category/architecture">ARCHITECTURE</Tag>
                  </div>
                  <Link href={`/article/${item}`}>
                    <h3 className="article-title font-rachana text-lg lg:text-xl font-bold leading-5 lg:leading-6 text-[#a82a2a] hover:text-red-700 transition-colors">
                      മാംഗ: ജാപ്പനീസ് കലാമണ്ഡലത്തിൽ ഇസ്ലാമിന്റെ ഇടം
                    </h3>
                  </Link>
                </div>
                <div className="article-meta flex items-center gap-2">
                  <span className="author text-xs font-normal text-black">ഫാസിൽ</span>
                  <span className="divider text-xs text-black">|</span>
                  <span className="date text-xs font-normal text-black opacity-45">22 MAY 2025</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Archive Section */}
      <section className="flex justify-center bg-orange-50 py-10 lg:py-16" data-aos="fade-up">
        <div className="archive-content mx-auto flex w-[83%] max-w-[1250px] flex-col lg:flex-row items-center justify-between gap-10 rounded-2xl border border-black p-6 lg:p-10 shadow-lg bg-white">
          <div className="archive-text flex-1 text-center lg:text-left">
            <h2 className="archive-title text-2xl lg:text-4xl font-medium uppercase text-[#1d1d1d]">
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
          <div className="archive-images flex flex-1 items-end justify-center gap-3 lg:gap-5" data-aos="fade-up" data-aos-delay="200">
            <div className="h-32 w-24 lg:h-48 lg:w-36 rounded overflow-hidden">
              <Image
                src="/images/archive-cover-1.png"
                alt="Archive Cover 1"
                width={144}
                height={192}
                className="h-full w-full object-cover transition-transform hover:scale-105"
              />
            </div>
            <div className="h-48 w-32 lg:h-80 lg:w-56 rounded overflow-hidden">
              <Image
                src="/images/archive-cover-2.png"
                alt="Archive Cover 2"
                width={224}
                height={320}
                className="h-full w-full object-cover transition-transform hover:scale-105"
              />
            </div>
            <div className="h-40 w-28 lg:h-60 lg:w-40 rounded overflow-hidden">
              <Image
                src="/images/archive-cover-3.png"
                alt="Archive Cover 3"
                width={160}
                height={240}
                className="h-full w-full object-cover transition-transform hover:scale-105"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Most Recent Section */}
      <section className="most-recent mb-16 w-full">
        <div className="section-header mx-auto mb-10 flex h-20 lg:h-28 w-[83%] max-w-[1250px] items-center justify-between rounded-2xl border border-black bg-orange-50 px-6 lg:px-14">
          <h2 className="section-title text-2xl lg:text-4xl font-normal text-black">MOST RECENT</h2>
          <ArrowRight size={24} className="lg:w-[34px] lg:h-[34px]" />
        </div>

        <div className="recent-side-articles mx-auto grid w-[83%] max-w-[1250px] grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Main Article */}
          <article className="side-article col-span-1 lg:col-span-2 flex flex-col gap-5 rounded-2xl border border-black bg-orange-50 p-5 transition-all hover:-translate-y-1 hover:shadow-lg" data-aos="fade-up">
            <div className="side-article-image h-64 lg:h-96 w-full rounded-2xl overflow-hidden">
              <Image
                src="/images/recent-main.png"
                alt="Main recent article image"
                width={1200}
                height={384}
                className="h-full w-full object-cover transition-transform hover:scale-105"
              />
            </div>
            <div className="side-article-content w-full">
              <div className="flex gap-2 mb-2">
                <Tag link="/category/united">UNITED</Tag>
                <Tag link="/category/architecture">ARCHITECTURE</Tag>
              </div>
              <Link href="/article/main-recent">
                <h4 className="side-article-title font-rachana text-2xl lg:text-3xl font-bold leading-tight lg:leading-[46px] text-[#a82a2a] mt-2 hover:text-red-700 transition-colors">
                  മാംഗ: ജാപ്പനീസ് കലാമണ്ഡലത്തിൽ ഇസ്ലാമിന്റെ ഇടം
                </h4>
              </Link>
              <p className="side-article-description font-rachana text-base lg:text-lg font-normal text-black my-3">
                നാം നേരിടുന്ന എപിസ്റ്റമിക് കോളനിവൽക്കരണത്തിൻ്റെ അനന്തരഫലമെന്നോണം
                തന്നെ അക്കാദമിക ഗവേഷണതലങ്ങളിൽ സംഭവിക്കുന്നു. നാം നേരിടുന്ന
                എപിസ്റ്റമിക് കോളനിവൽ ക്കരണത്തിൻ്റെ അനന്തരഫലമെന്നോണം
                എപിസ്റ്റിമിസൈഡ്
              </p>
              <div className="article-meta flex items-center gap-2">
                <span className="author text-sm font-semibold text-black">ഫാസിൽ</span>
                <span className="divider text-sm text-black">|</span>
                <span className="date text-sm font-normal text-black opacity-45">22 MAY 2025</span>
              </div>
            </div>
          </article>

          {/* Side Articles */}
          {[1, 2, 3, 4].map((item) => (
            <article
              key={item}
              className="side-article flex flex-col sm:flex-row items-start gap-5 rounded-2xl border border-black bg-orange-50 p-5 transition-all hover:-translate-y-1 hover:shadow-lg"
              data-aos="fade-up"
              data-aos-delay={item * 100}
            >
              <div className="side-article-image h-32 w-full sm:h-36 sm:w-36 flex-shrink-0 rounded-xl overflow-hidden">
                <Image
                  src={`/images/recent-${item}.png`}
                  alt={`Recent article ${item} image`}
                  width={144}
                  height={144}
                  className="h-full w-full object-cover transition-transform hover:scale-105"
                />
              </div>
              <div className="side-article-content flex flex-col justify-between flex-1">
                <div className="flex gap-2 mb-2">
                  <Tag link="/category/united">UNITED</Tag>
                  <Tag link="/category/architecture">ARCHITECTURE</Tag>
                </div>
                <Link href={`/article/recent-${item}`}>
                  <h4 className="side-article-title font-rachana text-lg lg:text-xl font-bold leading-5 lg:leading-6 text-[#a82a2a] mt-2 hover:text-red-700 transition-colors">
                    അടിച്ചമര്‍ത്തലുകള്‍ക്കും തീവ്ര നിലപാടുകള്‍ക്കും മധ്യേ മാല്‍ക്കം
                    എക്സിന്റെ ജീവിതം
                  </h4>
                </Link>
                <div className="article-meta flex items-center gap-2 mt-2">
                  <span className="author text-xs font-normal text-black">ഫാസിൽ</span>
                  <span className="divider text-xs text-black">|</span>
                  <span className="date text-xs font-normal text-black opacity-45">22 MAY 2025</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}