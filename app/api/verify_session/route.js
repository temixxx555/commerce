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

    // Retrieve the session with line items and payment intent
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["line_items", "line_items.data.price.product", "payment_intent"],
    });
    
    if (session.payment_status !== "paid") {
      return NextResponse.json(
        { success: false, message: "Payment not completed" },
        { status: 400 }
      );
    }

    const { userId, addressId, items } = session.metadata || {};
    if (!userId || !addressId) {
      console.error(`Missing required metadata in session ${sessionId}:`, session.metadata);
      return NextResponse.json(
        { success: false, message: "Missing metadata in Stripe session" },
        { status: 400 }
      );
    }

    let parsedItems;
    try {
      parsedItems = JSON.parse(items);
      if (!Array.isArray(parsedItems) || !parsedItems.length) {
        throw new Error("Items is not a valid array");
      }
    } catch (err) {
      console.error(`Failed to parse items for session ${sessionId}:`, err);
      return NextResponse.json(
        { success: false, message: "Invalid items metadata" },
        { status: 400 }
      );
    }

    // Fetch user to get their email
    const user = await User.findById(userId);
    if (!user || !user.email) {
      console.error(`User ${userId} not found or missing email`);
      return NextResponse.json(
        { success: false, message: "User not found or missing email" },
        { status: 400 }
      );
    }

    // Process line items from the Stripe session
    const lineItems = session.line_items?.data || [];
    
    // Create order items with proper amounts from the Stripe session
    const itemsWithAmount = await Promise.all(
      parsedItems.map(async (item, index) => {
        const product = await Product.findById(item.product);
        if (!product) {
          throw new Error(`Product ${item.product} not found`);
        }
        
        // Find corresponding line item from Stripe if possible
        const lineItem = lineItems.find(li => {
          const productName = li.price?.product?.name || "";
          return productName === product.name;
        });
        
        // Calculate amount based on Stripe data if available
        let amount;
        if (lineItem) {
          amount = lineItem.amount_total / 100 / lineItem.quantity; // Convert from cents and divide by quantity
        } else {
          // Fallback to product price + tax calculation
          const basePrice = product.offerPrice;
          const taxAmount = basePrice * 0.02;
          amount = basePrice + taxAmount;
        }

        return {
          product: item.product,
          quantity: item.quantity,
          amount: amount,
          status: "Order Placed",
          date: new Date(),
        };
      })
    );

    // Create a Stripe customer with email if not already exists
    let customer;
    try {
      // Try to find an existing customer first
      const customers = await stripe.customers.list({
        email: user.email,
        limit: 1,
      });
      
      if (customers.data.length > 0) {
        customer = customers.data[0];
        // Update customer metadata if needed
        if (!customer.metadata.userId) {
          customer = await stripe.customers.update(customer.id, {
            metadata: { userId },
          });
        }
      } else {
        // Create new customer if not found
        customer = await stripe.customers.create({
          email: user.email,
          name: user.name || user.username || "Customer",
          metadata: { userId },
        });
      }
    } catch (err) {
      console.error("Error finding/creating customer:", err);
      // Create a new customer as fallback
      customer = await stripe.customers.create({
        email: user.email,
        name: user.name || user.username || "Customer",
        metadata: { userId },
      });
    }

    // Generate an invoice from the checkout session
    const invoice = await stripe.invoices.create({
      customer: customer.id,
      auto_advance: true,
      collection_method: "charge_automatically", // This means we'll mark it as paid
      metadata: { orderId: sessionId, sessionId },
    });

    // Add line items to the invoice directly from the session
    await Promise.all(
      lineItems.map(async (item) => {
        const productName = item.price?.product?.name || item.description || "Product";
        const unitAmount = item.price?.unit_amount || 0;
        const quantity = item.quantity || 1;
        
        // Create invoice item linked to the invoice
        return stripe.invoiceItems.create({
          customer: customer.id,
          invoice: invoice.id, // Connect to our invoice
          amount: Math.round(unitAmount * quantity), // Keep in cents for Stripe
          currency: "cad",
          description: `${productName} (Qty: ${quantity})`,
        });
      })
    );

    // Finalize the invoice
    const finalizedInvoice = await stripe.invoices.finalizeInvoice(invoice.id);
    
    // Mark the invoice as paid since the checkout session was paid
    const paidInvoice = await stripe.invoices.pay(finalizedInvoice.id, {
      paid_out_of_band: true // Mark as paid outside of Stripe
    });

    // Calculate total from all items including tax
    const totalAmount = session.amount_total / 100; // Convert from cents to dollars

    // Create order in database
    const order = await Order.create({
      userId,
      address: addressId,
      items: itemsWithAmount,
      totalAmount: totalAmount,
      date: new Date(),
      paymentMethod: "Card",
      paymentStatus: "Paid",
      invoiceId: paidInvoice.id,
    });

    // Mark session as processed
    await ProcessedSession.create({ sessionId });

    // Clear the user's cart
    if (user) {
      user.cartItems = {};
      await user.save();
    }

    console.log(`Order created successfully: ${order._id}, Invoice: ${paidInvoice.id}`);
    return NextResponse.json({ 
      success: true, 
      message: "Order created", 
      invoiceId: paidInvoice.id,
      orderId: order._id
    });
  } catch (err) {
    console.error("Session verification error:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Failed to verify session" },
      { status: 500 }
    );
  }
}