// src/app/api/articles/route.js
import { NextResponse } from "next/server";
import dbConnect from "@/mongodb";
import Post from "@/models/Post";
import Category from "@/models/Category";
import SubCategory from "@/models/SubCategory";

export async function GET(request) {
  await dbConnect();

  const { searchParams } = new URL(request.url);
  const categorySlug = searchParams.get("category");
  const subCategorySlug = searchParams.get("subcategory");

  // QUERY BUILDER
  let query = {
    status: "published" // IMPORTANT: Only show published posts to public!
  };

  try {
    // SCENARIO A: User clicked a Subcategory (e.g., "football")
    if (subCategorySlug) {
      const subCat = await SubCategory.findOne({ slug: subCategorySlug });
      
      if (!subCat) {
        return NextResponse.json([]); // Subcategory doesn't exist
      }
      
      // Find posts where 'subcategory_ids' array contains this specific ID
      query.subcategory_ids = subCat._id;
    } 
    
    // SCENARIO B: User clicked a Main Category (e.g., "sports")
    else if (categorySlug) {
      const mainCat = await Category.findOne({ slug: categorySlug });
      
      if (!mainCat) {
        return NextResponse.json([]);
      }

      // 1. Find ALL subcategories that belong to this main category
      const childSubCategories = await SubCategory.find({ parent_id: mainCat._id });
      
      // 2. Get their IDs
      const childIds = childSubCategories.map(sub => sub._id);

      // 3. Find posts that have ANY of these subcategory IDs
      query.subcategory_ids = { $in: childIds };
    }

    // FETCH POSTS based on the query
    const posts = await Post.find(query)
      .populate("author_id", "name") // Get author name
      .populate("subcategory_ids", "name slug") // Get subcat details
      .sort({ created_at: -1 }) // Newest first
      .limit(10); // Limit to 10 highlights

    return NextResponse.json(posts);

  } catch (error) {
    console.error("Error fetching public articles:", error);
    return NextResponse.json({ message: "Error fetching articles" }, { status: 500 });
  }
}