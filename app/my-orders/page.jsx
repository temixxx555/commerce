'use client';

import React, { useEffect, useState } from "react";
import { useAppContext } from "@/context/AppContext"; // Assuming context is available
import Loading from "@/components/Loading";
import OrderCard from "@/components/OrderCard";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
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
      toast.error(error?.message || "Failed to fetch orders");
    } finally {
      setLoading(false);
      setPolling(false);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined' && !user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    fetchOrders();

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
              {orders.map((order, index) => (
                <OrderCard key={order._id || index} order={order} currency={currency} />
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
