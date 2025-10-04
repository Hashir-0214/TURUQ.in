// mostRecent.jsx

import Image from 'next/image';
import Link from 'next/link';
import Tag from './ui/tag'; 

const dummyRecentArticles = [
  {
    id: 1,
    isMain: false, // will be dynamically set by sorting
    titleMalayalam: 'മാംഗ: ജാപ്പനീസ് കലാമണ്ഡലത്തിൽ ഇസ്ലാമിന്റെ ഇടം',
    slug: 'manga-islam-in-japanese-art',
    descriptionMalayalam: 'നാം നേരിടുന്ന എപിസ്റ്റമിക് കോളനിവൽക്കരണത്തിൻ്റെ അനന്തരഫലമെന്നോണം തന്നെ അക്കാദമിക ഗവേഷണതലങ്ങളിൽ സംഭവിക്കുന്നു. നാം നേരിടുന്ന എപിസ്റ്റമിക് കോളനിവൽക്കരണത്തിൻ്്റെ അനന്തരഫലമെന്നോണം എപിസ്റ്റിമിസൈഡ്',
    imageSrc: '/images/hero_featured.jpg',
    categories: [
      { name: 'UNITED', link: '/category/united' },
      { name: 'ARCHITECTURE', link: '/category/architecture' },
    ],
    author: 'ഫാസിൽ',
    date: '23 MAY 2025', // Latest article
    timestamp: 1748057400000, // May 23, 2025, 12:00:00 AM UTC
  },
  {
    id: 2,
    isMain: false,
    titleMalayalam: 'അടിച്ചമര്‍ത്തലുകള്‍ക്കും തീവ്ര നിലപാടുകള്‍ക്കും മധ്യേ മാല്‍ക്കം എക്സിന്റെ ജീവിതം',
    slug: 'malcolm-x-life-amidst-repression',
    imageSrc: '/images/hero_featured.jpg',
    categories: [
      { name: 'UNITED', link: '/category/united' },
      { name: 'ARCHITECTURE', link: '/category/architecture' },
    ],
    author: 'ഫാസിൽ',
    date: '22 MAY 2025',
    timestamp: 1747971000000, // May 22, 2025
  },
  {
    id: 3,
    isMain: false,
    titleMalayalam: 'സയണൈഡിന്റെ കയ്പറിഞ്ഞ ജീവിതങ്ങൾ: ഗസ്സയിലെ കുട്ടികൾ',
    slug: 'cyanide-and-children-of-gaza',
    imageSrc: '/images/hero_featured.jpg',
    categories: [
      { name: 'PALESTINE', link: '/category/palestine' },
      { name: 'POLITICS', link: '/category/politics' },
    ],
    author: 'അനസ്',
    date: '21 MAY 2025',
    timestamp: 1747884600000, // May 21, 2025
  },
  {
    id: 4,
    isMain: false,
    titleMalayalam: 'നമ്മുടെ പരിസ്ഥിതിബോധം എത്രത്തോളമുണ്ട്?',
    slug: 'our-environmental-awareness',
    imageSrc: '/images/hero_featured.jpg',
    categories: [
      { name: 'ENVIRONMENT', link: '/category/environment' },
      { name: 'SCIENCE', link: '/category/science' },
    ],
    author: 'സഫിയ',
    date: '20 MAY 2025',
    timestamp: 1747798200000, // May 20, 2025
  },
  {
    id: 5,
    isMain: false,
    titleMalayalam: 'ചൈനീസ് കമ്മ്യൂണിസ്റ്റ് പാർട്ടിയും മുസ്ലിം പ്രശ്‌നവും',
    slug: 'chinese-communist-party-and-muslim-issue',
    imageSrc: '/images/hero_featured.jpg',
    categories: [
      { name: 'GLOBAL', link: '/category/global' },
      { name: 'HISTORY', link: '/category/history' },
    ],
    author: 'റഷീദ്',
    date: '19 MAY 2025',
    timestamp: 1747711800000,
  },
];

// --- Main Component ---

