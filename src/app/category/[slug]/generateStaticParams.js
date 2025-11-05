// app/category/[slug]/generateStaticParams.js

import { dbConnect } from "@/lib/mongodb";
import Category from "@/models/Category";
import SubCategory from "@/models/SubCategory";

export async function generateStaticParams() {
  await dbConnect();
  
  // Fetch all main category slugs
  const categories = await Category.find({}).select('slug').lean();
  const categorySlugs = categories.map((c) => ({ slug: c.slug }));

  // Fetch all subcategory slugs
  const subCategories = await SubCategory.find({}).select('slug').lean();
  const subCategorySlugs = subCategories.map((s) => ({ slug: s.slug }));

  // Combine both arrays (Note: Next.js only needs the 'slug' key)
  return [...categorySlugs, ...subCategorySlugs];
}
