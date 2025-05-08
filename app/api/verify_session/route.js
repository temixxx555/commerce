import { NextResponse } from "next/server";
import Stripe from "stripe";
import User from "@/models/User";
import Product from "@/models/Product";
import ProcessedSession from "@/models/ProcessedSession";
import Order from "@/models/Order";
import connectDB from "@/config/db";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

export async function POST(req) {
  try {
    const { sessionId } = await req.json();
    if (!sessionId || typeof sessionId !== "string") {
      console.error("Invalid or missing sessionId:", sessionId);
      return NextResponse.json(
        { success: false, message: "Invalid or missing sessionId" },
        { status: 400 }
      );
    }

    await connectDB();

    const existingSession = await ProcessedSession.findOne({ sessionId });
    if (existingSession) {
      console.log(`Session ${sessionId} already processed`);
      return NextResponse.json({ success: true, message: "Order already processed" });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== "paid") {
      return NextResponse.json(
        { success: false, message: "Payment not completed" },
        { status: 400 }
      );
    }

    const { userId, addressId, items } = session.metadata || {};
    if (!userId || !addressId || !items) {
      console.error(`Missing metadata in session ${sessionId}:`, session.metadata);
      return NextResponse.json(
        { success: false, message: "Missing metadata in Stripe session" },
        { status: 400 }
      );
    }

    let parsedItems;
    try {
      parsedItems = JSON.parse(items);
    } catch (err) {
      console.error(`Failed to parse items for session ${sessionId}:`, err);
      return NextResponse.json(
        { success: false, message: "Invalid items metadata" },
        { status: 400 }
      );
    }

    const itemsWithAmount = await Promise.all(
      parsedItems.map(async (item) => {
        const product = await Product.findById(item.product);
        if (!product) {
          throw new Error(`Product ${item.product} not found`);
        }
        const basePrice = product.offerPrice;
        const taxAmount = basePrice * 0.02;
        const totalPrice = basePrice + taxAmount;
        return {
          product: item.product,
          quantity: item.quantity,
          amount: totalPrice,
          status: "Order Placed",
          date: new Date(),
        };
      })
    );

    const order = await Order.create({
      userId,
      address: addressId,
      items: itemsWithAmount,
      totalAmount: session.amount_total / 100,
      date: new Date(),
      paymentMethod: "Card",
      paymentStatus: "Paid",
    });

    await ProcessedSession.create({ sessionId });

    const user = await User.findById(userId);
    if (user) {
      user.cartItems = {};
      await user.save();
    } else {
      console.warn(`User ${userId} not found when clearing cart`);
    }

    console.log(`Order created successfully: ${order._id}`);
    return NextResponse.json({ success: true, message: "Order created" });
  } catch (err) {
    console.error("Session verification error:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Failed to verify session" },
      { status: 500 }
    );
  }
}