"use client";

import { DarkModeProvider } from "./context/DarkModeProvider";
import { UserProvider } from "./context/UserContext";
import { WishlistProvider } from "./context/WishlistContext";
import { CurrencyProvider } from "./context/CurrencyContext";

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DarkModeProvider>
      <UserProvider>
        <CurrencyProvider>
          <WishlistProvider>
            {children}
          </WishlistProvider>
        </CurrencyProvider>
      </UserProvider>
    </DarkModeProvider>
  );
}