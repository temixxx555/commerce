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

export async function PATCH(request) {
  try {
    const { userId } = getAuth(request);
    const isSeller = await authSeller(userId);

    if (!isSeller) {
      return NextResponse.json({ success: false, message: "Not authorized" });
    }

    const formData = await request.formData();
    const productId = formData.get("id"); // The ID of the product to update

    if (!productId) {
      return NextResponse.json({ success: false, message: "Product ID missing" });
    }

    const name = formData.get("name");
    const description = formData.get("description");
    const category = formData.get("category");
    const price = formData.get("price");
    const offerPrice = formData.get("offerPrice");
    const files = formData.getAll("images");

    let imageUrls = [];

    if (files && files[0]?.size > 0) {
      const result = await Promise.all(
        files.map(async (file) => {
          const arrayBuffer = await file.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);

          return new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              { resource_type: "auto" },
              (error, result) => {
                if (error) {
                  reject(error);
                } else {
                  resolve(result);
                }
              }
            );
            stream.end(buffer);
          });
        })
      );

      imageUrls = result.map((res) => res.secure_url);
    }

    await connectDB();

    const updatedFields = {
      name,
      description,
      category,
      price: Number(price),
      offerPrice: Number(offerPrice),
    };

    if (imageUrls.length > 0) {
      updatedFields.image = imageUrls;
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      updatedFields,
      { new: true }
    );

    if (!updatedProduct) {
      return NextResponse.json({ success: false, message: "Product not found" });
    }

    return NextResponse.json({
      success: true,
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message });
  }
}
