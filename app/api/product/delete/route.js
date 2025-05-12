import connectDB from "@/config/db";
import authSeller from "@/lib/authSeller";
import Product from "@/models/Product";
import { getAuth } from "@clerk/nextjs/server";
import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function DELETE(request) {
  try {
    // Authenticate the user
    const { userId } = getAuth(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Verify if the user is a seller
    const isSeller = await authSeller(userId);
    if (!isSeller) {
      return NextResponse.json(
        { success: false, message: "Not authorized as a seller" },
        { status: 403 }
      );
    }

    // Get the product ID from query parameters
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("id");

    if (!productId) {
      return NextResponse.json(
        { success: false, message: "Product ID is required" },
        { status: 400 }
      );
    }

    // Connect to the database
    await connectDB();

    // Find the product
    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    // Delete associated images from Cloudinary (optional)
    if (product.image && product.image.length > 0) {
      try {
        await Promise.all(
          product.image.map(async (imageUrl) => {
            // Extract the public ID from the Cloudinary URL
            const publicId = imageUrl.split("/").pop().split(".")[0];
            await cloudinary.uploader.destroy(publicId);
          })
        );
      } catch (error) {
        console.error("Failed to delete images from Cloudinary:", error.message);
        // Continue with product deletion even if image deletion fails
      }
    }

    // Delete the product
    await Product.findByIdAndDelete(productId);

    return NextResponse.json(
      { success: true, message: "Product deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting product:", error.message);
    return NextResponse.json(
      { success: false, message: "Server error: " + error.message },
      { status: 500 }
    );
  }
}