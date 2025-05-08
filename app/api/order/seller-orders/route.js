import connectDB from "@/config/db";
import authSeller from "@/lib/authSeller";
import Address from "@/models/Address";
import Order from "@/models/Order"; // Fixed the model name
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { userId } = getAuth(request);

    const isSeller = await authSeller(userId);

    if (!isSeller) {
      return NextResponse.json({ success: false, message: 'not authorized' });
    }
    
    await connectDB();
    
    // First, get orders with populated product information
    const orders = await Order.find({}).populate('items.product');
    
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
    console.error("Error in seller orders route:", error);
    return NextResponse.json({ success: false, message: error.message });
  }
}