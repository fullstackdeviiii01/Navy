// app/cart/page.tsx (Updated)
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getStaticPageSettings, checkPageVisibility } from "../../lib/metadata/homeMetadata";
import CartPage from "../(public)/pages/CartPage";
export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getStaticPageSettings('cart');
  
  return {
    title: settings?.meta_title || "Shopping Cart",
    description: settings?.meta_description || "Review your cart items",
  };
}

export default async function Cart() {
  const isVisible = await checkPageVisibility('cart');
  
  if (!isVisible) {
    notFound();
  }

  return <CartPage />;
}