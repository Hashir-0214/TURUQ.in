// src/app/api/search/route.js

import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import Post from "@/models/Post";
import "@/models/Author"; 
import "@/models/SubCategory";

// Helper to format date like "22 MAY 2025"
const formatDate = (dateString) => {
  const dateObj = new Date(dateString);
  if (isNaN(dateObj.getTime())) return '';
  const day = String(dateObj.getDate()).padStart(2, '0');
  const year = dateObj.getFullYear();
  const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
  const formattedMonth = monthNames[dateObj.getMonth()];
  return `${day} ${formattedMonth} ${year}`.toUpperCase();
};

export async function GET(request) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || query.trim().length === 0) {
        return NextResponse.json([]);
    }

    // Case-insensitive regex search on Title
    const searchRegex = new RegExp(query, 'i');

    const posts = await Post.find({
        status: 'published',
        title: { $regex: searchRegex }
    })
    .sort({ created_at: -1 })
    .limit(12) 
    .populate('author_id')
    .populate('subcategory_ids')
    .lean();

    // Map to the exact structure the SearchOverlay expects
    const results = posts.map(article => {
        const rawDate = article.created_at || article.created_at?.$date;
        const dateString = rawDate ? rawDate : new Date();

        // Flatten categories to an array of strings like ['UNITED', 'ARCHITECTURE']
        let categories = [];
        if (Array.isArray(article.subcategory_ids)) {
            categories = article.subcategory_ids
                .filter(sub => sub && sub.name)
                .map(sub => sub.name.toUpperCase())
                .slice(0, 2);
        }
        if (categories.length === 0) categories = ['GENERAL'];

        return {
            id: article._id.toString(),
            title: article.title || 'Untitled',
            author: article.author_id?.name || 'Anonymous',
            date: formatDate(dateString),
            categories: categories, 
            link: `/article/${article.slug}`, // Construct the full link here
            image: article.featured_image || 'https://placehold.co/200x150/ccc/333?text=Image+Missing',
        };
    });

    return NextResponse.json(results);

  } catch (error) {
    console.error("Search API Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}