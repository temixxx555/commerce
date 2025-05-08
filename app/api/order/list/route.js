// app/api/order/list/route.js
import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import Order from "@/models/Order";
import Address from "@/models/Address";
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
    
    // Get orders with populated product info
    const orders = await Order.find({ userId }).populate("items.product");
    
    // Extract all address IDs
    const addressIds = orders.map(order => order.address).filter(Boolean);
    
    // Fetch all addresses in one query
    const addresses = await Address.find({ _id: { $in: addressIds } });
    
    // Create address lookup map
    const addressMap = {};
    addresses.forEach(address => {
      addressMap[address._id.toString()] = address.toObject();
    });
    
    // Add address details to each order
    const ordersWithAddresses = orders.map(order => {
      const orderObj = order.toObject();
      
      // Replace the address ID with the full address object
      if (order.address && addressMap[order.address.toString()]) {
        orderObj.address = addressMap[order.address.toString()];
      } else {
        // Provide a fallback to prevent UI errors
        orderObj.address = {
          fullName: "Address not found",
          area: "",
          city: "",
          state: "",
          phoneNumber: ""
        };
      }
      
      return orderObj;
    });
    
    return NextResponse.json({ success: true, orders: ordersWithAddresses });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}