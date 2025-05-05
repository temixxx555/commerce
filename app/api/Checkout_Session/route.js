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

    // Calculate subtotal and create line items for products
    let subtotal = 0;
    const lineItems = await Promise.all(
      items.map(async (item) => {
        const product = await Product.findById(item.product);
        if (!product) {
          throw new Error(`Product ${item.product} not found`);
        }

        // Use base price without tax
        const unitAmount = Math.round(product.offerPrice * 100); // Convert to cents
        subtotal += product.offerPrice * item.quantity;

        // Handle product images
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
            unit_amount: unitAmount, // Pre-tax price
            product_data: {
              name: product.name,
              images: imageUrl,
            },
          },
          quantity: item.quantity,
        };
      })
    );

    // Calculate 2% tax on subtotal
    const taxRate = 0.02;
    const taxAmount = subtotal * taxRate;
    if (taxAmount > 0) {
      lineItems.push({
        price_data: {
          currency: "cad",
          unit_amount: Math.round(taxAmount * 100), // Tax in cents
          product_data: {
            name: "Sales Tax (2%)",
          },
        },
        quantity: 1,
      });
    }

    // Validate total from frontend (optional)
    const expectedTotal = Math.floor((subtotal + taxAmount) * 100) / 100;
    if (Math.abs(total - expectedTotal) > 0.01) {
      console.warn(`Total mismatch: Frontend ${total}, Backend ${expectedTotal}`);
    }

    // Get userId from Clerk authentication
    const { userId } = getAuth(req);

    // Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${
        process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
      }/order-placed?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${
        process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
      }/cart`,
      metadata: {
        userId: userId || "",
        addressId: address,
        items: JSON.stringify(items),
      },
      automatic_tax: { enabled: false }, // Disable Stripe automatic tax
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Stripe API Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}