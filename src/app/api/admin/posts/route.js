// app/api/admin/posts/route.js
import { NextResponse } from "next/server";
import dbConnect from "@/mongodb";
import Post from "@/models/Post";

const SERVER_API_KEY = process.env.NEXT_PUBLIC_API_KEY || process.env.API_KEY;

const slugify = (text) => {
  if (!text) return "";
  let slug = text.toString().toLowerCase();
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

  if (!apikey || apikey !== SERVER_API_KEY) {
    console.error("Auth failed in GET /posts. Received:", apikey ? "key present" : "no key");
    return NextResponse.json({ message: "Unauthorized, key missing" }, { status: 401 });
  }

  try {
    const posts = await Post.find().sort({ created_at: -1 });
    return NextResponse.json({ data: posts });
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json(
      { message: "Error fetching posts" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await dbConnect();
  } catch (e) {
    console.error("Database connection failed in POST /posts:", e);
    return NextResponse.json(
      { message: "Database connection failed" },
      { status: 500 }
    );
  }

  const apikey = request.headers.get("x-api-key");

  if (!apikey || apikey !== SERVER_API_KEY) {
    console.error("Auth failed in POST /posts");
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await request.json();

    let postSlug = data.slug;
    if (!postSlug || postSlug.trim() === '') {
      if (!data.title) {
        return NextResponse.json({ message: 'Title is required.' }, { status: 400 });
      }
      postSlug = slugify(data.title);
    }

    const newPost = new Post({
      ...data,
      slug: postSlug,
      views: 0,
    });

    await newPost.save();
    return NextResponse.json({ data: newPost }, { status: 201 });
  } catch (error) {
    console.error("Post creation error:", error);

    if (error.code === 11000) {
      return NextResponse.json({ error: 'Post with this slug already exists.' }, { status: 409 });
    }
    if (error.name === 'ValidationError') {
      return NextResponse.json({ error: `Validation failed: ${error.message}` }, { status: 400 });
    }

    return NextResponse.json({ error: 'Error creating post' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    await dbConnect();
  } catch (e) {
    console.error("Database connection failed in DELETE /posts:", e);
    return NextResponse.json(
      { message: "Database connection failed" },
      { status: 500 }
    );
  }

  const apikey = request.headers.get("x-api-key");

  if (!apikey || apikey !== SERVER_API_KEY) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { _id } = await request.json();
    
    if (!_id) {
      return NextResponse.json({ message: 'Post ID is required' }, { status: 400 });
    }

    await Post.findByIdAndDelete(_id);
    return NextResponse.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error("Post deletion error:", error);
    return NextResponse.json({ error: 'Error deleting post' }, { status: 500 });
  }
}