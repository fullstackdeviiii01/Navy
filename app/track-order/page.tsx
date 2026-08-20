// app/track-order/page.tsx
import { Metadata } from "next";
import GuestOrderTrackingPage from "../(public)/pages/GuestOrderTrackingPage";

export const metadata: Metadata = {
  title: "Track Your Order",
  description: "Track your order status and view order details"
};

export default function TrackOrderPage() {
  return <GuestOrderTrackingPage />;
}