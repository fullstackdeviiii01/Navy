// app/conditionalLayout.jsx
"use client";
import { Suspense } from "react";
import { usePathname } from "next/navigation";
import { Analytics } from "@vercel/analytics/next";
import Header from "./components/Header";
import Footerr from "./components/Footerr";
import { DarkModeProvider } from "./context/DarkModeProvider";
import EmailVerificationBanner from "./components/email-verification-banner";
import { UserProvider } from "./context/UserContext";
import { WishlistProvider } from "./context/WishlistContext";

export default function ConditionalLayout({ children }) {
  const pathname = usePathname();
  const isAdminPage = pathname?.startsWith("/admin");

  return (
    <DarkModeProvider>
      <UserProvider>
        <WishlistProvider>
          {!isAdminPage && <Header />}
          <Suspense fallback={null}>
            {/* {!isAdminPage && <EmailVerificationBanner />} */}
            {children}
          </Suspense>
          <Analytics />
          {!isAdminPage && <Footerr />}
        </WishlistProvider>
      </UserProvider>
    </DarkModeProvider>
  );
}
