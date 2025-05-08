import { buffer } from "micro";
import Stripe from "stripe";
import { inngest } from "@/config/inngest";
import connectDB from "@/config/db";
import Orderd from "@/models/Order"; // Unchanged import
import User from "@/models/User";
import Product from "@/models/Product";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2023-10-16" });
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  if (req.method !== "POST") {
    console.log("Webhook - Non-POST request received:", req.method);
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!webhookSecret) {
    console.error("Webhook - STRIPE_WEBHOOK_SECRET not set");
    return res.status(500).json({ error: "Webhook secret not configured" });
  }

  const buf = await buffer(req);
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
    console.log("Webhook - Received event:", event.type, "ID:", event.id);
  } catch (err) {
    console.error("Webhook - Signature verification failed:", err.message);
    return res.status(400).json({ error: "Webhook signature verification failed" });
  }

  try {
    await connectDB();
    console.log("Webhook - Database connected");
  } catch (err) {
    console.error("Webhook - Database connection error:", err.message);
    return res.status(500).json({ error: "Database connection failed" });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        const session = event.data.object;
        if (session.payment_status !== "paid") {
          console.log("Webhook - Session not paid:", session.id);
          return res.status(200).json({ received: true });
        }

        // Check for existing order
        const existingOrder = await Orderd.findOne({ sessionId: session.id });
        if (existingOrder) {
          console.log("Webhook - Order already exists:", existingOrder._id);
          return res.status(200).json({ received: true });
        }

        // Validate metadata
        const { userId, addressId, items } = session.metadata || {};
        if (!userId || !addressId || !items) {
          console.error("Webhook - Missing metadata in session:", session.id);
          return res.status(400).json({ error: "Missing metadata" });
        }

        let parsedItems;
        try {
          parsedItems = JSON.parse(items);
        } catch (err) {
          console.error("Webhook - Invalid items metadata:", items);
          return res.status(400).json({ error: "Invalid items metadata" });
        }
        console.log("Webhook - Parsed items:", parsedItems);

        // Calculate item amounts with tax
        const itemsWithAmount = await Promise.all(
          parsedItems.map(async (item) => {
            const product = await Product.findById(item.product);
            if (!product) {
              console.error("Webhook - Product not found:", item.product);
              throw new Error(`Product ${item.product} not found`);
            }
            const basePrice = product.offerPrice;
            const taxAmount = basePrice * 0.02;
            const totalPrice = basePrice + taxAmount;
            return {
              product: item.product,
              quantity: item.quantity,
              amount: totalPrice,
            };
          })
        );
        console.log("Webhook - Items with amount:", itemsWithAmount);

        // Trigger Inngest event with retry
        try {
          await inngest.send({
            name: "order/created",
            data: {
              userId,
              address: addressId,
              items: itemsWithAmount,
              totalAmount: session.amount_total / 100,
              date: Date.now(),
              paymentMethod: "Card",
              paymentStatus: "Paid",
              sessionId: session.id,
            },
          });
          console.log("Webhook - Inngest order/created event sent for sessionId:", session.id);
        } catch (err) {
          console.error("Webhook - Inngest event failed:", err.message);
          throw new Error("Failed to send Inngest event");
        }

        // Clear user cart
        const user = await User.findById(userId);
        if (user) {
          user.cartItems = {};
          await user.save();
          console.log("Webhook - User cart cleared:", userId);
        } else {
          console.warn("Webhook - User not found:", userId);
        }

        // Create and finalize invoice
        const invoice = await stripe.invoices.create({
          customer: session.customer || (await stripe.customers.create({ metadata: { userId } })).id,
          collection_method: "send_invoice",
          days_until_due: 30,
          metadata: { sessionId: session.id, userId },
          description: `Invoice for order ${session.id}`,
          auto_advance: true,
        });

        await Promise.all(
          itemsWithAmount.map(async (item) => {
            await stripe.invoiceItems.create({
              customer: session.customer || invoice.customer,
              invoice: invoice.id,
              amount: Math.round(item.amount * item.quantity * 100),
              currency: session.currency || "cad",
              description: `Product ${item.product} (Qty: ${item.quantity})`,
            });
          })
        );

        const finalizedInvoice = await stripe.invoices.finalizeInvoice(invoice.id);
        console.log("Webhook - Invoice created and finalized:", finalizedInvoice.id);

        break;

      case "invoice.paid":
        const invoices = event.data.object; // Fixed typo
        console.log("Webhook - Invoice paid:", invoice.id, "SessionId:", invoices.metadata?.sessionId);
        // Optional: Store invoice in MongoDB (requires Invoice model)
        /*
        const existingInvoice = await Invoice.findOne({ invoiceId: invoice.id });
        if (!existingInvoice) {
          await Invoice.create({
            invoiceId: invoice.id,
            sessionId: invoice.metadata?.sessionId,
            userId: invoice.metadata?.userId,
            amount: invoice.amount_paid / 100,
            status: invoice.status,
            created: invoice.created * 1000,
          });
          console.log("Webhook - Invoice stored:", invoice.id);
        }
        */
        break;

      default:
        console.log("Webhook - Unhandled event type:", event.type);
    }
    return res.status(200).json({ received: true });
  } catch (err) {
    console.error("Webhook - Error processing event:", err.message);
    return res.status(500).json({ error: err.message });
  }
}