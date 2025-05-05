import connectDB from "@/config/db";
import User from "@/models/User";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { userId } = getAuth(request);
    if (!userId) {
      return NextResponse.json({ success: false, message: "Unauthorized" });
    }
    await connectDB();
    let user = await User.findById(userId);
    if (!user) {
      // Create a new user if not found
      user = await User.create({
        _id: userId, // Set _id to Clerk userId
        cartItems: {}, // Initialize empty cart
        // Optionally add email, name, imageUrl (see below)
      });
    }
    return NextResponse.json({ success: true, user });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message });
  }
}