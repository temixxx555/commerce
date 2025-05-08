// app/api/order/list/route.js
import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import Order from "@/models/Order"; // Use Order, not Orderd
import { getAuth } from "@clerk/nextjs/server";

export async function GET(request) {
  try {
    const { userId } = getAuth(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();
    const orders = await Order.find({ userId }).populate(
      "address items.product"
    );

    return NextResponse.json({ success: true, orders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
