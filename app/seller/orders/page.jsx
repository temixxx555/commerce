export const dynamic = "force-dynamic";

import { Suspense } from "react";
import Loading from "@/components/Loading";
import Orders from "@/components/SellerOrders";

export default function SellerOrdersPage() {
  return (
    <Suspense fallback={<Loading />}>
      <Orders />
    </Suspense>
  );
}