import connectDB from "@/config/db";
import Detail from "@/models/Details";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Ensure DB connection (can also be moved to a top-level module)
connectDB();

export async function POST(request) {
  try {
    const { userId } = getAuth(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Login to send a request" },
        { status: 401 }
      );
    }

    const { firstName, lastName, email, message, number } = await request.json();

    // Validate required fields
    if (!firstName || !lastName || !email || !message || !number) {
      return NextResponse.json(
        { success: false, message: "All fields are required" },
        { status: 400 }
      );
    }

    const newDetail = await Detail.create({
      userId,
      firstName,
      lastName,
      email,
      message,
      number 
    });

    return NextResponse.json(
      { success: true, message: "Details added successfully", newDetail },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in POST /api/detail/create:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}