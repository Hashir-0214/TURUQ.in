// src/app/category/[slug]/[subCategoryName]/page.jsx

import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getSubCategoryData } from "@/lib/category";
import Footer from "@/components/footer/footer";
import Tag from "@/components/ui/tag";

// Import the SAME CSS Module from the parent directory
import styles from "../category.module.css";

/* ------------------------------------------------------------------ */
/* METADATA                                                           */
/* ------------------------------------------------------------------ */
export async function generateMetadata({ params }) {
  const { slug, subCategoryName } = await params;
  const { activeSubCategory, mainCategory } = await getSubCategoryData(slug, subCategoryName);

  if (!activeSubCategory || !mainCategory) return { title: "Category Not Found" };

  return {
    title: `${activeSubCategory.name} | ${mainCategory.name} - TURUQ`,
    description: `Articles in ${activeSubCategory.name}, under ${mainCategory.name}.`,
  };
}

/* ------------------------------------------------------------------ */
/* PAGE COMPONENT                                                     */
/* ------------------------------------------------------------------ */
export default async function SubCategoryPage({ params }) {
  const { slug, subCategoryName } = await params;

  // Fetch specific subcategory data
  const { articles, activeSubCategory, mainCategory, subCats } = await getSubCategoryData(slug, subCategoryName);

  // 404 if subcategory doesn't exist or doesn't match parent
  if (!activeSubCategory || !mainCategory) {
    notFound();
  }

  // Build the filter links (Siblings + "All")
  const filterLinks = [
    { label: `All ${mainCategory.name}`, slug: slug, isMain: true },
    ...subCats.map((s) => ({ label: s.name, slug: s.slug, isMain: false })),
  ];

  return (
    <main className={styles.mainContent}>
      <div className={styles.container}>
        
        {/* HEADER: Show Subcategory Name */}
        <section className={styles.categoryHeader}>
          <h1 className={styles.categoryTitle}>
            {activeSubCategory.name}
          </h1>
        </section>

        {/* FILTER NAVIGATION */}
        <nav className={styles.subCategoryContainer}>
          {filterLinks.map((l) => (
            <Tag
              key={l.slug}
              // If it's the "All" link, go to /category/parentSlug
              // If it's a sibling subcat, go to /category/parentSlug/subSlug
              link={
                l.isMain
                  ? `/category/${mainCategory.slug}`
                  : `/category/${mainCategory.slug}/${l.slug}`
              }
              // Highlight if this is the current subcategory
              className={l.slug === subCategoryName ? "!bg-[#D64545] !text-white" : ""}
            >
              {l.label}
            </Tag>
          ))}
        </nav>

        {/* ARTICLES GRID */}
        {articles.length > 0 ? (
          <div className={styles.articlesContainer}>
            {articles.map((a, idx) => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <h2 style={{ fontFamily: "Rachana", fontSize: "24px", color: "gray" }}>
              No articles found in {activeSubCategory.name} yet.
            </h2>
          </div>
        )}

        {/* SEE MORE BUTTON */}
        {articles.length > 0 && (
          <div className={styles.seeMoreSection}>
            <button className={styles.seeMoreBtn}>
              SEE MORE
            </button>
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}

/* ------------------------------------------------------------------ */
/* ArticleCard Component (Identical to parent page)                   */
/* ------------------------------------------------------------------ */
function ArticleCard({ article: a }) {
  return (
    <article className={styles.articleCard}>
      <div className={styles.articleImage}>
        <Image
          src={a.imageSrc}
          alt={a.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          style={{ objectFit: "cover" }}
        />
      </div>

      <div className={styles.cardContent}>
        <div>
          <div className={styles.tags}>
            {a.categories.map((c) => (
              <Tag key={c.name} link={c.link}>
                {c.name}
              </Tag>
            ))}
          </div>

          <Link href={`/${a.slug}`} className={styles.articleTitle}>
            {a.title}
          </Link>

          <p className={styles.articleDescription}>
            {a.description}
          </p>
        </div>

        <div className={styles.articleMeta}>
          <span className={styles.author}>{a.author}</span>
          <span className={styles.divider}>|</span>
          <span className={styles.date}>{a.date}</span>
        </div>
      </div>
    </article>
  );
}