// app/api/admin/posts/route.js
import { NextResponse } from "next/server";
import dbConnect from "@/mongodb";
import Post from "@/models/Post";

const SERVER_API_KEY = process.env.NEXT_PUBLIC_API_KEY || process.env.API_KEY;

const slugify = (text) => {
  if (!text) return "";
  let slug = text.toString().toLowerCase();
  // Ensure we strip leading/trailing hyphens for robustness
  return slug
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+|-+$/g, ""); 
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

  // Check for specific post ID in query parameters (for EditPostForm's initial fetch)
  const { searchParams } = new URL(request.url);
  const postId = searchParams.get('id');
  
  if (postId) {
      try {
          // Populate author and subcategories for the Edit form data initialization
          const post = await Post.findById(postId)
              .populate('author_id')
              .populate('subcategory_ids');
              
          if (!post) {
              return NextResponse.json({ message: "Post not found" }, { status: 404 });
          }
          return NextResponse.json({ data: post });
      } catch (error) {
          console.error(`Error fetching single post ${postId}:`, error);
          return NextResponse.json({ message: "Error fetching post" }, { status: 500 });
      }
  }

  // Default behavior: Fetch all posts
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
    
    // Ensure data coming from client is correctly structured for the schema
    const newPost = new Post({
      ...data,
      slug: postSlug,
      views: 0,
      tags: Array.isArray(data.tags) ? data.tags : (data.tags || "").split(",").map(t => t.trim()).filter(Boolean),
      subcategory_ids: Array.isArray(data.subcategory_ids) ? data.subcategory_ids : (data.subcategory_ids || []),
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

// NEW FUNCTION: Handle PUT request for updating a post
export async function PUT(request) {
  try {
    await dbConnect();
  } catch (e) {
    console.error("Database connection failed in PUT /posts:", e);
    return NextResponse.json(
      { message: "Database connection failed" },
      { status: 500 }
    );
  }

  const apikey = request.headers.get("x-api-key");

  if (!apikey || apikey !== SERVER_API_KEY) {
    console.error("Auth failed in PUT /posts");
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await request.json();
    const { _id, slug: incomingSlug, title, ...updateData } = data;

    if (!_id) {
        return NextResponse.json({ message: 'Post ID is required for update.' }, { status: 400 });
    }
    
    // 1. Validate/Generate Slug
    let finalSlug = incomingSlug;
    if (!finalSlug || finalSlug.trim() === '') {
        if (!title) {
            return NextResponse.json({ message: 'Title is required to generate slug.' }, { status: 400 });
        }
        finalSlug = slugify(title);
    }
    
    // 2. Check for slug uniqueness against ALL OTHER posts
    const existingPost = await Post.findOne({ slug: finalSlug, _id: { $ne: _id } });
    if (existingPost) {
        return NextResponse.json({ error: `Post with slug '${finalSlug}' already exists.` }, { status: 409 });
    }

    // Prepare the update object, ensuring title and slug are included
    const update = {
        title,
        slug: finalSlug,
        ...updateData,
        // Ensure tags and subcategory_ids are processed correctly
        tags: Array.isArray(updateData.tags) ? updateData.tags : (updateData.tags || []),
        subcategory_ids: Array.isArray(updateData.subcategory_ids) ? updateData.subcategory_ids : (updateData.subcategory_ids || []),
    };
    
    // Remove unwanted fields that might cause issues (like views, which should be updated separately)
    delete update.views; 
    delete update.created_at; 
    
    // Find and update the document
    const updatedPost = await Post.findByIdAndUpdate(
        _id, 
        update, 
        { new: true, runValidators: true } 
    )
    .populate('author_id') // Re-populate for the client to receive a complete object for table refresh
    .populate('subcategory_ids');

    if (!updatedPost) {
        return NextResponse.json({ message: "Post not found for update" }, { status: 404 });
    }

    return NextResponse.json({ data: updatedPost });

  } catch (error) {
    console.error("Post update error:", error);

    if (error.code === 11000) {
      return NextResponse.json({ error: 'Post with this slug already exists.' }, { status: 409 });
    }
    if (error.name === 'ValidationError') {
      return NextResponse.json({ error: `Validation failed: ${error.message}` }, { status: 400 });
    }

    return NextResponse.json({ error: 'Error updating post' }, { status: 500 });
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