// Cart.jsx
"use client";

import { useRouter } from "next/navigation";
import { useUser } from "../context/UserContext";
import { ShoppingCart } from "lucide-react";

export default function Cart() {
  const { cart } = useUser(); // ← read cart directly, not cartItemCount
  const router = useRouter();

  const cartItemCount = cart?.items?.reduce(
    (sum: number, item: any) => sum + (item.quantity || 1), 0
  ) || 0;

  return (
    <button
      onClick={() => router.push("/cart")}
      className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
      aria-label={`Shopping cart, ${cartItemCount} items`}
    >
      <ShoppingCart size={24} className="text-gray-700 dark:text-gray-300" />
      {cartItemCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-theme-primary text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
          {cartItemCount > 9 ? "9+" : cartItemCount}
        </span>
      )}
    </button>
  );
}