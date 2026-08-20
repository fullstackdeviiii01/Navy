"use client";

import { DarkModeProvider } from "./context/DarkModeProvider";
import { UserProvider } from "./context/UserContext";
import { WishlistProvider } from "./context/WishlistContext";
import CartSidebar from "./components/cart/CartSidebar";

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DarkModeProvider>
      <UserProvider>
          <WishlistProvider>
            {children}
            <CartSidebar />
          </WishlistProvider>
      </UserProvider>
    </DarkModeProvider>
  );
}
