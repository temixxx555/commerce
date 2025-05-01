"use client";
import React, { useEffect, useState } from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";
import { useAppContext } from "@/context/AppContext";
import Footer from "@/components/seller/Footer";
import Loading from "@/components/Loading";
import axios from "axios";
import toast from "react-hot-toast";
import { useSearchParams, useRouter } from "next/navigation";

// Force dynamic rendering to skip prerendering
export const dynamic = "force-dynamic";

const Orders = () => {
  const { currency, getToken, user } = useAppContext() || {};
  const searchParams = useSearchParams();
  const router = useRouter();
  const refresh = searchParams?.get("refresh") || null;
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [polling, setPolling] = useState(false);

  const fetchSellerOrders = async () => {
    try {
      if (!getToken) {
        console.warn("getToken is undefined, skipping fetchSellerOrders");
        setLoading(false);
        setPolling(false);
        return;
      }
      const token = await getToken();
      if (!token) {
        console.warn("No token available, skipping fetchSellerOrders");
        setLoading(false);
        setPolling(false);
        return;
      }
      console.log("Fetching seller orders with token:", token);
      const { data } = await axios.get("/api/order/seller-orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Seller API response:", data);
      if (data?.success) {
        setOrders(data.orders ? data.orders.reverse() : []);
        setLoading(false);
        setPolling(false);
      } else {
        toast.error(data?.message || "Failed to fetch orders");
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
    console.log("Orders useEffect - user:", user);
    if (!user) {
      console.log("No user available, skipping fetchSellerOrders");
      setLoading(false);
      return;
    }

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
  }, [user, refresh, router, getToken]);

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
              console.log("Seller order items:", order?.items);
              const totalAmount = order?.items?.reduce(
                (acc, item) => acc + ((item?.amount || 0) * (item?.quantity || 1)),
                0
              ) || 0;
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
                        {order?.items
                          ?.map((item) =>
                            item?.product?.name
                              ? `${item.product.name} x ${item.quantity || 1}`
                              : "Unknown Product"
                          )
                          .join(", ") || "No items"}
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
                      <span>{order?.address?.area || ""}</span>
                      <br />
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
                    {isNaN(totalAmount)
                      ? "N/A"
                      : totalAmount.toLocaleString("en-CA", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                  </p>
                  <div>
                    <p className="flex flex-col">
                      <span>Method: {order?.paymentMethod || "Card"}</span>
                      <span>
                        Date:{" "}
                        {order?.items?.[0]?.date
                          ? new Date(order.items[0].date).toLocaleDateString()
                          : "N/A"}
                      </span>
                      <span>Payment: {order?.paymentStatus || "Paid"}</span>
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
};

export default Orders;