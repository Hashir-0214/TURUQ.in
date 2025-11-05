// src/app/category/[slug]/[subCategoryName]/page.jsx

import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getSubCategoryData } from "@/lib/category"; // Corrected import
import Footer from "@/components/footer/footer";

/* ------------------------------------------------------------------ */
/* METADATA: Dynamic title based on subCategoryName                   */
/* ------------------------------------------------------------------ */
export async function generateMetadata({ params }) {
  const { subCategoryName } = await params;
  
  // Fetch data to get the proper name
  const { subCategory } = await getSubCategoryData(subCategoryName);

  if (!subCategory) return { title: "Sub-Category Not Found" };

  const displayName = subCategory.name;

  return {
    title: `${displayName} Articles - TURUQ`,
    description: `All articles categorized under ${displayName}.`,
  };
}

/* ------------------------------------------------------------------ */
/* PAGE: Server Component for SubCategory Articles                    */
/* ------------------------------------------------------------------ */
export default async function SubCategoryPage({ params }) {
  const { slug, subCategoryName } = await params; 
  
  // High-performance data fetch (using the dedicated subcategory function)
  const { articles, subCategory, parentCategory } = await getSubCategoryData(subCategoryName);

  if (!articles.length || !subCategory || !parentCategory) {
    notFound(); 
  }
  
  const subCategoryNameDisplay = subCategory.name;
  const parentCategorySlug = parentCategory.slug;
  
  return (
    <main className="bg-[#ffedd9] text-black">
      {/* HEADER - Display Category > SubCategory Path */}
      <section className="w-11/12 max-w-[1250px] mx-auto border border-black rounded-[20px] py-8 px-14 mb-6 mt-44">
        <h1 className="font-['Oswald'] text-6xl text-center uppercase">
          {/* Breadcrumb back to main category */}
          <Link href={`/category/${parentCategorySlug}`} className="text-gray-500 hover:text-black transition-colors">
            {parentCategorySlug}
          </Link>
          <span className="mx-4 text-gray-500">/</span>
          {subCategoryNameDisplay}
        </h1>
      </section>
      
      {/* ARTICLES GRID ------------------------------------------------- */}
      <div className="w-11/12 max-w-[1250px] mx-auto grid grid-cols-4 gap-5 mt-8">
        {articles.map((a, idx) => (
          <ArticleCard key={a.id} article={a} idx={idx} />
        ))}
      </div>
      
      {/* SEE MORE */}
      <div className="w-11/12 max-w-[1250px] mx-auto mt-10 mb-10">
        <button className="w-full h-20 bg-[#D64545] text-white rounded-[15px] hover:bg-[#a43333]">
          SEE MORE
        </button>
      </div>
      
      {/* FOOTER */}
      <Footer />
    </main>
  );
}

/* ------------------------------------------------------------------ */
/* ArticleCard - Reused Component (copied from main page for ease)    */
/* ------------------------------------------------------------------ */
function ArticleCard({ article: a, idx }) {
  const isBig = idx === 0;
  const isWide = idx === 1 || idx === 8;
  const noImage = idx === 3 || idx === 7;

  const base = "border border-black rounded-[20px] bg-[#ffedd9] overflow-hidden";
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
            isBig ? "w-[620px] h-[430px] relative" : "w-full aspect-[26/22.5] relative"
          } rounded-[20px] overflow-hidden`}
        >
          {/* Using Image component, relying on global loader config */}
          <Image
            src={a.imageSrc}
            alt={a.titleMalayalam}
            fill
            sizes={isBig ? "(max-width: 1250px) 100vw, 620px" : "(max-width: 768px) 50vw, 25vw"}
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
                  isBig ? "text-5xl leading-[45px]" : "text-[23px] leading-[22px]"
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
