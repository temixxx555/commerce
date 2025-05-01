import { NextResponse } from "next/server";
import Stripe from "stripe";
import { inngest } from "@/config/inngest";
import connectDB from "@/lib/db";
import User from "@/models/User";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

export async function POST(req) {
  const sig = req.headers.get("stripe-signature");
  const rawBody = await req.text();

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Webhook Error" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const { userId, addressId, items } = session.metadata;

    // Trigger Inngest event to create the order
    await inngest.send({
      name: "order/created",
      data: {
        userId,
        address: addressId,
        items: JSON.parse(items),
        totalAmount: session.amount_total / 100, // Convert cents to dollars
        date: Date.now(),
      },
    });

    // Clear user cart
    await connectDB();
    const user = await User.findById(userId);
    if (user) {
      user.cartItems = {};
      await user.save();
    }
  }

  return NextResponse.json({ received: true });
}