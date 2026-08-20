// app/cart/page.tsx
import { Metadata } from "next";
import CartPage from "../(public)/pages/CartPage";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Shopping Cart",
    description: "Review your cart items",
  };
}

export default async function Cart() {
  return <CartPage />;
}