import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import Invoice from "@/models/Invoice";
import { getAuth } from "@clerk/nextjs/server";

export async function GET(req) {
  try {
    await connectDB();
    const { userId } = getAuth(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const invoices = await Invoice.find({ userId }).sort({ created: -1 });
    return NextResponse.json({ success: true, invoices });
  } catch (err) {
    console.error("Invoices API Error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}