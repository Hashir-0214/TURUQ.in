// src/lib/article-service.js
import dbConnect from "@/mongodb";
import Post from "@/models/Post";
import "@/models/Author"; 
import "@/models/SubCategory";

// --- HELPER FUNCTIONS ---
const formatDate = (dateString) => {
  const dateObj = new Date(dateString);
  if (isNaN(dateObj.getTime())) return 'Unknown Date';
  const day = String(dateObj.getDate()).padStart(2, '0');
  const year = dateObj.getFullYear();
  const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
  const formattedMonth = monthNames[dateObj.getMonth()];
  return `${day} ${formattedMonth} ${year}`.toUpperCase();
};

const mapArticleData = (article) => {
  const rawDate = article.created_at || article.created_at?.$date;
  const dateString = rawDate ? rawDate : new Date();

  let authorName = 'Anonymous Writer';
  // detailed check to ensure author_id is populated and valid
  if (article.author_id && article.author_id.name) {
    authorName = article.author_id.name;
  }

  let categories = [];
  if (Array.isArray(article.subcategory_ids)) {
    categories = article.subcategory_ids
      .filter(subcat => subcat && subcat.name && subcat.slug)
      .map(subcat => ({
        name: subcat.name,
        link: `/category/${subcat.slug}`
      }))
      .slice(0, 2);
  }

  if (categories.length === 0) {
    categories.push({ name: 'GENERAL', link: '/category/general' });
  }

  return {
    id: article._id.toString(),
    is_featured: article.permissions?.is_featured || false,
    titleMalayalam: article.title || 'Untitled Article',
    slug: article.slug,
    descriptionMalayalam: article.excerpt || (article.content ? article.content.replace(/<[^>]*>/g, '').substring(0, 150) + '...' : 'No description available.'),
    imageSrc: article.featured_image || 'https://placehold.co/1200x675/ccc/333?text=Image+Missing',
    categories: categories,
    author: authorName,
    date: formatDate(dateString),
    timestamp: new Date(dateString).getTime(),
  };
};

// --- MAIN DATA FUNCTION ---
export async function getHomeData() {
  try {
    await dbConnect();

    // Fetch all published posts
    const posts = await Post.find({ status: 'published' })
      .sort({ created_at: -1 })
      .populate('author_id')        // Requires 'Author' model to be registered
      .populate('subcategory_ids')  // Requires 'SubCategory' model to be registered
      .lean()
      .exec();

    // Process the data
    const allMappedArticles = posts.map(article => mapArticleData(article));

    const featuredArticles = allMappedArticles
        .filter(a => a.is_featured)
        .slice(0, 4);

    const mostRecentArticles = allMappedArticles.slice(0, 12);

    return { featuredArticles, mostRecentArticles };

  } catch (error) {
    console.error("Service Error in getHomeData:", error);
    // Return empty arrays so the UI handles it gracefully
    return { featuredArticles: [], mostRecentArticles: [] };
  }
}