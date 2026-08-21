"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "../context/UserContext";
import Loader from "../components/shared/Loader";

export default function LogoutPage() {
  const router = useRouter();
  const { logout } = useUser();

  useEffect(() => {
    const handleLogout = async () => {
      try {
        await logout();
        router.push("/");
      } catch (error) {
        console.error("Logout failed:", error);
        router.push("/");
      }
    };

    handleLogout();
  }, [router, logout]);

  return <Loader text="SIGNING OUT..." fullScreen />;
}
