import { Metadata } from "next";
import OrderConfirmationPage from "../../(public)/pages/OrderConfirmationPage";

export const metadata: Metadata = {
  title: "Order Confirmation",
  description: "Your order has been placed successfully"
};

export default async function OrderConfirmation({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <OrderConfirmationPage orderId={id} />;
}