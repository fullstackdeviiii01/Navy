// // app/(public)/pages/AccountPage.tsx
"use client";

import { useState, useEffect } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../../../lib/firebase/firebaseClient";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser } from "../../context/UserContext.js";
import AccountHeader from "../../components/account/AccountHeader";
import AccountNavigation from "../../components/account/AccountNavigation";
import ProfileTab from "../../components/account/ProfileTab";
import OrdersTab from "../../components/account/OrdersTab";
import AddressesTab from "../../components/account/AddressesTab";
import PreferencesTab from "../../components/account/PreferencesTab";
import NotificationBanner from "../../components/account/NotificationBanner";
import MyReviewsTab from "../../components/account/MyReviewsTab";
import Loader from "../../components/shared/Loader";

export default function AccountPage() {
  const {
    user: dbUser,
    firebaseUser,
    loading: userLoading,
    refreshUser,
    updateUserProfile,
  } = useUser();

  const router = useRouter();
  const searchParams = useSearchParams();
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  const activeTab = searchParams.get("tab") || "profile";

  useEffect(() => {
    if (!userLoading && !firebaseUser) {
      router.push("/sign-in");
    }
  }, [firebaseUser, userLoading, router]);

  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError("");
        setSuccess("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  const handleTabChange = (tab: string) => {
    router.push(`?tab=${tab}`, { scroll: false });
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loader />
      </div>
    );
  }

  if (!firebaseUser) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <NotificationBanner error={error} success={success} />
      
      <AccountHeader
        firebaseUser={firebaseUser}
        dbUser={dbUser}
        onLogout={handleLogout}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <h1 className="sr-only">Account Settings</h1>
        <AccountNavigation activeTab={activeTab} onTabChange={handleTabChange} />

        <div className="mt-6" role="region" aria-live="polite">
          {activeTab === "profile" && (
            <ProfileTab
              dbUser={dbUser}
              firebaseUser={firebaseUser}
              updateUserProfile={updateUserProfile}
              refreshUser={refreshUser}
              setError={setError}
              setSuccess={setSuccess}
              updating={updating}
              setUpdating={setUpdating}
            />
          )}

          {activeTab === "orders" && <OrdersTab dbUser={dbUser} />}

          {activeTab === "addresses" && (
            <AddressesTab
              dbUser={dbUser}
              firebaseUser={firebaseUser}
              refreshUser={refreshUser}
              setError={setError}
              setSuccess={setSuccess}
              updating={updating}
              setUpdating={setUpdating}
            />
          )}

          {activeTab === "reviews" && (
            <MyReviewsTab firebaseUser={firebaseUser} />
          )}

          {activeTab === "preferences" && (
            <PreferencesTab
              dbUser={dbUser}
              updateUserProfile={updateUserProfile}
              refreshUser={refreshUser}
              setError={setError}
              setSuccess={setSuccess}
              updating={updating}
              setUpdating={setUpdating}
            />
          )}
        </div>
      </main>
    </div>
  );
}