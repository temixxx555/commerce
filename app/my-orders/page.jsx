"use client";
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

const MyOrders = () => {
  const { currency, getToken, user } = useAppContext();
  const searchParams = useSearchParams();
  const router = useRouter();
  const refresh = searchParams.get("refresh");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [polling, setPolling] = useState(false);

  const fetchOrders = async () => {
    try {
      const token = await getToken();
      console.log("Fetching orders with token:", token);
      const { data } = await axios.get("/api/order/list", {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("API response:", data);
      if (data.success) {
        setOrders(data.orders.reverse());
        setLoading(false);
        setPolling(false);
      } else {
        toast.error(data.message);
        setLoading(false);
        setPolling(false);
      }
    } catch (error) {
      console.error("Fetch orders error:", error);
      toast.error(error.message || "Failed to fetch orders");
      setLoading(false);
      setPolling(false);
    }
  };

  useEffect(() => {
    if (user) {
      setLoading(true);
      fetchOrders();

      if (refresh) {
        setPolling(true);
        const maxAttempts = 5;
        let attempts = 0;
        const interval = setInterval(() => {
          attempts += 1;
          console.log(`Polling attempt ${attempts}`);
          fetchOrders();
          if (attempts >= maxAttempts) {
            clearInterval(interval);
            setPolling(false);
            router.replace("/my-orders");
            console.log("Polling stopped after max attempts");
          }
        }, 2000);

        return () => clearInterval(interval);
      }
    }
  }, [user, refresh, router]);

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
                console.log("Order items:", order.items);
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
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default MyOrders;