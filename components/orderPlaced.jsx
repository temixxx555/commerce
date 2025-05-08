"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { assets } from "@/assets/assets";
import Image from "next/image";
import toast from "react-hot-toast";

function OrderPlacedContent() {
  const router = useRouter();
  const { useSearchParams } = require("next/navigation");
  const searchParams = useSearchParams();
  const session_id = searchParams?.get("session_id");
  const [isMounted, setIsMounted] = useState(false);
  const [status, setStatus] = useState("loading"); // loading, success, error

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && session_id) {
      // Check if session_id was already processed
      const processedSessions = JSON.parse(localStorage.getItem("processedSessions") || "[]");
      if (processedSessions.includes(session_id)) {
        console.log(`Session ${session_id} already processed, redirecting to /my-orders`);
        setStatus("success");
        router.push("/my-orders?refresh=true");
        return;
      }

      const verifySession = async () => {
        try {
          console.log(`Verifying session ${session_id}`);
          const { data } = await axios.post("/api/verify_session", { sessionId: session_id });
          console.log("API response:", data);

          if (data.success) {
            processedSessions.push(session_id);
            localStorage.setItem("processedSessions", JSON.stringify(processedSessions));
            toast.success("Order placed successfully!");
            setStatus("success");
            setTimeout(() => router.push("/my-orders?refresh=true"), 1000);
          } else {
            console.error("Verification failed:", data.message);
            toast.error(data.message || "Order verification failed");
            setStatus("error");
            setTimeout(() => router.push("/cart"), 1000);
          }
        } catch (error) {
          console.error("Verify session error:", error.response?.data || error);
          toast.error(error.response?.data?.message || "Failed to verify payment");
          setStatus("error");
          setTimeout(() => router.push("/cart"), 1000);
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

  return (
    <div className="h-screen flex flex-col justify-center items-center gap-5">
      {status === "loading" && (
        <div className="flex justify-center items-center relative">
          <div className="animate-spin rounded-full h-24 w-24 border-4 border-t-green-300 border-gray-200"></div>
        </div>
      )}
      {status === "success" && (
        <>
          <div className="flex justify-center items-center relative">
            <Image className="absolute p-5" src={assets.checkmark} alt="" />
            <div className="animate-spin rounded-full h-24 w-24 border-4 border-t-green-300 border-gray-200"></div>
          </div>
          <div className="text-center text-2xl font-semibold">Order Placed Successfully</div>
        </>
      )}
      {status === "error" && (
        <div className="text-center text-2xl font-semibold text-red-500">Failed to Place Order</div>
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