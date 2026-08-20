// app/hooks/useBanCheck.ts
import { useState } from "react";

interface BanCheckResult {
  is_banned: boolean;
  is_active: boolean;
  exists: boolean;
}

export function useBanCheck() {
  const [checking, setChecking] = useState(false);

  const checkBanStatus = async (email: string): Promise<BanCheckResult> => {
    setChecking(true);
    try {
      const response = await fetch("/api/users/check-ban", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        // On API error, don't block the user
        return { is_banned: false, is_active: true, exists: false };
      }

      return await response.json();
    } catch (error) {
      console.error("Ban check error:", error);
      // On network error, don't block the user
      return { is_banned: false, is_active: true, exists: false };
    } finally {
      setChecking(false);
    }
  };

  return { checkBanStatus, checking };
}