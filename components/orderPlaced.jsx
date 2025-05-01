"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { assets } from "@/assets/assets";
import Image from "next/image";
import toast from "react-hot-toast";
import Loading from "@/components/Loading"; // Assuming you have this component

// Content component that uses searchParams
function OrderPlacedContent() {
  const router = useRouter();
  const { useSearchParams } = require("next/navigation");
  const searchParams = useSearchParams();
  const session_id = searchParams?.get("session_id");
  const [isMounted, setIsMounted] = useState(false);

  // Client-side initialization
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // Only run if component is mounted and session_id exists
    if (isMounted && session_id) {
      const verifySession = async () => {
        try {
          const { data } = await axios.post("/api/verify_session", { sessionId: session_id });
          if (data.success) {
            toast.success("Order placed successfully!");
            router.push("/my-orders?refresh=true"); // Add refresh query parameter
          } else {
            toast.error(data.message);
            router.push("/cart");
          }
        } catch (error) {
          toast.error("Failed to verify payment");
          router.push("/cart");
        }
      };
      verifySession();
    }
  }, [isMounted, session_id, router]);

  // Don't render anything during SSR
  if (!isMounted) {
    return null;
  }

  return (
    <div className="h-screen flex flex-col justify-center items-center gap-5">
      <div className="flex justify-center items-center relative">
        <Image className="absolute p-5" src={assets.checkmark} alt="" />
        <div className="animate-spin rounded-full h-24 w-24 border-4 border-t-green-300 border-gray-200"></div>
      </div>
      <div className="text-center text-2xl font-semibold">Order Placed Successfully</div>
    </div>
  );
}

// Main component with Suspense boundary
const OrderPlaced = () => {
  return (
    <Suspense fallback={
      <div className="h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-green-300 border-gray-200"></div>
      </div>
    }>
      <OrderPlacedContent />
    </Suspense>
  );
};

export default OrderPlaced;