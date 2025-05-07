import connectDB from "@/config/db";
import authSeller from "@/lib/authSeller";
import Detail from "@/models/Details";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Ensure DB connection (can be moved to a top-level module)
connectDB();

export async function GET(request) {
  try {
    const { userId } = getAuth(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const isSeller = await authSeller(userId);
    if (!isSeller) {
      return NextResponse.json(
        { success: false, message: "Not authorized" },
        { status: 403 }
      );
    }

    const details = await Detail.find({}).exec(); // Fetch all details

    return NextResponse.json(
      { success: true, details },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in GET /api/detail/get:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}