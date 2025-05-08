import connectDB from "@/config/db";
import Detail from "@/models/Details";
import { NextResponse } from "next/server";

// Ensure DB connection
connectDB();

export async function POST(request) {
  try {
    const { firstName, lastName, email, message, number } = await request.json();

    // Validate required fields
    if (!firstName || !lastName || !email || !message || !number) {
      return NextResponse.json(
        { success: false, message: "All fields are required" },
        { status: 400 }
      );
    }

    const newDetail = await Detail.create({
      userId: "no user", // Explicitly set for unauthenticated users
      firstName,
      lastName,
      email,
      message,
      number,
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