// src/app/api/admin/categories/route.js

import Category from '@/models/Category';
import { NextResponse } from 'next/server';
import dbConnect from '@/mongodb'; // <-- IMPORT DB CONNECTION

const SERVER_API_KEY = process.env.NEXT_PUBLIC_API_KEY || process.env.API_KEY;

// Utility function (assuming you copied it from page.js to route.js for server-side slug generation)
const slugify = (text) => {
    if (!text) return '';
    let slug = text.toString().toLowerCase();
    // Assuming MALAYALAM_MAP is also available here if needed for server-side slug validation

    return slug
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-');
};

export async function GET(req, res) {
    // ESTABLISH CONNECTION BEFORE QUERYING
    try {
        await dbConnect(); 
    } catch (e) {
        console.error("Database connection failed in GET /categories:", e);
        return NextResponse.json({ message: 'Database connection failed' }, { status: 500 });
    }
    
    const apikey = req.headers.get("x-api-key");;

    if (apikey != SERVER_API_KEY) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const categories = await Category.find().sort({ created_at: -1 });
        return NextResponse.json(categories);
    } catch (error) {
        console.error("Error fetching categories:", error);
        return NextResponse.json({ message: 'Error fetching categories' }, { status: 500 });
    }
}

export async function POST(req) {
    // ESTABLISH CONNECTION BEFORE QUERYING
    try {
        await dbConnect(); 
    } catch (e) {
        console.error("Database connection failed in POST /categories:", e);
        return NextResponse.json({ message: 'Database connection failed' }, { status: 500 });
    }

    const apikey = req.headers.get("x-api-key");

    if (apikey != SERVER_API_KEY) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    let data;

    try {
        data = await req.json(); // Data should be defined here

        // 1. Handle Slug Auto-Generation/Validation (Prevents 500 on empty slug)
        let categorySlug = data.slug;
        if (!categorySlug || categorySlug.trim() === '') {
            if (!data.name) {
                return NextResponse.json({ message: 'Name is required to create category.' }, { status: 400 });
            }
            categorySlug = slugify(data.name);
        }

        const newCategory = new Category({
            name: data.name,
            slug: categorySlug,
            description: data.description,
            type: data.type,
            post_count: 0,
        });

        await newCategory.save();
        return NextResponse.json(newCategory, { status: 201 });
    } catch (error) {
        console.error("Category creation error:", error);

        if (error.code === 11000) {
            const name = data?.name ? `'${data.name}'` : 'A category';
            const slug = data?.slug ? ` or slug '${data.slug}'` : '';
            return NextResponse.json({ message: `${name}${slug} already exists.` }, { status: 409 });
        }
        if (error.name === 'ValidationError') {
            return NextResponse.json({ message: `Validation failed: ${error.message}` }, { status: 400 });
        }

        return NextResponse.json({ message: 'Error creating category: Internal Server Error' }, { status: 500 });
    }
}
