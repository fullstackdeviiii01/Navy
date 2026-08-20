"use client";

import { DarkModeProvider } from "./context/DarkModeProvider";
import { UserProvider } from "./context/UserContext";
import { WishlistProvider } from "./context/WishlistContext";

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
          </WishlistProvider>
      </UserProvider>
    </DarkModeProvider>
  );
}