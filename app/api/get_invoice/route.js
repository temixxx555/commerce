import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const invoiceId = searchParams.get("invoiceId");
    
    if (!invoiceId) {
      return NextResponse.json(
        { success: false, message: "Missing invoiceId" },
        { status: 400 }
      );
    }
    
    // Retrieve invoice with expanded data
    const invoice = await stripe.invoices.retrieve(invoiceId, {
      expand: ["customer", "lines.data.price.product"],
    });
    
    console.log("Retrieved invoice:", JSON.stringify(invoice, null, 2));

    // Extract customer information
    const customerName = invoice.customer_name || 
                         invoice.customer?.name || 
                         "N/A";
    
    const customerEmail = invoice.customer_email || 
                          invoice.customer?.email || 
                          "N/A";

    // Process line items with proper details
    const lineItems = invoice.lines.data.map((line) => {
      const unitAmount = line.price?.unit_amount 
        ? line.price.unit_amount / 100  // Convert from cents if unit_amount is available
        : line.amount / (line.quantity * 100);  // Calculate from total if not
        
      return {
        description: line.description || (line.price?.product?.name) || "Product",
        quantity: line.quantity,
        unit_amount: unitAmount,
        amount: line.amount / 100, // Convert total to dollars
        currency: invoice.currency,
      };
    });

    // Calculate invoice totals
    const subtotal = invoice.subtotal / 100; // Convert from cents
    const tax = invoice.tax / 100;
    const total = invoice.total / 100;
    const amountPaid = invoice.amount_paid / 100;
    const amountDue = invoice.amount_due / 100;
    
    // Determine status
    const paymentStatus = invoice.status;
    const isPaid = paymentStatus === "paid";
    
    // Format due date
    const dueDate = invoice.due_date ? new Date(invoice.due_date * 1000) : null;

    return NextResponse.json({
      success: true,
      invoice: {
        id: invoice.id,
        number: invoice.number,
        amount_due: amountDue,
        amount_paid: amountPaid,
        currency: invoice.currency,
        customer_name: customerName,
        customer_email: customerEmail,
        created: invoice.created,
        status: paymentStatus,
        isPaid: isPaid,
        lines: lineItems,
        subtotal: subtotal,
        tax: tax,
        total: total,
        hosted_invoice_url: invoice.hosted_invoice_url,
        invoice_pdf: invoice.invoice_pdf,
        due_date: invoice.due_date,
        paid_date: invoice.status_transitions?.paid_at,
      },
    });
  } catch (err) {
    console.error("Invoice retrieval error:", err);
    console.error("Error details:", err.message);
    
    if (err.type === 'StripeInvalidRequestError') {
      return NextResponse.json({
        success: false, 
        message: "Invalid invoice ID or invoice not found",
        error: err.message
      }, { status: 404 });
    }
    
    return NextResponse.json(
      { success: false, message: err.message || "Failed to retrieve invoice" },
      { status: 500 }
    );
  }
}