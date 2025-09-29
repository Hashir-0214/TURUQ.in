// src/app/api/admin/authors/route.js

import Author from '@/models/Author';
import { NextResponse } from 'next/server';
import dbConnect from '@/mongodb';

// FIX 1: Use a dedicated, server-only environment variable for security
const SECURE_API_KEY = process.env.API_KEY; 

// Centralized authentication function
const checkAuth = (req) => {
    const apikey = req.headers.get("x-api-key");
    // FIX 2: Check if the secure key exists and matches the header key
    if (!SECURE_API_KEY || apikey !== SECURE_API_KEY) {
        return false;
    }
    return true;
}


export async function GET(req) { // Changed to 'req' (standard)
    try {
        await dbConnect();
    } catch (e) {
        console.error("Database connection failed in GET /authors:", e);
        return NextResponse.json({ message: 'Database connection failed' }, { status: 500 });
    }

    // FIX 3: Apply the security check
    if (!checkAuth(req)) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const authors = await Author.find().sort({ created_at: -1 });
        return NextResponse.json(authors);
    } catch (error) {
        console.error("Error fetching authors:", error);
        return NextResponse.json({ message: 'Error fetching authors' }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        await dbConnect();
    } catch (e) {
        console.error("Database connection failed in POST /authors:", e)
        return NextResponse.json({ message: 'Database connection failed' }, { status: 500 });
    }

    if (!checkAuth(req)) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const data = await req.json();
        const newAuthor = new Author(data);
        await newAuthor.save();
        return NextResponse.json(newAuthor, { status: 201 });
    } catch (error) {
        console.error("Author creation error:", error);
        if (error.code === 11000) {
            return NextResponse.json({ message: 'Author with this name or slug already exists.' }, { status: 409 });
        }
        if (error.name === 'ValidationError') {
            return NextResponse.json({ message: `Validation failed: ${error.message}` }, { status: 400 });
        }
        return NextResponse.json({ message: 'Error creating author: Internal Server Error' }, { status: 500 });
    }

}

export async function PUT(req) {
    try {
        await dbConnect();
    } catch (e) {
        console.error("Database connection failed in PUT /authors:", e);
        return NextResponse.json({ message: 'Database connection failed' }, { status: 500 });
    }

    if (!checkAuth(req)) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { _id, ...updateData } = await req.json();

        if (!_id) {
            return NextResponse.json({ message: 'Author ID is required for update.' }, { status: 400 });
        }

        const updatedAuthor = await Author.findByIdAndUpdate(_id, updateData, { new: true, runValidators: true });

        if (!updatedAuthor) {
            return NextResponse.json({ message: 'Author not found.' }, { status: 404 });
        }

        return NextResponse.json(updatedAuthor);
    } catch (error) {
        console.error("Author update error:", error);
        if (error.code === 11000) {
            return NextResponse.json({ message: 'An author with this name or slug already exists.' }, { status: 409 });
        }
        if (error.name === 'ValidationError') {
            return NextResponse.json({ message: `Validation failed: ${error.message}` }, { status: 400 });
        }
        return NextResponse.json({ message: 'Error updating author: Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(req) {
    try {
        await dbConnect();
    } catch (e) {
        console.error("Database connection failed in DELETE /authors:", e);
        return NextResponse.json({ message: 'Database connection failed' }, { status: 500 });
    }

    if (!checkAuth(req)) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        // The frontend sends the ID in the request body
        const { id } = await req.json(); 

        if (!id) {
            return NextResponse.json({ message: 'Author ID is required for deletion.' }, { status: 400 });
        }

        // Use findByIdAndDelete to remove the document
        const deletedAuthor = await Author.findByIdAndDelete(id); 

        if (!deletedAuthor) {
            return NextResponse.json({ message: 'Author not found.' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Author deleted successfully.' });
    } catch (error) {
        console.error("Author deletion error:", error);
        return NextResponse.json({ message: 'Error deleting author: Internal Server Error' }, { status: 500 });
    }
}