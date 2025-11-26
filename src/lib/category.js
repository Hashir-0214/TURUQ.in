// src/lib/category.js
import { dbConnect } from "@/lib/mongodb";
import Post from "@/models/Post";
import Category from "@/models/Category";
import SubCategory from "@/models/SubCategory";
import Author from "@/models/Author"; 

const ARTICLE_CARD_PROJECTION = 'title slug excerpt content featured_image created_at author_id subcategory_ids';

function formatDate(d) {
  const day = String(d.getDate()).padStart(2, "0");
  const year = d.getFullYear();
  const month = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN",
                 "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"][d.getMonth()];
  return `${day} ${month} ${year}`.toUpperCase();
}

function mapArticle(art) {
  const raw = art.created_at || art.created_at?.$date;
  const dateString = raw ? new Date(raw) : new Date();

  const description = art.excerpt 
    ? art.excerpt 
    : (art.content ? art.content.replace(/<[^>]*>/g, "").slice(0, 150) + "…" : "No description available.");

  return {
    id: art._id.toString(),
    title: art.title || "Untitled",
    slug: art.slug,
    description: description,
    imageSrc: art.featured_image || "https://placehold.co/1200x675/ccc/333?text=Image+Missing",
    categories: art.subcategory_ids?.filter(s => s && s.name).slice(0, 2).map((s) => ({
      name: s.name,
      link: `/category/${s.parent_id?.slug || 'general'}/${s.slug}`,
    })) || [{ name: "GENERAL", link: "/category/general" }],
    author: art.author_id?.name || "Anonymous Writer",
    date: formatDate(dateString),
  };
}

// --- EXISTING MAIN CATEGORY FUNCTION ---
export async function getCategoryData(slug) {
  await dbConnect();
  
  const mainCategory = await Category.findOne({ slug: slug }).lean();
  if (!mainCategory) return { articles: [], mainCategory: null, subCats: [] };

  const subCats = await SubCategory.find({ parent_id: mainCategory._id }).lean();
  const subIds = subCats.map((s) => s._id);

  const articles = await Post
    .find({ status: "published", subcategory_ids: { $in: subIds } })
    .select(ARTICLE_CARD_PROJECTION)
    .populate("author_id")
    .populate({
      path: 'subcategory_ids',
      populate: { path: 'parent_id', model: 'Category', select: 'slug' }
    })
    .sort({ created_at: -1 })
    .lean();

  return {
    articles: articles.map(mapArticle),
    mainCategory,
    subCats,
  };
}

// --- NEW SUB-CATEGORY FUNCTION ---
export async function getSubCategoryData(parentSlug, subSlug) {
  await dbConnect();

  // 1. Verify Parent exists
  const mainCategory = await Category.findOne({ slug: parentSlug }).lean();
  if (!mainCategory) return { articles: [], activeSubCategory: null, mainCategory: null, subCats: [] };

  // 2. Verify Subcategory exists AND belongs to this parent
  const activeSubCategory = await SubCategory.findOne({ 
    slug: subSlug, 
    parent_id: mainCategory._id 
  }).lean();

  if (!activeSubCategory) return { articles: [], activeSubCategory: null, mainCategory, subCats: [] };

  // 3. Get Siblings (for the menu)
  const subCats = await SubCategory.find({ parent_id: mainCategory._id }).lean();

  // 4. Fetch Articles for THIS subcategory only
  const articles = await Post
    .find({ status: "published", subcategory_ids: activeSubCategory._id })
    .select(ARTICLE_CARD_PROJECTION)
    .populate("author_id")
    .populate({
      path: 'subcategory_ids',
      populate: { path: 'parent_id', model: 'Category', select: 'slug' }
    })
    .sort({ created_at: -1 })
    .lean();

  return {
    articles: articles.map(mapArticle),
    activeSubCategory,
    mainCategory,
    subCats,
  };
}