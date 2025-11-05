// src/app/[slug]/page.js

import Tag from "@/components/ui/tag";
import { getArticle } from "@/lib/mongodb";
import { VscLiveShare } from "react-icons/vsc";
import { notFound } from "next/navigation";

/* ----------  STATIC META  ---------- */
export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  const article = await getArticle(slug);

  if (!article) return { title: "Not found" };
  return {
    title: `${article.title} — TURUQ`,
    description: article.excerpt,
  };
}

/* ----------  PAGE  ---------- */
export default async function ArticlePage({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  const article = await getArticle(slug);

  if (!article) notFound();

  const author = article.author_id || {};

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

  /* ----------  JSX  ---------- */
  return (
    <main className="mt-36 px-4">
      {/* FEATURED IMAGE */}
      <section className="flex flex-col items-center max-w-[1250px] h-auto mx-auto border border-black rounded-[20px] p-5 mb-10 overflow-hidden">
        <img
          src={article.featured_image || "https://placeholder.com/1200x540"}
          alt={article.title || "Featured article image"}
          className="w-full h-[540px] object-cover rounded-[20px]"
        />
      </section>

      <div className="max-w-[1250px] mx-auto flex flex-col lg:flex-row items-baseline justify-between gap-10 px-1">
        {/* RIGHT: AUTHOR + SHARE */}
        <aside className="flex flex-col flex-shrink-0 items-center gap-6 w-full lg:w-[300px]">
          <div className="w-full border-2 border-black rounded-3xl p-6 text-center bg-none shadow-lg hover:shadow-xl transition-shadow">
            <div className="text-xs font-bold tracking-wider mb-4 text-gray-600">
              AUTHOR
            </div>

            <div className="relative inline-block mb-4">
              <img
                src={
                  author.avatar ||
                  "https://cdn.builder.io/api/v1/image/assets/TEMP/9bb4988949e5939edbdc39fb1f4c712bf3b7921a?width=598"
                }
                alt={author.name || "Author"}
                className="w-28 h-28 rounded-full object-cover border-4 border-black shadow-md"
              />
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-transparent to-black/10"></div>
            </div>

            <h3 className="font-bold text-lg mb-2">
              {author.name || "Unknown Author"}
            </h3>

            <p className="text-sm text-gray-600 leading-relaxed mb-5 px-2">
              {author.biography || "No biography available."}
            </p>

            <button className="w-full px-6 py-3 border-red-700 text-red-700 rounded-xl border-2 hover:bg-red-700 hover:text-white hover:cursor-pointer hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 uppercase text-sm font-bold tracking-wide shadow-md hover:shadow-lg">
              Visit Profile
            </button>
          </div>

          <button className="flex flex-row items-center justify-center gap-3 border-2 cursor-pointer border-black rounded-full px-6 py-3 bg-none hover:bg-black hover:text-white transition-all duration-200 shadow-md hover:shadow-lg group">
            <VscLiveShare className="h-5 w-5 group-hover:scale-110 transition-transform" />
          </button>
        </aside>

        {/* LEFT: CONTENT */}
        <article>
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-2">
              {article.tags &&
                article.tags.slice(0, 3).map((tag, index) => (
                  <Tag
                    linkClassName={`text-[12px] px-2`}
                    link={`/tag/${encodeURIComponent(tag)}`}
                    key={index}
                  >
                    {tag}
                  </Tag>
                ))}
              {(!article.tags || article.tags.length === 0) && (
                <Tag link="/tag/uncategorized">UNCATEGORIZED</Tag>
              )}
            </div>
            <div className="flex gap-4 text-sm text-gray-700">
              <span>
                {formatDate(article.published_at || article.created_at)}
              </span>
              <span>6 Min Read</span>
            </div>
          </div>

          <h1 className="local-font-rachana font-extrabold text-[50px] leading-14 text-red-800 mb-8">
            {article.title}
          </h1>

          {/* Article Excerpt */}
          {/* {article.excerpt && (
             <p className="font-serif text-2xl text-gray-700 italic mb-10">{article.excerpt}</p>
          )} */}

          <div
            className="article-content local-font-rachana max-w-none"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </article>
      </div>

      {/* DIVIDER */}
      <div className="w-full h-px bg-black my-14" />

      {/* COMMENTS */}
      {article.comments_enabled && (
        <section className="max-w-5xl mx-auto">
          <h2 className="text-5xl font-oswald mb-10">Comments</h2>

          {/* Existing comment (static for now, should be fetched later) */}
          <div className="flex gap-6 mb-10">
            <img
              src="https://cdn.builder.io/api/v1/image/assets/TEMP/b813f7ec7409329087b6b428d302c89a813063f6?width=440"
              alt="avatar"
              className="w-24 h-24 rounded-full object-cover"
            />
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h4 className="font-semibold">Fadhil Mon</h4>
                <span className="text-sm text-gray-600">
                  22 MAY 2025 12:50:03 PM
                </span>
              </div>
              <p className="font-serif text-xl leading-relaxed">
                അവൾ രൂചിക്കുന്നത് കമാലിന് സ്മാരകങ്ങളായി മാറുന്നു, അവളുപയോഗിച്ചവ
                സ്വന്തീറ്റും. എന്നിട്ടായാൽ സ്മാരകങ്ങൾ കൊണ്ടൊരു സ്മാരകം പണിത്.
                താജ്മ ഹലിനെ പോലൊത്ത ഒന്ന്.
              </p>
            </div>
          </div>

          {/* Comment form */}
          <form className="grid gap-6">
            <div>
              <label className="block mb-2">Comment</label>
              <textarea
                rows={5}
                placeholder="Write your comment here..."
                className="w-full border border-black rounded-2xl p-4 bg-transparent"
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <label className="block mb-2">Name</label>
                <input
                  type="text"
                  placeholder="Your name"
                  className="w-full border border-black rounded-2xl p-4 bg-transparent"
                />
              </div>
              <div>
                <label className="block mb-2">Email</label>
                <input
                  type="email"
                  placeholder="Your email"
                  className="w-full border border-black rounded-2xl p-4 bg-transparent"
                />
              </div>
            </div>
            <button className="w-full sm:w-auto px-10 py-4 bg-red-600 text-white rounded-2xl border border-black">
              SUBMIT
            </button>
          </form>
        </section>
      )}

      {/* DIVIDER */}
      <div className="w-full h-px bg-black my-14" />
      <p className="text-4xl font-oswald">Popular Section</p>
    </main>
  );
}
