// app/track-order/page.tsx
import { Metadata } from "next";
import GuestOrderTrackingPage from "../(public)/pages/GuestOrderTrackingPage";

export const metadata: Metadata = {
  title: "Track Your Lamp Shipment in Real-Time",
  description:
    "Enter your order tracking ID or phone number to check the live courier delivery status of your handcrafted wooden lamp across Pakistan.",
  keywords: [
    "track order",
    "track wooden lamp delivery",
    "order status pakistan",
    "courier tracking talal wooden lamps",
  ],
  alternates: {
    canonical: "/track-order",
  },
};

export default function TrackOrderPage() {
  return <GuestOrderTrackingPage />;
}