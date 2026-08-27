// app/components/shared/ScrollToTopOnNav.tsx
"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export default function ScrollToTopOnNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Disable automatic browser scroll retention on route change
    if (typeof window !== "undefined") {
      try {
        window.history.scrollRestoration = "manual";
      } catch (_) {}

      // Scroll immediately to top on any page navigation
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "instant",
      });
    }
  }, [pathname, searchParams]);

  return null;
}
