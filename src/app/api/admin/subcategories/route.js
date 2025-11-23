// src/app/api/admin/subcategories/route.js

import SubCategory from "@/models/SubCategory";
import { NextResponse } from "next/server";
import dbConnect from '@/mongodb'; // Assuming you use dbConnect here too

const SERVER_API_KEY = process.env.NEXT_PUBLIC_API_KEY || process.env.API_KEY;

// Utility function (assuming slugify is available or imported)
const slugify = (text) => {
    if (!text) return '';
    return text.toString().toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-');
};

export async function GET(req, res) {
    // FIX 3: Add dbConnect to ensure the database is ready
    try {
        await dbConnect();
    } catch (e) {
        console.error("Database connection failed in GET /subcategories:", e);
        return NextResponse.json({ message: 'Database connection failed' }, { status: 500 });
    }

    const apikey = req.headers.get("x-api-key");

    if (apikey != SERVER_API_KEY) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const subcategories = await SubCategory.find().sort({ created_at: -1 });
        return NextResponse.json(subcategories);
    } catch (error) {
        console.error("Error fetching subcategories:", error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function POST(req) {
    // FIX 3: Add dbConnect to ensure the database is ready
    try {
        await dbConnect();
    } catch (e) {
        console.error("Database connection failed in POST /subcategories:", e);
        return NextResponse.json({ message: 'Database connection failed' }, { status: 500 });
    }

    const apikey = req.headers.get("x-api-key");

    if (apikey != SERVER_API_KEY) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    let data;

    try {
        data = await req.json();

        // **FIX 2: Ensures parent_id is present before saving**
        if (!data.parent_id) {
            return NextResponse.json({ message: 'Parent Category (parent_id) is required for sub-categories.' }, { status: 400 });
        }

        let subCategorySlug = data.slug;
        if (!subCategorySlug || subCategorySlug.trim() === '') {
            if (!data.name) {
                return NextResponse.json({ message: 'Name is required to create category.' }, { status: 400 });
            }
            subCategorySlug = slugify(data.name);
        }

        const newSubCategory = new SubCategory({
            name: data.name,
            slug: subCategorySlug,
            description: data.description,
            parent_id: data.parent_id, // Now guaranteed to be present
            type: data.type,
            post_count: 0,
        });

        await newSubCategory.save();
        return NextResponse.json(newSubCategory, { status: 201 });
    } catch (error) {
        console.error("Category creation error:", error);

        if (error.code === 11000) {
            const name = data?.name ? `'${data.name}'` : 'A sub category';
            const slug = data?.slug ? ` or slug '${data.slug}'` : '';
            return NextResponse.json({ message: `${name}${slug} already exists.` }, { status: 409 });
        }
        if (error.name === 'ValidationError') {
            return NextResponse.json({ message: `Validation failed: ${error.message}` }, { status: 400 });
        }

        return NextResponse.json({ message: 'Error creating sub category: Internal Server Error' }, { status: 500 });
    }
}