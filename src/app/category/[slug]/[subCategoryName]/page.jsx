// src/app/category/[slug]/[subCategoryName]/page.jsx

import { notFound } from "next/navigation";
import { getSubCategoryData } from "@/lib/category";
import Footer from "@/components/footer/footer";
import Tag from "@/components/ui/tag";
import CategoryArticles from "./CategoryArticles";

// Import the SAME CSS Module from the parent directory for the layout
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

        {/* ARTICLES GRID (Client Component handles "See More") */}
        <CategoryArticles articles={articles} />
      </div>

      <Footer />
    </main>
  );
}