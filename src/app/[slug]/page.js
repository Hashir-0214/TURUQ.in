// src/app/[slug]/page.js

import Tag from "@/components/ui/tag";
import { getArticle } from "@/lib/mongodb";
import { VscLiveShare } from "react-icons/vsc";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

/* ----------  HELPERS  ---------- */
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  return new Date(dateString)
    .toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
    .toUpperCase();
};

const calculateReadTime = (content) => {
  if (!content) return 0;
  // Strip HTML tags to count words
  const text = content.replace(/<[^>]+>/g, "");
  const wordCount = text.split(/\s+/).length;
  return Math.ceil(wordCount / 200); // Avg reading speed 200 wpm
};

/* ----------  STATIC META  ---------- */
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) return { title: "Not found" };
  return {
    title: `${article.title} — TURUQ`,
    description: article.excerpt || article.title,
    openGraph: {
      images: [article.featured_image || "https://placeholder.com/1200x630"],
    },
  };
}

/* ----------  PAGE  ---------- */
export default async function ArticlePage({ params }) {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) notFound();

  // Safe Author Handling
  const author =
    article.author_id && typeof article.author_id === "object"
      ? article.author_id
      : {
          name: "Unknown Author",
          biography: "Biography not available.",
          avatar: null,
          _id: null,
        };

  const readTime = calculateReadTime(article.content);

  /* ----------  JSX  ---------- */
  return (
    <main className="mt-8 px-4">
      {/* FEATURED IMAGE */}
      <section className="flex flex-col items-center max-w-[1250px] w-full mx-auto border border-black rounded-[20px] p-2 md:p-5 mb-10 overflow-hidden bg-white shadow-sm">
        <div className="relative w-full h-[300px] md:h-[540px] rounded-[20px] overflow-hidden">
          <Image
            src={article.featured_image || "https://placeholder.com/1200x540"}
            alt={article.title || "Featured article image"}
            fill
            className="object-cover"
            priority
          />
        </div>
      </section>

      <div className="max-w-[1250px] mx-auto flex flex-col lg:flex-row items-start justify-between gap-10 px-1">
        {/* RIGHT: AUTHOR + SHARE (Mobile: Bottom, Desktop: Right/Sticky) */}
        <aside className="flex flex-col flex-shrink-0 items-center gap-6 w-full lg:w-[300px] lg:sticky lg:top-10 order-2 lg:order-2">
          <div className="w-full border-2 border-black rounded-3xl p-6 text-center bg-white shadow-lg hover:shadow-xl transition-shadow">
            <div className="text-xs font-bold tracking-wider mb-4 text-gray-500 uppercase">
              Author
            </div>

            <div className="relative inline-block mb-4">
              <Image
                src={
                  author.avatar ||
                  "https://cdn.builder.io/api/v1/image/assets/TEMP/9bb4988949e5939edbdc39fb1f4c712bf3b7921a?width=598"
                }
                alt={author.name || "Author"}
                width={112}
                height={112}
                className="w-28 h-28 rounded-full object-cover border-4 border-black shadow-md bg-gray-100"
              />
            </div>

            <h3 className="font-bold text-lg mb-2 text-gray-900">
              {author.name}
            </h3>

            <p className="text-sm text-gray-600 leading-relaxed mb-5 px-2 line-clamp-3">
              {author.biography}
            </p>

            {author._id ? (
              <Link
                href={`/author/${author._id}`}
                className="block w-full px-6 py-3 border-red-700 text-red-700 rounded-xl border-2 hover:bg-red-700 hover:text-white transition-all duration-200 uppercase text-sm font-bold tracking-wide shadow-sm hover:shadow-md text-center"
              >
                Visit Profile
              </Link>
            ) : (
              <button
                disabled
                className="w-full px-6 py-3 border-gray-300 text-gray-400 rounded-xl border-2 uppercase text-sm font-bold tracking-wide cursor-not-allowed"
              >
                Profile Unavailable
              </button>
            )}
          </div>

          <button
            title="Share this article"
            className="flex flex-row items-center justify-center gap-3 border-2 cursor-pointer border-black rounded-full px-6 py-3 bg-white hover:bg-black hover:text-white transition-all duration-200 shadow-md hover:shadow-lg group w-full lg:w-auto"
          >
            <VscLiveShare className="h-5 w-5 group-hover:scale-110 transition-transform" />
            <span className="lg:hidden font-bold text-sm">SHARE ARTICLE</span>
          </button>
        </aside>

        {/* LEFT: CONTENT */}
        <article className="w-full order-1 lg:order-1">
          <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
            <div className="flex flex-wrap gap-2">
              {article.tags && article.tags.length > 0 ? (
                article.tags.slice(0, 3).map((tag, index) => (
                  <Tag
                    linkClassName={`text-[11px] md:text-[12px] px-3 py-1`}
                    link={`/tag/${encodeURIComponent(tag)}`}
                    key={index}
                  >
                    {tag}
                  </Tag>
                ))
              ) : (
                <Tag link="/tag/uncategorized">UNCATEGORIZED</Tag>
              )}
            </div>
            <div className="flex gap-4 text-xs md:text-sm text-gray-500 font-medium">
              <span>
                {formatDate(article.published_at || article.created_at)}
              </span>
              <span>•</span>
              <span>{readTime} Min Read</span>
            </div>
          </div>

          <h1 className="local-font-rachana font-extrabold text-3xl md:text-[50px] md:leading-[1.1] text-red-800 mb-6 md:mb-8">
            {article.title}
          </h1>

          {article.excerpt && (
            <p className="font-serif text-xl md:text-2xl text-gray-600 italic mb-8 leading-relaxed border-l-4 border-red-200 pl-4">
              {article.excerpt}
            </p>
          )}

          {/* Using 'prose' (from @tailwindcss/typography) to style HTML content automatically. 
             Added 'max-w-none' to prevent it from constraining width inappropriately in this layout.
          */}
          <div
            className="article-content local-font-rachana prose prose-lg prose-red max-w-none text-gray-800 leading-loose"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </article>
      </div>

      {/* DIVIDER */}
      <div className="max-w-[1250px] mx-auto w-full h-px bg-gray-200 my-14" />

      {/* COMMENTS */}
      {article.comments_enabled && (
        <section className="max-w-[1250px] mx-auto mb-20">
          <h2 className="text-4xl font-oswald mb-10 text-gray-900 uppercase">
            Comments
          </h2>

          {/* Static example comment */}
          <div className="bg-gray-50 p-6 rounded-2xl mb-10 border border-gray-100">
            <div className="flex gap-4 md:gap-6">
              <Image
                src="https://cdn.builder.io/api/v1/image/assets/TEMP/b813f7ec7409329087b6b428d302c89a813063f6?width=440"
                alt="avatar"
                width={64}
                height={64}
                className="w-12 h-12 md:w-16 md:h-16 rounded-full object-cover border border-gray-200"
              />
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mb-2">
                  <h4 className="font-bold text-lg">Fadhil Mon</h4>
                  <span className="hidden sm:block text-gray-300">•</span>
                  <span className="text-xs sm:text-sm text-gray-500 uppercase tracking-wide">
                    22 MAY 2025
                  </span>
                </div>
                <p className="font-serif text-lg leading-relaxed text-gray-700">
                  അവൾ രൂചിക്കുന്നത് കമാലിന് സ്മാരകങ്ങളായി മാറുന്നു, അവളുപയോഗിച്ചവ
                  സ്വന്തീറ്റും. എന്നിട്ടായാൽ സ്മാരകങ്ങൾ കൊണ്ടൊരു സ്മാരകം പണിത്.
                  താജ്മ ഹലിനെ പോലൊത്ത ഒന്ന്.
                </p>
              </div>
            </div>
          </div>

          {/* Comment form */}
          <div className="bg-white border border-black/10 rounded-3xl p-6 md:p-8 shadow-sm">
            <h3 className="text-xl font-bold mb-6">Leave a Reply</h3>
            <form className="grid gap-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label className="block mb-2 text-sm font-bold text-gray-700">
                    Name
                  </label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition"
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-bold text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="john@example.com"
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition"
                  />
                </div>
              </div>
              <div>
                <label className="block mb-2 text-sm font-bold text-gray-700">
                  Comment
                </label>
                <textarea
                  rows={5}
                  placeholder="Share your thoughts..."
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition resize-y"
                />
              </div>
              <button
                type="button" // Change to submit when logic is ready
                className="w-full sm:w-auto px-10 py-3 bg-red-600 text-white rounded-xl font-bold tracking-wider hover:bg-red-700 transition shadow-md"
              >
                POST COMMENT
              </button>
            </form>
          </div>
        </section>
      )}

      {/* POPULAR SECTION (Placeholder) */}
      <section className="max-w-[1250px] mx-auto mb-20">
        <div className="flex items-center gap-4 mb-8">
          <h2 className="text-4xl font-oswald uppercase">Popular Section</h2>
          <div className="h-px bg-black flex-1 mt-2"></div>
        </div>
        <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-300 text-gray-400">
          Popular articles coming soon...
        </div>
      </section>
    </main>
  );
}