export default function MostRecentArticles() {
  // 1. Sort all articles by timestamp in descending order (latest first)
  const sortedArticles = [...dummyRecentArticles].sort((a, b) => b.timestamp - a.timestamp);

  // 2. The first article is the main article
  const mainArticle = sortedArticles[0];

  // 3. The next four articles are the side articles
  const sideArticles = sortedArticles.slice(1, 5); // Start at index 1, take 4 items

  return (
    // DO NOT CHANGE: Main Container Styles
    <div className="recent-side-articles mx-auto grid w-[83%] max-w-[1250px] grid-cols-2 gap-5">

      {/* Main Article Block - The absolute latest article */}
      {mainArticle && (
        // DO NOT CHANGE: Main Article Styles
        <article className="side-article row-span-4 flex flex-col gap-5 rounded-2xl border border-black p-5 transition-all hover:-translate-y-1 hover:shadow-lg" data-aos="fade-up">
          
          {/* Image */}
          <div className="side-article-image h-full w-full rounded-2xl overflow-hidden">
            <Image
              src={mainArticle.imageSrc} // DYNAMIC
              alt="Main recent article image"
              width={1200}
              height={384}
              className="h-full w-full object-cover transition-transform"
            />
          </div>

          {/* Content */}
          <div className="w-full h-full flex flex-col justify-between">
            
            {/* Tags */}
            <div className="flex gap-2 mb-2">
              {mainArticle.categories.map((cat, index) => (
                <Tag key={index} link={cat.link}>{cat.name}</Tag> // DYNAMIC
              ))}
            </div>

            {/* Title */}
            <Link href={`/article/${mainArticle.slug}`}> {/* DYNAMIC */}
              <h4 className="side-article-title font-rachana text-[50px] font-bold leading-tight lg:leading-[46px] text-[#a82a2a] mt-2 hover:text-red-700 transition-colors">
                {mainArticle.titleMalayalam} {/* DYNAMIC */}
              </h4>
            </Link>

            {/* Description */}
            <p className="side-article-description font-rachana text-[20px] leading-tight font-normal text-black my-3">
              {mainArticle.descriptionMalayalam} {/* DYNAMIC */}
            </p>

            {/* Meta */}
            <div className="article-meta flex items-center gap-2">
              <span className="author text-sm font-semibold text-black">{mainArticle.author}</span> {/* DYNAMIC */}
              <span className="divider text-sm text-black">|</span>
              <span className="date text-sm font-normal text-black opacity-45">{mainArticle.date}</span> {/* DYNAMIC */}
            </div>
          </div>
        </article>
      )}

      {/* Side Articles Block - The next four latest articles */}
      {sideArticles.map((article, index) => (
        <article
          key={article.id} // DYNAMIC KEY
          // DO NOT CHANGE: Side Article Styles
          className="side-article flex flex-col sm:flex-row items-start gap-5 rounded-2xl border border-black p-5 transition-all hover:-translate-y-1 hover:shadow-lg"
          data-aos="fade-up"
          data-aos-delay={(index + 1) * 100} // DYNAMIC DELAY (index 0, 1, 2, 3 -> delay 100, 200, 300, 400)
        >
          {/* Image */}
          <div className="side-article-image h-full w-[180px] flex-shrink-0 rounded-xl overflow-hidden">
            <Image
              src={article.imageSrc} // DYNAMIC
              alt={`Recent article ${article.id} image`}
              width={144}
              height={144}
              className="h-full w-full object-cover transition-transform"
            />
          </div>

          {/* Content */}
          <div className="side-article-content flex flex-col justify-between flex-1 overflow-hidden gap-0">
            
            {/* Tags */}
            <div className="flex gap-2 mb-2">
              {article.categories.map((cat, catIndex) => (
                <Tag key={catIndex} link={cat.link}>{cat.name}</Tag> // DYNAMIC
              ))}
            </div>

            {/* Title */}
            <Link href={`/article/${article.slug}`}> {/* DYNAMIC */}
              <h4 className="side-article-title font-rachana text-[25px] font-bold leading-5 lg:leading-6 text-[#a82a2a] mt-2 hover:text-red-700 transition-colors">
                {article.titleMalayalam} {/* DYNAMIC */}
              </h4>
            </Link>

            {/* Meta */}
            <div className="article-meta flex items-center gap-2 mt-2">
              <span className="author text-xs font-semibold text-black">{article.author}</span> {/* DYNAMIC */}
              <span className="divider text-xs text-black">|</span>
              <span className="date text-xs font-normal text-black opacity-45">{article.date}</span> {/* DYNAMIC */}
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}