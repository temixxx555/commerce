// app/my-orders/page.tsx (Server Component)
import MyOrdersClient from './client';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export default function MyOrdersPage() {
  return <MyOrdersClient />;
}
