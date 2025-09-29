// src/app/api/auth/login/route.js

import dbConnect from "@/mongodb";
import User from "@/models/User";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { setSession } from "@/lib/auth"; // Correct import path

export async function POST(req, res) {
    const apikey = req.headers.get("x-api-key");

    if (apikey !== "itstheprivateKeY") {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    
    try {
        const { email, password } = await req.json();

        await dbConnect();
        const user = await User.findOne({ email }); // User document should contain the 'role' field

        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return NextResponse.json({ message: "Invalid password" }, { status: 401 });
        }

        // 🔑 1. Create JWT token, INCLUDING the user's role
        const token = jwt.sign(
            { 
                userId: user._id, 
                name: user.name,
                email: user.email,
                role: user.role // ⬅️ ADD THE ROLE HERE
            },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        // 2. Set the session cookie (uses the JWT)
        await setSession(token);

        return NextResponse.json({ message: "Login successful" }, { status: 200 });
    } catch (error) {
        console.error('Login failed:', error);
        return NextResponse.json({ message: "Login failed", error: error.message }, { status: 500 });
    }
}