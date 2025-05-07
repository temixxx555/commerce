import { NextResponse } from "next/server";
import Stripe from "stripe";
import Product from "@/models/Product";
import connectDB from "@/config/db";
import { getAuth } from "@clerk/nextjs/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2023-10-16" });

export async function POST(req) {
  try {
    const { items, total, address } = await req.json();

    if (!process.env.NEXT_PUBLIC_BASE_URL) {
      throw new Error("NEXT_PUBLIC_BASE_URL is not defined");
    }
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY is not defined");
    }

    await connectDB();

    let subtotal = 0;
    const lineItems = await Promise.all(
      items.map(async (item) => {
        const product = await Product.findById(item.product);
        if (!product) {
          throw new Error(`Product ${item.product} not found`);
        }

        const unitAmount = Math.round(product.offerPrice * 100);
        subtotal += product.offerPrice * item.quantity;

        let imageUrl = [];
        if (typeof product.image === "string") {
          imageUrl = [product.image];
        } else if (Array.isArray(product.image)) {
          imageUrl = product.image.filter((url) => typeof url === "string");
        } else if (typeof product.image === "object" && product.image !== null) {
          imageUrl = Object.values(product.image).filter((url) => typeof url === "string");
        }

        return {
          price_data: {
            currency: "cad",
            unit_amount: unitAmount,
            product_data: {
              name: product.name,
              images: imageUrl,
            },
          },
          quantity: item.quantity,
        };
      })
    );

    const taxRate = 0.02;
    const taxAmount = subtotal * taxRate;
    if (taxAmount > 0) {
      lineItems.push({
        price_data: {
          currency: "cad",
          unit_amount: Math.round(taxAmount * 100),
          product_data: {
            name: "Sales Tax (2%)",
          },
        },
        quantity: 1,
      });
    }

    const expectedTotal = Math.floor((subtotal + taxAmount) * 100) / 100;
    if (Math.abs(total - expectedTotal) > 0.01) {
      console.warn(`Total mismatch: Frontend ${total}, Backend ${expectedTotal}`);
    }

    const { userId } = getAuth(req);
    if (!userId) {
      throw new Error("User not authenticated");
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/order-placed`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/cart`,
      metadata: {
        userId,
        addressId: address,
        items: JSON.stringify(items),
      },
      automatic_tax: { enabled: false },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Stripe API Error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}