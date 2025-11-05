import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getCategoryData } from "@/lib/category";
import Footer from "@/components/footer/footer";

/* ------------------------------------------------------------------ */
/* METADATA: Dynamic title based on slug                              */
/* ------------------------------------------------------------------ */
export async function generateMetadata({ params }) {
  const { slug } = await params;

  // Fetch data to get the proper name
  const { mainCategory } = await getCategoryData(slug); // <-- CORRECTED

  if (!mainCategory) return { title: "Category Not Found" };

  return {
    title: `${mainCategory.name} - TURUQ`,
    description: `All articles under the ${mainCategory.name} category.`,
  };
}

/* ------------------------------------------------------------------ */
/* PAGE: Server Component for Main Category Articles                  */
/* ------------------------------------------------------------------ */
export default async function DynamicCategoryPage({ params }) {
  const { slug } = await params;

  const { articles, subCats, mainCategory } = await getCategoryData(slug); // <-- CORRECTED

  if (!articles.length || !mainCategory) notFound(); // 404 if no articles found

  const currentCategoryName = mainCategory.name;

  // Determine the filter links (SubCategories)
  const filterLinks = [
    { label: `All ${currentCategoryName}`, slug: slug },
    ...subCats.map((s) => ({ label: s.name, slug: s.slug })),
  ];

  // Title/Breadcrumb logic
  const headerContent = (
    <h1 className="font-['Oswald'] text-6xl text-center uppercase">
      {currentCategoryName}
    </h1>
  );

  return (
    <main className="bg-[#ffedd9] text-black">
      {/* HEAD ------------------------------------------------------- */}
      <section className="w-11/12 max-w-[1250px] mx-auto border border-black rounded-[20px] py-8 px-14 mb-6 mt-44">
        {headerContent}
      </section>

      {/* SUB-FILTER (SubCategories) --------------------------------- */}
      {filterLinks.length > 1 && (
        <nav className="w-11/12 max-w-[1250px] mx-auto flex gap-4 overflow-auto pb-4">
          {filterLinks.map((l) => (
            <Link
              key={l.slug}
              // Link structure: /category/parent-slug/sub-slug or /category/parent-slug
              href={
                l.label.startsWith("All")
                  ? `/category/${slug}`
                  : `/category/${slug}/${l.slug}`
              }
              className={`shrink-0 border border-black rounded px-3 py-1 text-sm
                ${
                  l.slug === slug // Active when viewing the main category page
                    ? "bg-[#D64545] text-white"
                    : "bg-transparent"
                }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      )}

      {/* ARTICLES GRID ------------------------------------------------- */}
      <div className="w-11/12 max-w-[1250px] mx-auto grid grid-cols-4 gap-5 mt-8">
        {articles.map((a, idx) => (
          <ArticleCard key={a.id} article={a} idx={idx} />
        ))}
      </div>

      {/* SEE MORE --------------------------------------------------- */}
      <div className="w-11/12 max-w-[1250px] mx-auto mt-10 mb-10">
        <button className="w-full h-20 bg-[#D64545] text-white rounded-[15px] hover:bg-[#a43333]">
          SEE MORE
        </button>
      </div>

      {/* FOOTER ----------------------------------------------------- */}
      <Footer />
    </main>
  );
}

/* ------------------------------------------------------------------ */
/* ArticleCard - Reused Component (must be defined in every page.jsx) */
/* ------------------------------------------------------------------ */
function ArticleCard({ article: a, idx }) {
  const isBig = idx === 0;
  const isWide = idx === 1 || idx === 8;
  const noImage = idx === 3 || idx === 7;

  const base =
    "border border-black rounded-[20px] bg-[#ffedd9] overflow-hidden";
  const cls = isBig
    ? `${base} col-span-4 flex flex-row-reverse gap-10 p-10 h-[510px]`
    : isWide
    ? `${base} col-span-2`
    : `${base} col-span-1`;

  return (
    <article className={cls}>
      {!noImage && (
        <div
          className={`${
            isBig
              ? "w-[620px] h-[430px] relative"
              : "w-full aspect-[26/22.5] relative"
          } rounded-[20px] overflow-hidden`}
        >
          {/* Using Image component, relying on global loader config */}
          <Image
            src={a.imageSrc}
            alt={a.titleMalayalam}
            fill
            sizes={
              isBig
                ? "(max-width: 1250px) 100vw, 620px"
                : "(max-width: 768px) 50vw, 25vw"
            }
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div
        className={`flex flex-col justify-between ${isBig ? "pt-0" : "pt-4"}`}
      >
        {/* tags */}
        <div className="flex gap-2 mb-4">
          {a.categories.map((c) => (
            <Link
              key={c.name}
              href={c.link} // Links directly to the subcategory path
              className="text-[10px] border border-black rounded px-1 hover:bg-black hover:text-white transition-colors"
            >
              {c.name}
            </Link>
          ))}
        </div>

        {/* title + desc */}
        <div>
          <Link href={`/${a.slug}`}>
            <h2
              className={`font-['Rachana'] text-[#A82A2A] font-bold hover:text-red-700 transition-colors
                ${
                  isBig
                    ? "text-5xl leading-[45px]"
                    : "text-[23px] leading-[22px]"
                }`}
            >
              {a.titleMalayalam}
            </h2>
          </Link>

          {(isBig || noImage) && (
            <p className="font-['Rachana'] text-lg mt-3">
              {a.descriptionMalayalam}
            </p>
          )}
        </div>

        {/* meta */}
        <div className="flex items-center gap-2 text-xs mt-3">
          <span className="font-['Poppins']">{a.author}</span>
          <span>|</span>
          <span className="font-['Poppins'] text-black/45">{a.date}</span>
        </div>
      </div>
    </article>
  );
}
