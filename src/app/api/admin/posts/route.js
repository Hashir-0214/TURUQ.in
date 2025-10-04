// app/api/admin/posts/route.js
import { NextResponse } from "next/server";
import dbConnect from "@/mongodb";
import Post from "@/models/Post";

const SERVER_API_KEY = process.env.NEXT_PUBLIC_API_KEY || process.env.API_KEY;

const slugify = (text) => {
  if (!text) return "";
  let slug = text.toString().toLowerCase();
  // Assuming MALAYALAM_MAP is also available here if needed for server-side slug validation

  return slug
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");
};

export async function GET(request) {
  try {
    await dbConnect();
  } catch (e) {
    console.error("Database connection failed in GET /posts:", e);
    return NextResponse.json(
      { message: "Database connection failed" },
      { status: 500 }
    );
  }

  const apikey = request.headers.get("x-api-key");

  if (apikey != SERVER_API_KEY) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const posts = await Post.find().sort({ created_at: -1 });
    return NextResponse.json(posts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json(
      { message: "Error fetching posts" },
      { status: 500 }
    );
  }
}

export async function POST(request) {}

export async function PUT(request) {}

export async function DELETE(request) {}
