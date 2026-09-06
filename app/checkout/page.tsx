// app/checkout/page.tsx
import { Metadata } from "next";
import { Suspense } from "react";
import CheckoutPage from "../(public)/pages/CheckoutPage";
import Loader from "../components/shared/Loader";

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
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-theme-bg-light dark:bg-theme-bg-dark flex items-center justify-center">
          <Loader />
        </div>
      }
    >
      <CheckoutPage />
    </Suspense>
  );
}