// src/app/api/auth/register/route.js

import dbConnect from "@/mongodb";
import User from "@/models/User";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { Lasso, Phone } from "lucide-react";

export async function POST(req, res) {
  try {
    // Destructure 'name' directly from the request body
    const { name, username, email, password } = await req.json();

    await dbConnect();
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create a new User using the 'name' field
    const newUser = new User({
        name, // This now correctly matches your schema
        username,
        email,
        password: hashedPassword,
    });

    await newUser.save();

    return NextResponse.json({ message: "User registered successfully!" }, { status: 201 });
  } catch (error) {
    console.error('Registration failed:', error);
    return NextResponse.json({ message: "Registration failed", error: error.message }, { status: 500 });
  }
}