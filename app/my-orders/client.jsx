'use client';

import React, { useEffect, useState } from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";
import { useAppContext } from "@/context/AppContext";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import Loading from "@/components/Loading";
import axios from "axios";
import toast from "react-hot-toast";
import { useSearchParams, useRouter } from "next/navigation";

export default function MyOrdersClient() {
  const { currency, getToken, user } = useAppContext() || {};
  const searchParams = useSearchParams();
  const router = useRouter();
  const refresh = searchParams?.get("refresh") || null;
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [polling, setPolling] = useState(false);

  const fetchOrders = async () => {
    try {
      // Early return if user authentication isn't ready
      if (!user || !getToken) {
        setLoading(false);
        setPolling(false);
        return;
      }

      const token = await getToken();
      if (!token) {
        setLoading(false);
        setPolling(false);
        return;
      }

      const { data } = await axios.get("/api/order/list", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data?.success) {
        setOrders(data.orders ? data.orders.reverse() : []);
      } else {
        toast.error(data?.message || "Failed to fetch orders");
      }
    } catch (error) {
      console.error("Fetch orders error:", error?.response?.data || error?.message || error);
      toast.error(error?.response?.data?.message || error?.message || "Failed to fetch orders");
    } finally {
      // Always reset loading state regardless of success/failure
      setLoading(false);
      setPolling(false);
    }
  };

  useEffect(() => {
    // Handle auth redirect if needed
    if (typeof window !== 'undefined' && !user) {
      // Optional: Redirect to login if no user
      // router.push('/login');
      setLoading(false);
      return;
    }

    setLoading(true);
    fetchOrders();

    // Handle refresh polling logic
    if (refresh) {
      setPolling(true);
      const maxAttempts = 5;
      let attempts = 0;
      const interval = setInterval(() => {
        attempts += 1;
        fetchOrders();
        if (attempts >= maxAttempts) {
          clearInterval(interval);
          setPolling(false);
          router.replace("/my-orders");
        }
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [user, refresh]);

  // Safely format currency amount
  const formatAmount = (amount) => {
    if (amount === undefined || amount === null || isNaN(amount)) {
      return "N/A";
    }
    return amount.toLocaleString("en-CA", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Format date safely
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (error) {
      return "Invalid Date";
    }
  };

  return (
    <>
      <Navbar />
      <div className="flex flex-col justify-between px-6 md:px-16 lg:px-32 py-6 min-h-screen">
        <div className="space-y-5">
          <h2 className="text-lg font-medium mt-6">My Orders</h2>
          {loading || polling ? (
            <Loading />
          ) : orders.length === 0 ? (
            <p>No orders found.</p>
          ) : (
            <div className="max-w-5xl border-t border-gray-300 text-sm">
              {orders.map((order, index) => {
                const totalAmount = order?.items?.reduce(
                  (acc, item) => acc + ((item?.amount || 0) * (item?.quantity || 1)),
                  0
                ) || 0;
                
                return (
                  <div
                    key={order?._id || index}
                    className="flex flex-col md:flex-row gap-5 justify-between p-5 border-b border-gray-300"
                  >
                    <div className="flex-1 flex gap-5 max-w-80">
                      <Image
                        className="max-w-16 max-h-16 object-cover"
                        src={assets.box_icon}
                        alt="Order package"
                        width={64}
                        height={64}
                      />
                      <p className="flex flex-col gap-3">
                        <span className="font-medium text-base">
                          {order?.items?.length > 0
                            ? order.items
                                .map((item) =>
                                  item?.product?.name
                                    ? `${item.product.name} x ${item.quantity || 1}`
                                    : "Unknown Product"
                                )
                                .join(", ")
                            : "No items"}
                        </span>
                        <span>Items: {order?.items?.length || 0}</span>
                      </p>
                    </div>
                    <div>
                      <p>
                        <span className="font-medium">
                          {order?.address?.fullName || "N/A"}
                        </span>
                        <br />
                        {order?.address?.area && <><span>{order.address.area}</span><br /></>}
                        <span>
                          {order?.address?.city && order?.address?.state
                            ? `${order.address.city}, ${order.address.state}`
                            : "N/A"}
                        </span>
                        <br />
                        <span>{order?.address?.phoneNumber || "N/A"}</span>
                      </p>
                    </div>
                    <p className="font-medium my-auto">
                      {currency || "CA$"}
                      {formatAmount(totalAmount)}
                    </p>
                    <div>
                      <p className="flex flex-col">
                        <span>Method: {order?.paymentMethod || "Card"}</span>
                        <span>
                          Date: {formatDate(order?.items?.[0]?.date)}
                        </span>
                        <span>Payment: {order?.paymentStatus || "Paid"}</span>
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}