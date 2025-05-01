import { NextResponse } from "next/server";
import Stripe from "stripe";
import { inngest } from "@/config/inngest";
import User from "@/models/User";
import Product from "@/models/Product";
import connectDB from "@/config/db";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

export async function POST(req) {
  try {
    const { sessionId } = await req.json();

    // Retrieve the Stripe session
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== "paid") {
      return NextResponse.json({ success: false, message: "Payment not completed" });
    }

    const { userId, addressId, items } = session.metadata;
    const parsedItems = JSON.parse(items);

    // Connect to database to fetch product prices
    await connectDB();

    // Calculate amount (price per unit including 2% tax) for each item
    const itemsWithAmount = await Promise.all(
      parsedItems.map(async (item) => {
        const product = await Product.findById(item.product);
        if (!product) {
          throw new Error(`Product ${item.product} not found`);
        }
        const basePrice = product.offerPrice;
        const taxAmount = basePrice * 0.02; // 2% tax
        const totalPrice = basePrice + taxAmount; // Price including tax
        return {
          product: item.product,
          quantity: item.quantity,
          amount: totalPrice, // Price per unit including tax
        };
      })
    );

    // Trigger Inngest event to create the order
    await inngest.send({
      name: "order/created",
      data: {
        userId,
        address: addressId,
        items: itemsWithAmount,
        totalAmount: session.amount_total / 100, // Total from Stripe (includes tax)
        date: Date.now(),
        paymentMethod: "Card",
        paymentStatus: "Paid",
      },
    });

    // Clear user cart
    const user = await User.findById(userId);
    if (user) {
      user.cartItems = {};
      await user.save();
    }

    return NextResponse.json({ success: true, message: "Order created" });
  } catch (err) {
    console.error("Session verification error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}