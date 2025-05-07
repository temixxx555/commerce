"use client";
export const dynamic = "force-dynamic";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { assets } from "@/assets/assets";
import toast from "react-hot-toast";

const OrderPlaced = () => {
  const router = useRouter();

  useEffect(() => {
    toast.success("Order placed successfully!");
    setTimeout(() => {
      router.push("/my-orders?refresh=true");
    }, 1000);
  }, [router]);

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