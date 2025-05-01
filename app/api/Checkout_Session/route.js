import { NextResponse } from "next/server";
import Stripe from "stripe";
import Product from "@/models/Product";
import connectDB from "@/config/db";
import { getAuth } from "@clerk/nextjs/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

export async function POST(req) {
  try {
    const { items, total, address } = await req.json();

    // Validate environment variables
    if (!process.env.NEXT_PUBLIC_BASE_URL) {
      throw new Error("NEXT_PUBLIC_BASE_URL is not defined in environment variables");
    }
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY is not defined in environment variables");
    }

    await connectDB();

    // Fetch product details from the database and calculate tax
    const lineItems = await Promise.all(
      items.map(async (item) => {
        const product = await Product.findById(item.product);
        if (!product) {
          throw new Error(`Product ${item.product} not found`);
        }

        // Calculate price with 2% tax
        const basePrice = product.offerPrice;
        const taxAmount = basePrice * 0.02; // 2% tax
        const totalPrice = basePrice + taxAmount; // Price including tax
        const unitAmount = Math.round(totalPrice * 100); // Convert to cents for Stripe

        // Ensure the image is a valid string or array of strings
        let imageUrl = [];
        if (typeof product.image === "string") {
          imageUrl = [product.image];
        } else if (Array.isArray(product.image)) {
          imageUrl = product.image.filter((url) => typeof url === "string");
        } else if (typeof product.image === "object" && product.image !== null) {
          imageUrl = Object.values(product.image).filter((url) => typeof url === "string");
        }

        if (imageUrl.length === 0) {
          console.warn(`No valid image URLs for product ${product._id}, using empty array`);
        }

        return {
          price_data: {
            currency: "cad",
            unit_amount: unitAmount, // Includes 2% tax
            product_data: {
              name: product.name,
              images: imageUrl,
            },
          },
          quantity: item.quantity,
        };
      })
    );

    // Get userId from Clerk authentication
    const { userId } = getAuth(req);

    // Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/order-placed?session_id={CHECKOUT_SESSION_ID}`,

      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/cart`,
      metadata: {
        userId: userId || "",
        addressId: address,
        items: JSON.stringify(items),
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Stripe API Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
//try aGAIN