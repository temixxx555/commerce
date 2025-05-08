"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { assets } from "@/assets/assets";
import Image from "next/image";
import toast from "react-hot-toast";

function OrderPlacedContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const session_id = searchParams?.get("session_id");
  const [isMounted, setIsMounted] = useState(false);
  const [status, setStatus] = useState("loading"); // loading, success, error
  const [invoice, setInvoice] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && session_id) {
      const processedSessions = JSON.parse(localStorage.getItem("processedSessions") || "[]");
      if (processedSessions.includes(session_id)) {
        console.log(`Session ${session_id} already processed, redirecting to /my-orders`);
        setStatus("success");
        router.push("/my-orders?refresh=true");
        return;
      }

      const verifySession = async () => {
        try {
          setIsLoading(true);
          console.log(`Verifying session ${session_id}`);
          const { data } = await axios.post("/api/verify_session", { sessionId: session_id });
          console.log("API response:", data);

          if (data.success) {
            processedSessions.push(session_id);
            localStorage.setItem("processedSessions", JSON.stringify(processedSessions));
            toast.success("Order placed successfully!");

            // Fetch invoice details
            if (data.invoiceId) {
              try {
                const invoiceResponse = await axios.get(`/api/get_invoice?invoiceId=${data.invoiceId}`);
                if (invoiceResponse.data.success) {
                  console.log("Invoice data:", invoiceResponse.data.invoice);
                  setInvoice(invoiceResponse.data.invoice);
                } else {
                  console.error("Failed to fetch invoice:", invoiceResponse.data.message);
                  toast.error("Failed to load invoice details");
                }
              } catch (invoiceError) {
                console.error("Invoice fetch error:", invoiceError.response?.data || invoiceError);
                toast.error("Failed to load invoice details");
              }
            } else {
              console.warn("No invoiceId returned from verify_session");
            }

            setStatus("success");
          } else {
            console.error("Verification failed:", data.message);
            toast.error(data.message || "Order verification failed");
            setStatus("error");
            setTimeout(() => router.push("/cart"), 1000);
          }
        } catch (error) {
          console.error("Verify session error:", {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
          });
          toast.error(error.response?.data?.message || "Failed to verify payment");
          setStatus("error");
          setTimeout(() => router.push("/cart"), 1000);
        } finally {
          setIsLoading(false);
        }
      };
      verifySession();
    } else if (isMounted && !session_id) {
      console.error("No session_id provided");
      toast.error("Invalid session");
      setStatus("error");
      setTimeout(() => router.push("/cart"), 1000);
    }
  }, [isMounted, session_id, router]);

  if (!isMounted) {
    return null;
  }

  const formatCurrency = (amount, currency = "CAD") => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: currency.toUpperCase()
    }).format(amount);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    return new Date(timestamp * 1000).toLocaleDateString('en-CA', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center gap-5 p-5">
      {status === "loading" || isLoading ? (
        <div className="flex justify-center items-center relative">
          <div className="animate-spin rounded-full h-24 w-24 border-4 border-t-green-300 border-gray-200"></div>
        </div>
      ) : status === "success" ? (
        <>
          <div className="flex justify-center items-center relative">
            <Image className="absolute p-5" src={assets.checkmark} alt="" />
            <div className="rounded-full h-24 w-24 border-4 border-green-500 "></div>
          </div>
          <div className="text-center text-2xl font-semibold">Order Placed Successfully</div>

          {invoice ? (
            <div className="mt-5 w-full max-w-2xl bg-gray-100 p-5 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-3 border-b pb-2">Invoice Details</h2>
              
              <div className="grid grid-cols-2 gap-2 mb-4">
                <p className="font-semibold">Invoice Number:</p>
                <p>{invoice.number || "N/A"}</p>
                
                <p className="font-semibold">Customer:</p>
                <p>{invoice.customer_name || "N/A"}</p>
                
                <p className="font-semibold">Email:</p>
                <p>{invoice.customer_email || "N/A"}</p>
                
                <p className="font-semibold">Amount Due:</p>
                <p className={invoice.amount_due === 0 ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>
                  {formatCurrency(invoice.amount_due, invoice.currency)}
                </p>
                
                <p className="font-semibold">Status:</p>
                <p className={invoice.status === "paid" ? "text-green-600 font-semibold" : "font-semibold"}>
                  {invoice.status?.charAt(0).toUpperCase() + invoice.status?.slice(1) || "N/A"}
                </p>
                
                <p className="font-semibold">Date:</p>
                <p>{formatDate(invoice.created)}</p>
                
                <p className="font-semibold">Due Date:</p>
                <p>{formatDate(invoice.due_date)}</p>
              </div>

              <h3 className="text-lg font-semibold mt-4 mb-2">Items</h3>
              {invoice.lines && invoice.lines.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-200">
                        <th className="text-left p-2">Description</th>
                        <th className="text-right p-2">Quantity</th>
                        <th className="text-right p-2">Price</th>
                        <th className="text-right p-2">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoice.lines.map((line, index) => (
                        <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                          <td className="p-2">{line.description || "Product"}</td>
                          <td className="text-right p-2">{line.quantity}</td>
                          <td className="text-right p-2">
                            {formatCurrency(line.unit_amount || (line.amount / line.quantity), invoice.currency)}
                          </td>
                          <td className="text-right p-2">
                            {formatCurrency(line.amount, invoice.currency)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="border-t border-gray-300">
                      <tr>
                        <td colSpan="3" className="text-right p-2 font-semibold">Subtotal:</td>
                        <td className="text-right p-2">{formatCurrency(invoice.subtotal || 0, invoice.currency)}</td>
                      </tr>
                      <tr>
                        <td colSpan="3" className="text-right p-2 font-semibold">Tax:</td>
                        <td className="text-right p-2">{formatCurrency(invoice.tax || 0, invoice.currency)}</td>
                      </tr>
                      <tr className="font-bold">
                        <td colSpan="3" className="text-right p-2">Total:</td>
                        <td className="text-right p-2">{formatCurrency(invoice.total || 0, invoice.currency)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500 italic">No items found in this invoice.</p>
              )}

              <div className="mt-5 flex justify-center space-x-4">
                {invoice.hosted_invoice_url && (
                  <a
                    href={invoice.hosted_invoice_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
                  >
                    View Invoice Online
                  </a>
                )}
                {invoice.invoice_pdf && (
                  <a
                    href={invoice.invoice_pdf}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition"
                  >
                    Download PDF
                  </a>
                )}
              </div>
            </div>
          ) : (
            <p className="mt-3 text-gray-500">Invoice details are loading or not available.</p>
          )}

          <button
            onClick={() => router.push("/my-orders?refresh=true")}
            className="mt-5 bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 transition"
          >
            View My Orders
          </button>
        </>
      ) : (
        <div className="text-center">
          <div className="text-2xl font-semibold text-red-500 mb-3">Failed to Place Order</div>
          <button
            onClick={() => router.push("/cart")}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
          >
            Return to Cart
          </button>
        </div>
      )}
    </div>
  );
}

const OrderPlaced = () => {
  return (
    <Suspense
      fallback={
        <div className="h-screen flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-green-300 border-gray-200"></div>
        </div>
      }
    >
      <OrderPlacedContent />
    </Suspense>
  );
};

export default OrderPlaced;