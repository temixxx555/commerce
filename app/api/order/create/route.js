import { inngest } from "@/config/inngest";
import Product from "@/models/Product";
import User from "@/models/User";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { userId } = getAuth(request);
    const { address, items } = await request.json();

    console.log("POST /api/order/create - Received data:", { userId, address, items });

    if (!address || items.length === 0) {
      return NextResponse.json({ success: false, message: "Invalid Data" });
    }

    // Enrich items with amount, status, and date
    const enrichedItems = await Promise.all(
      items.map(async (item) => {
        const product = await Product.findById(item.product);
        if (!product) {
          console.error(`Product not found for ID: ${item.product}`);
          throw new Error(`Product ${item.product} not found`);
        }
    
        // Calculate the item's amount
        const itemAmount = product.offerPrice * item.quantity;
    
        // Calculate tax for the item (e.g., 2% tax)
        const taxAmount = Math.floor(itemAmount * 0.02); // 2% tax rate
    
        // Add the tax to the item's amount
        const totalItemAmount = itemAmount + taxAmount;
    
        return {
          product: item.product,
          quantity: item.quantity,
          amount: totalItemAmount, // Amount including tax
          status: "Order Placed",
          date: Date.now(),
          taxAmount, // Store the tax amount for each item (optional)
        };
      })
    );
    

    console.log("POST /api/order/create - Enriched items:", enrichedItems);

    // Calculate total amount
    const totalAmount = enrichedItems.reduce((acc, item) => acc + item.amount, 0);
    const totalWithTax = totalAmount + Math.floor(totalAmount * 0.02);

    // Trigger Inngest event
    const eventData = {
      name: "order/created",
      data: {
        userId,
        address,
        items: enrichedItems,
        totalAmount: totalWithTax,
        date: Date.now(),
      },
    };
    console.log("POST /api/order/create - Sending Inngest event:", eventData);

    await inngest.send(eventData);

    // Clear user cart
    const user = await User.findById(userId);
    if (!user) {
      console.error(`User not found for ID: ${userId}`);
      throw new Error(`User ${userId} not found`);
    }
    user.cartItems = {};
    await user.save();

    return NextResponse.json({ success: true, message: "Order placed" });
  } catch (error) {
    console.error("POST /api/order/create - Error:", error);
    return NextResponse.json({ success: false, message: error.message });
  }
}