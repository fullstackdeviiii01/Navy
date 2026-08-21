// // app/(public)/pages/AccountPage.tsx
"use client";

import { useState, useEffect } from "react";
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

// Wrapper that provides getIdToken() using localStorage token
// This keeps child components working without changes
function useAuthUser(authUser) {
  if (!authUser) return null;
  return {
    ...authUser,
    getIdToken: async () => localStorage.getItem("auth_token"),
    get displayName() { return authUser.name; },
    get email() { return authUser.email; },
    get photoURL() { return authUser.avatar_url || null; },
    get emailVerified() { return authUser.email_verified; },
  };
}

export default function AccountPage() {
  const {
    user: dbUser,
    authUser,
    loading: userLoading,
    refreshUser,
    updateUserProfile,
    logout,
  } = useUser();

  const router = useRouter();
  const searchParams = useSearchParams();
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  const activeTab = searchParams.get("tab") || "profile";
  const userWrapper = useAuthUser(authUser);

  useEffect(() => {
    if (!userLoading && !authUser) {
      router.push("/sign-in");
    }
  }, [authUser, userLoading, router]);

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
      await logout();
      router.push("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-theme-bg-light dark:bg-theme-bg-dark">
        <Loader />
      </div>
    );
  }

  if (!authUser) {
    return null;
  }

  return (
    <div className="min-h-screen bg-theme-bg-light dark:bg-theme-bg-dark">
      <NotificationBanner error={error} success={success} />
      
      <AccountHeader
        authUser={userWrapper}
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
              authUser={userWrapper}
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
              authUser={userWrapper}
              refreshUser={refreshUser}
              setError={setError}
              setSuccess={setSuccess}
              updating={updating}
              setUpdating={setUpdating}
            />
          )}

          {activeTab === "reviews" && (
            <MyReviewsTab authUser={userWrapper} />
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