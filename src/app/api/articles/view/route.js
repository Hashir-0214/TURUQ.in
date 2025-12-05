// src/app/api/articles/view/route.js
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb"; // Adjust path if your dbConnect is in @/mongodb
import Post from "@/models/Post";

export async function POST(request) {
  try {
    await dbConnect();
    const { slug } = await request.json();

    if (!slug) {
      return NextResponse.json({ message: "Slug is required" }, { status: 400 });
    }

    // $inc is atomic and efficient
    await Post.findOneAndUpdate(
      { slug },
      { $inc: { views: 1 } }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error incrementing view:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}