// lib/category.js
import { dbConnect } from "@/lib/mongodb";
import Post from "@/models/Post";
import Category from "@/models/Category";
import SubCategory from "@/models/SubCategory";

/* -------------------- PROJECTION CONSTANT -------------------- */
// Define the fields needed for the ArticleCard component (Performance optimization)
const ARTICLE_CARD_PROJECTION = 'title slug excerpt featured_image created_at author_id subcategory_ids';

/* ---- Article Data Mapper (shared utility) ------------------------ */
function mapArticle(art) {
  const raw = art.created_at || art.created_at?.$date;
  const dateString = raw ? new Date(raw) : new Date();

  return {
    id: art._id.toString(),
    titleMalayalam: art.title || "Untitled",
    slug: art.slug,
    descriptionMalayalam:
      art.excerpt ||
      (art.content ? art.content.replace(/<[^>]*>/g, "").slice(0, 150) + "…" : "No description available."),
    imageSrc: art.featured_image || "https://placehold.co/1200x675/ccc/333?text=Image+Missing",
    categories: art.subcategory_ids?.slice(0, 2).map((s) => ({
      name: s.name,
      link: `/category/${s.parentSlug}/${s.slug}`, // Use correct nested link path
    })) || [{ name: "GENERAL", link: "/category/general" }],
    author: art.author_id?.name || "Anonymous Writer",
    date: formatDate(dateString),
  };
}

function formatDate(d) {
  const day = String(d.getDate()).padStart(2, "0");
  const year = d.getFullYear();
  const month = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN",
                 "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"][d.getMonth()];
  return `${day} ${month} ${year}`.toUpperCase();
}


/* ------------------------------------------------------------------ */
/* 1. DATA FOR: src/app/category/[slug]/page.jsx (Main Category)      */
/* ------------------------------------------------------------------ */
export async function getCategoryData(slug) {
  await dbConnect();
  
  // 1. Find the main Category
  const mainCategory = await Category.findOne({ slug: slug }).lean();

  if (!mainCategory) return { articles: [], mainCategory: null, subCats: [] };

  // 2. Find all SubCategories linked to this parent_id
  const subCats = await SubCategory.find({ parent_id: mainCategory._id }).lean();
  const subIds = subCats.map((s) => s._id);

  // 3. Get articles associated with ANY of these subcategory IDs
  const articles = await Post
    .find({ status: "published", subcategory_ids: { $in: subIds } })
    .select(ARTICLE_CARD_PROJECTION) // Performance: Project fields
    .populate("author_id")
    .populate("subcategory_ids")
    .sort({ created_at: -1 })
    .lean();

  return {
    articles: articles.map(mapArticle),
    mainCategory,
    subCats,
  };
}

/* ------------------------------------------------------------------ */
/* 2. DATA FOR: src/app/category/[slug]/[subCategoryName]/page.jsx    */
/* ------------------------------------------------------------------ */
export async function getSubCategoryData(subCategorySlug) {
  await dbConnect();

  // 1. Find the specific SubCategory
  const subCategory = await SubCategory.findOne({ slug: subCategorySlug }).lean();
  if (!subCategory) return { articles: [], subCategory: null, parentCategory: null };
  
  // 2. Fetch the Parent Category for breadcrumb linking
  const parentCategory = await Category.findById(subCategory.parent_id).select('name slug').lean();

  // 3. Fetch posts belonging ONLY to this subcategory ID
  const articles = await Post
    .find({ status: "published", subcategory_ids: subCategory._id })
    .select(ARTICLE_CARD_PROJECTION) // Performance: Project fields
    .populate("author_id")
    .populate("subcategory_ids")
    .sort({ created_at: -1 })
    .lean();

  return {
    articles: articles.map(mapArticle),
    subCategory,
    parentCategory,
  };
}
