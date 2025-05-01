import { Inngest } from "inngest";
import connectDB from "./db";
import User from "@/models/User";
import Orderd from "@/models/Order";

// Create a client to send and receive events
export const inngest = new Inngest({
  id: "commerce",
  signingKey: process.env.INNGEST_SIGNING_KEY,
});

// Inngest function to save user to the database
export const syncUserCreation = inngest.createFunction(
  {
    id: "sync-user-from-clerk",
  },
  { event: "clerk/user.created" },
  async ({ event }) => {
    const { id, first_name, last_name, email_addresses, image_url } = event.data;
    const userData = {
      _id: id,
      email: email_addresses[0].email_address,
      name: first_name + " " + last_name,
      imageUrl: image_url,
    };
    await connectDB();
    await User.create(userData);
  }
);

// Inngest function to update user data in database
export const syncUserUpdation = inngest.createFunction(
  {
    id: "update-user-from-clerk",
  },
  { event: "clerk/user.updated" },
  async ({ event }) => {
    const { id, first_name, last_name, email_addresses, image_url } = event.data;
    const userData = {
      _id: id,
      email: email_addresses[0].email_address,
      name: first_name + " " + last_name,
      imageUrl: image_url,
    };
    await connectDB();
    await User.findByIdAndUpdate(id, userData);
  }
);

// Inngest function to delete user from database
export const syncUserDeletion = inngest.createFunction(
  {
    id: "delete-user-with-clerk",
  },
  { event: "clerk/user.deleted" },
  async ({ event }) => {
    const { id } = event.data;
    await connectDB();
    await User.findByIdAndDelete(id);
  }
);

// Inngest function to create orders in the database
export const createUserOrder = inngest.createFunction(
  {
    id: "create-user-order",
    batchEvents: {
      maxSize: 5,
      timeout: "5s",
    },
  },
  { event: "order/created" },
  async ({ events }) => {
    console.log("createUserOrder - Received events:", events);
    const orders = events.map((event) => {
      console.log("createUserOrder - Processing event data:", event.data);
      return {
        userId: event.data.userId,
        address: event.data.address,
        items: event.data.items.map((item) => ({
          product: item.product,
          quantity: item.quantity,
          amount: item.amount || 0, // Save amount from event data
          status: "Order Placed",
          date: item.date || Date.now(),
        })),
        totalAmount: event.data.totalAmount,
        paymentMethod: event.data.paymentMethod || "Card",
        paymentStatus: event.data.paymentStatus || "Paid",
      };
    });

    console.log("createUserOrder - Orders to insert:", orders);
    try {
      await connectDB();
      const result = await Orderd.insertMany(orders);
      console.log("createUserOrder - Insert result:", result, "at:", new Date());
      return { success: true, processed: orders.length };
    } catch (error) {
      console.error("createUserOrder - Error inserting orders:", error);
      throw error;
    }
  }
);