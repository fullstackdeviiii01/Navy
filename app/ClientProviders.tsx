"use client";

import { Suspense } from "react";
import { UserProvider } from "./context/UserContext";
import { WishlistProvider } from "./context/WishlistContext";
import CartSidebar from "./components/cart/CartSidebar";
import ScrollToTopOnNav from "./components/shared/ScrollToTopOnNav";

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <UserProvider>
      <WishlistProvider>
        <Suspense fallback={null}>
          <ScrollToTopOnNav />
        </Suspense>
        {children}
        <CartSidebar />
      </WishlistProvider>
    </UserProvider>
  );
}

