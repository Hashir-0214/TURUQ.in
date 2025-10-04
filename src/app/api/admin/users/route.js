// src/app/api/admin/users/route.js

import User from "@/models/User";
import { NextResponse } from "next/server";
import dbConnect from "@/mongodb";
import bcrypt from "bcryptjs";

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

export async function GET(req) {
  try {
    await dbConnect();
  } catch (e) {
    console.error("Database connection failed in GET /users:", e);
    return NextResponse.json(
      { message: "Database connection failed" },
      { status: 500 }
    );
  }

  if (!checkAuth(req)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("id");

    let users;
    if (userId) {
      const user = await User.findById(userId);
      if (!user) {
        return NextResponse.json(
          { message: "User not found" },
          { status: 404 }
        );
      }
      users = user; 
    } else {
      // Fetch all users
      users = await User.find().sort({ created_at: -1 });
    }
    return NextResponse.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { message: "Error fetching users" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    await dbConnect();
  } catch (e) {
    console.error("Database connection failed in POST /users:", e);
    return NextResponse.json(
      { message: "Database connection failed" },
      { status: 500 }
    );
  }

  if (!checkAuth(req)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await req.json();

    if (!data.password) {
      return NextResponse.json(
        { message: "Password is required for new user creation." },
        { status: 400 }
      );
    }

    const saltRounds = 10;
    data.password = await bcrypt.hash(data.password, saltRounds);

    const newUser = new User(data);
    await newUser.save();

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error("User creation error:", error);
    if (error.code === 11000) {
      return NextResponse.json(
        { message: "User with this email already exists." },
        { status: 409 }
      );
    }
    if (error.name === "ValidationError") {
      return NextResponse.json(
        { message: `Validation failed: ${error.message}` },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { message: "Error creating user: Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PUT(req) {
  try {
    await dbConnect();
  } catch (e) {
    console.error("Database connection failed in PUT /users:", e);
    return NextResponse.json(
      { message: "Database connection failed" },
      { status: 500 }
    );
  }

  if (!checkAuth(req)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    // Extract _id and password, keeping the rest as updateData
    const { _id, password, ...updateData } = await req.json();

    if (!_id) {
      return NextResponse.json(
        { message: "User ID is required for update." },
        { status: 400 }
      );
    }

    // 🔑 SECURITY IMPLEMENTATION: Only hash the password if a new one is provided
    if (password) {
      const saltRounds = 10;
      updateData.password = await bcrypt.hash(password, saltRounds);
    } else {
      // Ensure we don't try to save an empty password field if one wasn't provided for update
      delete updateData.password;
    }

    // Use updateData (which now might include a hashed password)
    const updatedUser = await User.findByIdAndUpdate(_id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedUser) {
      return NextResponse.json({ message: "User not found." }, { status: 404 });
    }

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("User update error:", error);
    if (error.code === 11000) {
      return NextResponse.json(
        { message: "User with this email already exists." },
        { status: 409 }
      );
    }

    if (error.name === "ValidationError") {
      return NextResponse.json(
        { message: `Validation failed: ${error.message}` },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Error updating user: Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req) {
  try {
    await dbConnect();
  } catch (e) {
    console.error("Database connection failed in DELETE /users:", e);
  }

  if (!checkAuth(req)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json(
        { message: "User ID is required for deletion." },
        { status: 400 }
      );
    }

    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return NextResponse.json({ message: "User not found." }, { status: 404 });
    }

    return NextResponse.json({ message: "User deleted successfully." });
  } catch (error) {
    console.error("User deletion error:", error);
    return NextResponse.json(
      { message: "Error deleting user: Internal Server Error" },
      { status: 500 }
    );
  }
}
