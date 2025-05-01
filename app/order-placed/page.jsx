"use client";
export const dynamic = "force-dynamic";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { assets } from "@/assets/assets";
import Image from "next/image";
import toast from "react-hot-toast";

const OrderPlaced = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const session_id = searchParams.get("session_id");

  useEffect(() => {
    if (session_id) {
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
  }, [session_id, router]);

  return (
    <div className="h-screen flex flex-col justify-center items-center gap-5">
      <div className="flex justify-center items-center relative">
        <Image className="absolute p-5" src={assets.checkmark} alt="" />
        <div className="animate-spin rounded-full h-24 w-24 border-4 border-t-green-300 border-gray-200"></div>
      </div>
      <div className="text-center text-2xl font-semibold">Order Placed Successfully</div>
    </div>
  );
};

export default OrderPlaced;