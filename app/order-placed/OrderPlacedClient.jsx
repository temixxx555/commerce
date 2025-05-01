"use client";
import React, { useEffect, useState } from "react";
import { useAppContext } from "@/context/AppContext";
import { useSearchParams, useRouter } from "next/navigation";
import Loading from "@/components/Loading";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import axios from "axios";
import toast from "react-hot-toast";

const OrderPlacedClient = () => {
  const { user, getToken } = useAppContext() || {};
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams?.get("session_id") || null;
  const [loading, setLoading] = useState(true);
  const [orderConfirmed, setOrderConfirmed] = useState(false);

  useEffect(() => {
    const verifyOrder = async () => {
      if (!user) {
        router.push("/login");
        setLoading(false);
        return;
      }

      if (!sessionId) {
        router.push("/my-orders");
        setLoading(false);
        return;
      }

      try {
        const token = await getToken?.();
        if (!token) {
          router.push("/login");
          setLoading(false);
          return;
        }

        const response = await axios.post(
          "/api/verify_session",
          { sessionId },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.data?.success) {
          setOrderConfirmed(true);
          toast.success("Order placed successfully!");
          setTimeout(() => {
            router.push("/my-orders?refresh=true");
          }, 2000);
        } else {
          toast.error(response.data?.message || "Failed to verify order");
          router.push("/my-orders");
        }
      } catch (error) {
        console.error("Verify order error:", error);
        toast.error(error.message || "Failed to verify order");
        router.push("/my-orders");
      } finally {
        setLoading(false);
      }
    };

    verifyOrder();
  }, [user, sessionId, router, getToken]);

  return (
    <>
      <Navbar />
      <div className="flex flex-col items-center justify-center min-h-screen px-6 py-6">
        {loading ? (
          <Loading />
        ) : orderConfirmed ? (
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-medium">Order Confirmed!</h1>
            <p>Your order has been placed successfully.</p>
            <p>You will be redirected to your orders page shortly...</p>
          </div>
        ) : (
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-medium">Order Verification Failed</h1>
            <p>There was an issue verifying your order. Redirecting to orders...</p>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default OrderPlacedClient;
