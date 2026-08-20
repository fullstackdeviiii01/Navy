// app/ConditionalLayout.jsx
"use client";
import { Suspense } from "react";
import { usePathname } from "next/navigation";
import { Analytics } from "@vercel/analytics/next";
import Header from "./components/Header";
import Footerr from "./components/Footerr";
import { UserProvider } from "./context/UserContext";
import { WishlistProvider } from "./context/WishlistContext";
import CartSidebar from "./components/cart/CartSidebar";

export default function ConditionalLayout({ children }) {
  const pathname = usePathname();
  const isAdminPage = pathname?.startsWith("/admin");

  return (
    <UserProvider>
      <WishlistProvider>
        {!isAdminPage && <Header />}
        <Suspense fallback={null}>
          {children}
        </Suspense>
        <CartSidebar />
        <Analytics />
        {!isAdminPage && <Footerr />}
      </WishlistProvider>
    </UserProvider>
  );
}
