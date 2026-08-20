// app/checkout/page.tsx (Updated)
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getStaticPageSettings, checkPageVisibility } from "../../lib/metadata/homeMetadata";
import CheckoutPage from "../(public)/pages/CheckoutPage";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getStaticPageSettings('checkout');
  
  return {
    title: settings?.meta_title || "Checkout",
    description: settings?.meta_description || "Complete your purchase",
  };
}

export default async function Checkout() {
  const isVisible = await checkPageVisibility('checkout');
  
  if (!isVisible) {
    notFound();
  }

  return <CheckoutPage />;
}