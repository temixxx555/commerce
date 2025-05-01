export const dynamic = "force-dynamic";

import { Suspense } from "react";
import Loading from "@/components/Loading";
import MyOrders from "@/components/MyOrder";
 // Import your client component

export default function OrdersPage() {
  return (
    <Suspense fallback={<Loading />}>
      <MyOrders />
    </Suspense>
  );
}