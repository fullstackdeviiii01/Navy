// app/checkout/page.tsx
import { Metadata } from "next";
import CheckoutPage from "../(public)/pages/CheckoutPage";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Checkout",
    description: "Complete your purchase",
  };
}

export default async function Checkout() {
  return <CheckoutPage />;
}