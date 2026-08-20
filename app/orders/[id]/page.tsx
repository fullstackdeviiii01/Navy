import { Metadata } from "next";
import OrderDetailPage from "../../(public)/pages/OrderDetailPage";

export const metadata: Metadata = {
  title: "Order Details",
  description: "View your order details"
};

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
   return <OrderDetailPage orderId={id} />;
}