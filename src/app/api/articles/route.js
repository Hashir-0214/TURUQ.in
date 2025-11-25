// src/app/api/articles/route.js
import { NextResponse } from "next/server";
import dbConnect from "@/mongodb";
import Post from "@/models/Post";
import Category from "@/models/Category";
import SubCategory from "@/models/SubCategory";
import Author from "@/models/Author"; // <--- ADD THIS IMPORT

export async function GET(request) {
  await dbConnect();

  const { searchParams } = new URL(request.url);
  const categorySlug = searchParams.get("category");
  const subCategorySlug = searchParams.get("subcategory");

  let query = {
    status: "published" 
  };

  try {
    if (subCategorySlug) {
      const subCat = await SubCategory.findOne({ slug: subCategorySlug });
      
      if (!subCat) {
        return NextResponse.json([]); 
      }
      
      query.subcategory_ids = subCat._id;
    } 
    
    else if (categorySlug) {
      const mainCat = await Category.findOne({ slug: categorySlug });
      
      if (!mainCat) {
        return NextResponse.json([]);
      }

      const childSubCategories = await SubCategory.find({ parent_id: mainCat._id });
      const childIds = childSubCategories.map(sub => sub._id);

      query.subcategory_ids = { $in: childIds };
    }

    const posts = await Post.find(query)
      .populate("author_id", "name") 
      .populate("subcategory_ids", "name slug") 
      .sort({ created_at: -1 }) 
      .limit(10); 

    return NextResponse.json(posts);

  } catch (error) {
    console.error("Error fetching public articles:", error);
    return NextResponse.json({ message: "Error fetching articles" }, { status: 500 });
  }
}