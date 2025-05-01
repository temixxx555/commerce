export const dynamic = "force-dynamic";

import OrderPlaced from "@/components/orderPlaced";
import { Suspense } from "react";

export default function OrderPlacedPage() {
  return (
    <Suspense fallback={
      <div className="h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-green-300 border-gray-200"></div>
      </div>
    }>
      <OrderPlaced />
    </Suspense>
  );
}