// app/checkout/page.tsx
import { Metadata } from "next";
import CheckoutPage from "../(public)/pages/CheckoutPage";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Secure Checkout",
    description: "Complete your order with secure payments, cash on delivery, and free nationwide delivery in Pakistan.",
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function Checkout() {
  return <CheckoutPage />;
}