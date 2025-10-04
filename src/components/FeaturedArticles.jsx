// src/components/FeaturedArticles.jsx

import Image from 'next/image';
import Link from 'next/link';
import Tag from './ui/tag';

const dummyArticles = [
    {
        id: 1,
        is_featured: true,
        is_show: true,
        titleMalayalam: 'മാംഗ: ജാപ്പനീസ് കലാമണ്ഡലത്തിൽ ഇസ്ലാമിന്റെ ഇടം',
        slug: 'manga-islam-in-japanese-art',
        imageSrc: '/images/hero_featured.jpg',
        categories: [
            { name: 'UNITED', link: '/category/united' },
            { name: 'ARCHITECTURE', link: '/category/architecture' },
        ],
        author: 'ഫാസിൽ',
        date: '22 MAY 2025',
    },
    {
        id: 2,
        is_featured: true,
        is_show: true,
        titleMalayalam: 'ചരിത്രത്തിൻ്റെ ഇരുളടഞ്ഞ ഇടനാഴികളിൽ ഉയിർത്തെഴുന്നേറ്റ വിപ്ലവകാരി',
        slug: 'revolutionary-in-dark-halls-of-history',
        imageSrc: '/images/hero_featured.jpg',
        categories: [
            { name: 'HISTORY', link: '/category/history' },
            { name: 'POLITICS', link: '/category/politics' },
        ],
        author: 'റഷീദ്',
        date: '21 MAY 2025',
    },
    {
        id: 3,
        is_featured: true,
        is_show: true,
        titleMalayalam: 'നമ്മുടെ പരിസ്ഥിതിബോധം എത്രത്തോളമുണ്ട്?',
        slug: 'our-environmental-awareness',
        imageSrc: '/images/hero_featured.jpg',
        categories: [
            { name: 'ENVIRONMENT', link: '/category/environment' },
            { name: 'SCIENCE', link: '/category/science' },
        ],
        author: 'സഫിയ',
        date: '20 MAY 2025',
    },
    {
        id: 4,
        is_featured: true,
        is_show: true,
        titleMalayalam: 'സയണൈഡിന്റെ കയ്പറിഞ്ഞ ജീവിതങ്ങൾ: ഗസ്സയിലെ കുട്ടികൾ',
        slug: 'cyanide-and-children-of-gaza',
        imageSrc: '/images/hero_featured.jpg',
        categories: [
            { name: 'PALESTINE', link: '/category/palestine' },
            { name: 'GLOBAL', link: '/category/global' },
        ],
        author: 'അനസ്',
        date: '19 MAY 2025',
    },
    {
        // This article will be ignored because is_featured is false
        id: 5,
        is_featured: false,
        is_show: true,
        titleMalayalam: 'നോൺ-ഫീച്ചർഡ് ലേഖനം',
        slug: 'non-featured-article',
        imageSrc: '/images/hero_featured.jpg',
        categories: [{ name: 'TEST', link: '/category/test' }],
        author: 'ടെസ്റ്റ്',
        date: '18 MAY 2025',
    },
    {
        // This article will be ignored because is_show is false
        id: 6,
        is_featured: true,
        is_show: false,
        titleMalayalam: 'ഫീച്ചർ ചെയ്തതും മറച്ചുവെച്ചതും',
        slug: 'hidden-featured-article',
        imageSrc: '/images/hero_featured.jpg',
        categories: [{ name: 'HIDDEN', link: '/category/hidden' }],
        author: 'ടെസ്റ്റ്',
        date: '17 MAY 2025',
    },
];


// --- Main Component ---

export default function FeaturedArticles() {
    const featuredArticles = dummyArticles
        .filter((article) => article.is_featured && article.is_show)
        .slice(0, 4);

    return (
        <div className="articles-grid mx-auto grid w-[83%] max-w-[1250px] grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {featuredArticles.map((article, index) => (
                <article
                    key={article.id}
                    className="article-card rounded-xl border border-black p-5 transition-all duration-500 ease-in-out hover:-translate-y-1 hover:shadow-lg"
                    data-aos="fade-up"
                    data-aos-delay={(index + 1) * 100}
                >
                    <div className="article-image mb-4 h-[250px] w-full overflow-hidden rounded-xl">
                        <Image
                            src={article.imageSrc}
                            alt={`Article ${article.id} image`}
                            width={200}
                            height={240}
                            className="h-full w-full object-cover transition-transform hover:scale-105"
                        />
                    </div>
                    <div className="flex h-[130px] flex-col justify-between">
                        <div className="article-content flex h-auto flex-col">
                            <div className="flex gap-2">
                                {article.categories.map((cat, catIndex) => (
                                    <Tag key={catIndex} link={cat.link}>
                                        {cat.name}
                                    </Tag>
                                ))}
                            </div>
                        </div>
                        <Link href={`/article/${article.slug}`}>
                            {' '}
                            {/* DYNAMIC */}
                            <h3 className="article-title font-rachana text-[25px] h-[70px] overflow-hidden font-bold leading-[22px] py-1 text-[#a82a2a] hover:text-red-700 transition-colors">
                                {article.titleMalayalam} {/* DYNAMIC */}
                            </h3>
                        </Link>
                        <div className="article-meta flex items-center gap-2">
                            <span className="author text-xs font-normal text-black">
                                {article.author}
                            </span>{' '}
                            {/* DYNAMIC */}
                            <span className="divider text-xs text-black">|</span>
                            <span className="date text-xs font-normal text-black opacity-45">
                                {article.date}
                            </span>{' '}
                            {/* DYNAMIC */}
                        </div>
                    </div>
                </article>
            ))}
        </div>
    );
}