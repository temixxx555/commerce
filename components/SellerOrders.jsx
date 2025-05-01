"use client";
export const dynamic = "force-dynamic";

import React, { useEffect, useState, Suspense } from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";
import { useAppContext } from "@/context/AppContext";
import Footer from "@/components/seller/Footer";
import Loading from "@/components/Loading";
import axios from "axios";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
``
// Extract search params logic to separate component
function OrdersContent() {
  const { currency, getToken, user } = useAppContext();
  const { useSearchParams } = require("next/navigation");
  const searchParams = useSearchParams();
  const router = useRouter();
  const refresh = searchParams?.get("refresh");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [polling, setPolling] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Only run client-side
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const fetchSellerOrders = async () => {
    try {
      const token = await getToken();
      console.log("Fetching seller orders with token:", token);
      const { data } = await axios.get("/api/order/seller-orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Seller API response:", data);
      if (data.success) {
        setOrders(data.orders.reverse()); // Reverse to show newest first
        setLoading(false);
        setPolling(false);
      } else {
        toast.error(data.message);
        setLoading(false);
        setPolling(false);
      }
    } catch (error) {
      console.error("Fetch seller orders error:", error);
      toast.error(error.message || "Failed to fetch orders");
      setLoading(false);
      setPolling(false);
    }
  };

  useEffect(() => {
    // Only proceed if component is mounted and user exists
    if (isMounted && user) {
      setLoading(true);
      fetchSellerOrders();

      if (refresh) {
        setPolling(true);
        const maxAttempts = 5;
        let attempts = 0;
        const interval = setInterval(() => {
          attempts += 1;
          console.log(`Polling attempt ${attempts}`);
          fetchSellerOrders();
          if (attempts >= maxAttempts) {
            clearInterval(interval);
            setPolling(false);
            router.replace("/seller/orders");
            console.log("Polling stopped after max attempts");
          }
        }, 2000);

        return () => clearInterval(interval);
      }
    }
  }, [isMounted, user, refresh, router]);

  // Show nothing during SSR
  if (!isMounted) {
    return null;
  }

  return (
    <div className="flex-1 h-screen overflow-scroll flex flex-col justify-between text-sm">
      {loading || polling ? (
        <Loading />
      ) : orders.length === 0 ? (
        <p className="p-4">No orders found.</p>
      ) : (
        <div className="md:p-10 p-4 space-y-5">
          <h2 className="text-lg font-medium">Orders</h2>
          <div className="max-w-4xl rounded-md border-t border-gray-300">
            {orders.map((order, index) => {
              console.log("Seller order items:", order.items);
              const totalAmount = order.items.reduce(
                (acc, item) => acc + (item.amount || 0) * item.quantity,
                0
              );
              return (
                <div
                  key={index}
                  className="flex flex-col md:flex-row gap-5 justify-between p-5 border-b border-gray-300"
                >
                  <div className="flex-1 flex gap-5 max-w-80">
                    <Image
                      className="max-w-16 max-h-16 object-cover"
                      src={assets.box_icon}
                      alt="box_icon"
                    />
                    <p className="flex flex-col gap-3">
                      <span className="font-medium text-base">
                        {order.items
                          .map((item) =>
                            item.product
                              ? `${item.product.name} x ${item.quantity}`
                              : "Unknown Product"
                          )
                          .join(", ")}
                      </span>
                      <span>Items: {order.items.length}</span>
                    </p>
                  </div>
                  <div>
                    <p>
                      <span className="font-medium">{order.address.fullName}</span>
                      <br />
                      <span>{order.address.area}</span>
                      <br />
                      <span>{`${order.address.city}, ${order.address.state}`}</span>
                      <br />
                      <span>{order.address.phoneNumber}</span>
                    </p>
                  </div>
                  <p className="font-medium my-auto">
                    {currency}
                    {isNaN(totalAmount)
                      ? "N/A"
                      : totalAmount.toLocaleString("en-CA", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                  </p>
                  <div>
                    <p className="flex flex-col">
                      <span>Method: {order.paymentMethod || "Card"}</span>
                      <span>
                        Date: {new Date(order.items[0]?.date).toLocaleDateString()}
                      </span>
                      <span>Payment: {order.paymentStatus || "Paid"}</span>
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
}

// Main component with Suspense boundary
const Orders = () => {
  return (
    <Suspense fallback={<Loading />}>
      <OrdersContent />
    </Suspense>
  );
};

export default Orders;