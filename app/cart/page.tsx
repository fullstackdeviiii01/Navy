// app/cart/page.tsx
import { Metadata } from "next";
import CartPage from "../(public)/pages/CartPage";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Shopping Basket",
    description: "Review the artisanal solid wood lighting pieces in your shopping cart before checkout.",
    robots: {
      index: false,
      follow: true,
    },
  };
}

export default async function Cart() {
  return <CartPage />;
}