// app/(public)/pages/AccountPage.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  User,
  Lock,
  Shield,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { useUser } from "../../context/UserContext.js";
import OrdersTab from "../../components/account/OrdersTab";
import AddressesTab from "../../components/account/AddressesTab";
import Loader from "../../components/shared/Loader";
import Link from "next/link";
import { formatPrice } from "../../../lib/utils/formatPrice";

export default function AccountPage() {
  const {
    user: dbUser,
    authUser,
    loading: userLoading,
    refreshUser,
    updateUserProfile,
    isAdmin,
    logout,
  } = useUser();

  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [activeTab, setActiveTab] = useState("overview");
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Profile Form state
  const [profileForm, setProfileForm] = useState({
    name: "",
    phone: "",
  });

  // Password Form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam) {
      if (tabParam === "profile" || tabParam === "details") setActiveTab("details");
      else if (tabParam === "orders") setActiveTab("orders");
      else if (tabParam === "security") setActiveTab("security");
      else setActiveTab("overview");
    }
  }, [searchParams]);

  useEffect(() => {
    if (!userLoading && !authUser) {
      router.push("/sign-in");
    }
  }, [authUser, userLoading, router]);

  useEffect(() => {
    if (dbUser || authUser) {
      setProfileForm({
        name: dbUser?.name || authUser?.name || "",
        phone: dbUser?.phone || "",
      });
    }
  }, [dbUser, authUser]);

  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError("");
        setSuccess("");
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    router.push(`/account?tab=${tabId}`, { scroll: false });
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/sign-in");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    setError("");
    setSuccess("");

    try {
      const res = await updateUserProfile({
        name: profileForm.name,
        phone: profileForm.phone,
      });
      if (res.success) {
        setSuccess("Profile details saved successfully.");
        await refreshUser();
      } else {
        throw new Error(res.error || "Failed to update profile");
      }
    } catch (err: any) {
      setError(err.message || "Failed to update profile");
    } finally {
      setUpdating(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }

    setPasswordLoading(true);
    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          current_password: passwordForm.currentPassword,
          new_password: passwordForm.newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update password");
      }

      setSuccess("Password updated successfully.");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err: any) {
      setError(err.message || "Failed to update password");
    } finally {
      setPasswordLoading(false);
    }
  };

  if (userLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-[#2B1F0E]">
        <Loader />
      </div>
    );
  }

  if (!authUser) return null;

  const userName = dbUser?.name || authUser?.name || "Member";
  const userEmail = dbUser?.email || authUser?.email || "";

  // Dynamic header titles per tab
  const getHeaderInfo = () => {
    switch (activeTab) {
      case "orders":
        return {
          title: "Order ",
          italic: "history",
          subtitle: "Track and review every purchase you've made.",
        };
      case "details":
        return {
          title: "Profile ",
          italic: "details",
          subtitle: "Your contact information and default shipping address.",
        };
      case "security":
        return {
          title: "Account ",
          italic: "security",
          subtitle: "Keep your account safe by updating your password.",
        };
      case "overview":
      default:
        return {
          title: `Hello, ${userName.split(" ")[0]}.`,
          italic: "",
          subtitle: "Manage your orders, details and saved pieces.",
        };
    }
  };

  const headerInfo = getHeaderInfo();

  return (
    <div className="min-h-screen bg-[#2B1F0E] text-[#F3EBDC] pb-24">
      {/* Toast Notifications */}
      {error && (
        <div className="fixed top-20 right-4 sm:right-8 z-50 bg-red-900/90 border border-red-700 text-red-100 px-5 py-3 shadow-2xl text-xs uppercase tracking-wider animate-in fade-in slide-in-from-top-2">
          {error}
        </div>
      )}
      {success && (
        <div className="fixed top-20 right-4 sm:right-8 z-50 bg-[#1D2A18] border border-[#486337] text-green-200 px-5 py-3 shadow-2xl text-xs uppercase tracking-wider animate-in fade-in slide-in-from-top-2">
          {success}
        </div>
      )}

      {/* Top Banner Header Section */}
      <div className="border-b border-[#3D2C15] bg-[#241B0E]/60 pt-10 sm:pt-14 pb-8 sm:pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <p className="text-[11px] font-medium tracking-[0.25em] uppercase text-[#D4A359] mb-2">
            MY ACCOUNT
          </p>
          <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif text-[#F3EBDC] leading-tight">
              {headerInfo.title}
              {headerInfo.italic && (
                <span className="italic font-light text-[#D4A359]">
                  {headerInfo.italic}
                </span>
              )}
            </h1>
            {activeTab === "orders" && (
              <div className="text-right">
                <span className="text-2xl font-serif text-[#D4A359]">
                  {dbUser?.order_count || 0}
                </span>
                <span className="block text-[10px] tracking-[0.2em] uppercase text-[#D7D3CF]/60">
                  {dbUser?.order_count === 1 ? "ORDER" : "ORDERS"}
                </span>
              </div>
            )}
          </div>
          <p className="text-xs sm:text-sm text-[#D7D3CF]/70 mt-2 tracking-wide max-w-xl">
            {headerInfo.subtitle}
          </p>
        </div>
      </div>

      {/* Main Layout Grid: Navigation & Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 pt-6 sm:pt-10">
        
        {/* MOBILE NAVIGATION: Sticky horizontal bar always in display */}
        <div className="lg:hidden sticky top-16 sm:top-20 z-30 bg-[#241B0E] border-b border-[#3D2C15] -mx-4 sm:-mx-6 px-4 sm:px-6 mb-6 shadow-md">
          <nav className="flex items-center overflow-x-auto scrollbar-hide py-2 gap-2 text-xs">
            <button
              onClick={() => handleTabClick("overview")}
              className={`flex items-center gap-2 px-3.5 py-2 whitespace-nowrap uppercase tracking-[0.14em] font-medium text-[11px] border transition-colors ${
                activeTab === "overview"
                  ? "bg-[#2E200F] text-[#F3EBDC] border-[#D4A359]"
                  : "bg-[#1C1307] text-[#D7D3CF]/70 border-[#3D2C15] hover:text-[#F3EBDC]"
              }`}
            >
              <LayoutDashboard size={13} className={activeTab === "overview" ? "text-[#D4A359]" : "text-[#D7D3CF]/50"} />
              <span>Overview</span>
            </button>

            <button
              onClick={() => handleTabClick("orders")}
              className={`flex items-center gap-2 px-3.5 py-2 whitespace-nowrap uppercase tracking-[0.14em] font-medium text-[11px] border transition-colors ${
                activeTab === "orders"
                  ? "bg-[#2E200F] text-[#F3EBDC] border-[#D4A359]"
                  : "bg-[#1C1307] text-[#D7D3CF]/70 border-[#3D2C15] hover:text-[#F3EBDC]"
              }`}
            >
              <ShoppingBag size={13} className={activeTab === "orders" ? "text-[#D4A359]" : "text-[#D7D3CF]/50"} />
              <span>Orders</span>
            </button>

            <button
              onClick={() => handleTabClick("details")}
              className={`flex items-center gap-2 px-3.5 py-2 whitespace-nowrap uppercase tracking-[0.14em] font-medium text-[11px] border transition-colors ${
                activeTab === "details"
                  ? "bg-[#2E200F] text-[#F3EBDC] border-[#D4A359]"
                  : "bg-[#1C1307] text-[#D7D3CF]/70 border-[#3D2C15] hover:text-[#F3EBDC]"
              }`}
            >
              <User size={13} className={activeTab === "details" ? "text-[#D4A359]" : "text-[#D7D3CF]/50"} />
              <span>Account Details</span>
            </button>

            <button
              onClick={() => handleTabClick("security")}
              className={`flex items-center gap-2 px-3.5 py-2 whitespace-nowrap uppercase tracking-[0.14em] font-medium text-[11px] border transition-colors ${
                activeTab === "security"
                  ? "bg-[#2E200F] text-[#F3EBDC] border-[#D4A359]"
                  : "bg-[#1C1307] text-[#D7D3CF]/70 border-[#3D2C15] hover:text-[#F3EBDC]"
              }`}
            >
              <Lock size={13} className={activeTab === "security" ? "text-[#D4A359]" : "text-[#D7D3CF]/50"} />
              <span>Security</span>
            </button>

            {isAdmin && isAdmin() && (
              <a
                href="/admin/dashboard"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3.5 py-2 whitespace-nowrap uppercase tracking-[0.14em] font-medium text-[11px] bg-[#1C1307] border border-[#D4A359]/60 text-[#D4A359]"
              >
                <Shield size={13} />
                <span>Admin</span>
              </a>
            )}

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3.5 py-2 whitespace-nowrap uppercase tracking-[0.14em] font-medium text-[11px] bg-[#1C1307] border border-[#3D2C15] text-red-400/80 hover:text-red-300"
            >
              <LogOut size={13} />
              <span>Sign Out</span>
            </button>
          </nav>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* DESKTOP Left Navigation Sidebar */}
          <aside className="hidden lg:block lg:col-span-4 xl:col-span-3 bg-[#201509] border border-[#3D2C15] p-3 sticky top-28 shadow-xl">
            <nav className="space-y-1">
              {/* 1. Overview */}
              <button
                onClick={() => handleTabClick("overview")}
                className={`w-full flex items-center gap-3 px-4 py-3.5 text-[12px] xl:text-[13px] font-medium tracking-[0.16em] uppercase transition-all duration-200 ${
                  activeTab === "overview"
                    ? "bg-[#2E200F] text-[#F3EBDC] border-l-[3px] border-[#D4A359]"
                    : "text-[#D7D3CF]/70 hover:text-[#F3EBDC] hover:bg-[#2A1D0E]"
                }`}
              >
                <LayoutDashboard size={16} className={activeTab === "overview" ? "text-[#D4A359]" : "text-[#D7D3CF]/50"} />
                <span>OVERVIEW</span>
              </button>

              {/* 2. Orders */}
              <button
                onClick={() => handleTabClick("orders")}
                className={`w-full flex items-center gap-3 px-4 py-3.5 text-[12px] xl:text-[13px] font-medium tracking-[0.16em] uppercase transition-all duration-200 ${
                  activeTab === "orders"
                    ? "bg-[#2E200F] text-[#F3EBDC] border-l-[3px] border-[#D4A359]"
                    : "text-[#D7D3CF]/70 hover:text-[#F3EBDC] hover:bg-[#2A1D0E]"
                }`}
              >
                <ShoppingBag size={16} className={activeTab === "orders" ? "text-[#D4A359]" : "text-[#D7D3CF]/50"} />
                <span>ORDERS</span>
              </button>

              {/* 3. Account Details */}
              <button
                onClick={() => handleTabClick("details")}
                className={`w-full flex items-center gap-3 px-4 py-3.5 text-[12px] xl:text-[13px] font-medium tracking-[0.16em] uppercase transition-all duration-200 ${
                  activeTab === "details"
                    ? "bg-[#2E200F] text-[#F3EBDC] border-l-[3px] border-[#D4A359]"
                    : "text-[#D7D3CF]/70 hover:text-[#F3EBDC] hover:bg-[#2A1D0E]"
                }`}
              >
                <User size={16} className={activeTab === "details" ? "text-[#D4A359]" : "text-[#D7D3CF]/50"} />
                <span>ACCOUNT DETAILS</span>
              </button>

              {/* 4. Security */}
              <button
                onClick={() => handleTabClick("security")}
                className={`w-full flex items-center gap-3 px-4 py-3.5 text-[12px] xl:text-[13px] font-medium tracking-[0.16em] uppercase transition-all duration-200 ${
                  activeTab === "security"
                    ? "bg-[#2E200F] text-[#F3EBDC] border-l-[3px] border-[#D4A359]"
                    : "text-[#D7D3CF]/70 hover:text-[#F3EBDC] hover:bg-[#2A1D0E]"
                }`}
              >
                <Lock size={16} className={activeTab === "security" ? "text-[#D4A359]" : "text-[#D7D3CF]/50"} />
                <span>SECURITY</span>
              </button>

              {/* 5. Admin Panel (If user is Admin) */}
              {isAdmin && isAdmin() && (
                <a
                  href="/admin/dashboard"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-between px-4 py-3.5 text-[12px] xl:text-[13px] font-medium tracking-[0.16em] uppercase text-[#D4A359] hover:bg-[#2A1D0E] transition-colors border-t border-[#3D2C15]/80 mt-2 pt-3"
                >
                  <div className="flex items-center gap-3">
                    <Shield size={16} className="text-[#D4A359]" />
                    <span>ADMIN PANEL</span>
                  </div>
                  <ChevronRight size={14} className="text-[#D4A359]" />
                </a>
              )}

              {/* 6. Sign Out */}
              <div className="border-t border-[#3D2C15]/80 pt-2 mt-2">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-[12px] xl:text-[13px] font-medium tracking-[0.16em] uppercase text-[#D7D3CF]/60 hover:text-red-400 hover:bg-[#2A1D0E] transition-colors"
                >
                  <LogOut size={16} />
                  <span>SIGN OUT</span>
                </button>
              </div>
            </nav>
          </aside>

          {/* Right Main Content Area */}
          <main className="lg:col-span-8 xl:col-span-9">
            
            {/* ── TAB 1: OVERVIEW ───────────────────────────────────────── */}
            {activeTab === "overview" && (
              <div className="space-y-8">
                {/* Stats Overview */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-[#201509] border border-[#3D2C15] p-5">
                    <p className="text-[10px] tracking-[0.2em] uppercase text-[#D7D3CF]/60 mb-1">
                      TOTAL PURCHASES
                    </p>
                    <p className="text-2xl sm:text-3xl font-serif text-[#F3EBDC]">
                      {dbUser?.order_count || 0}
                    </p>
                  </div>
                  <div className="bg-[#201509] border border-[#3D2C15] p-5">
                    <p className="text-[10px] tracking-[0.2em] uppercase text-[#D7D3CF]/60 mb-1">
                      TOTAL EXPENDITURE
                    </p>
                    <p className="text-2xl sm:text-3xl font-serif text-[#D4A359]">
                      {formatPrice(dbUser?.total_spent || 0)}
                    </p>
                  </div>
                  <div className="bg-[#201509] border border-[#3D2C15] p-5">
                    <p className="text-[10px] tracking-[0.2em] uppercase text-[#D7D3CF]/60 mb-1">
                      PATRON STATUS
                    </p>
                    <p className="text-sm font-semibold tracking-wider text-[#F3EBDC] uppercase mt-2">
                      VERIFIED CLIENT
                    </p>
                  </div>
                </div>

                {/* Recent Orders Box */}
                <div className="bg-[#201509] border border-[#3D2C15] p-6 sm:p-8">
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#3D2C15]">
                    <h2 className="text-xl font-serif text-[#F3EBDC]">
                      Recent orders
                    </h2>
                    <button
                      onClick={() => handleTabClick("orders")}
                      className="text-xs uppercase tracking-[0.18em] text-[#D4A359] hover:underline"
                    >
                      View All →
                    </button>
                  </div>

                  {dbUser?.order_count > 0 ? (
                    <OrdersTab dbUser={dbUser} limit={2} />
                  ) : (
                    <div className="text-center py-12 sm:py-16 space-y-4">
                      <p className="text-sm text-[#D7D3CF]/70">
                        You haven't placed any orders yet.
                      </p>
                      <Link
                        href="/products"
                        className="inline-block px-8 py-3.5 bg-[#170E05] hover:bg-[#A8752B] border border-[#3D2C15] text-white text-xs font-semibold tracking-[0.2em] uppercase transition-colors"
                      >
                        Explore the collection
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── TAB 2: ORDERS ─────────────────────────────────────────── */}
            {activeTab === "orders" && (
              <div className="space-y-6">
                <OrdersTab dbUser={dbUser} />
              </div>
            )}

            {/* ── TAB 3: ACCOUNT DETAILS (Profile + Addresses) ────────────── */}
            {activeTab === "details" && (
              <div className="space-y-8">
                {/* 1. Personal Details Form */}
                <div className="bg-[#201509] border border-[#3D2C15] p-6 sm:p-8">
                  <div className="flex items-center gap-3 pb-4 mb-6 border-b border-[#3D2C15]">
                    <User size={18} className="text-[#D4A359]" />
                    <h2 className="text-xs font-semibold tracking-[0.2em] uppercase text-[#F3EBDC]">
                      PERSONAL DETAILS
                    </h2>
                  </div>

                  <form onSubmit={handleProfileSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Full Name */}
                      <div>
                        <label className="block text-[10px] font-semibold tracking-[0.2em] uppercase text-[#D7D3CF]/70 mb-2">
                          FULL NAME
                        </label>
                        <input
                          type="text"
                          value={profileForm.name}
                          onChange={(e) =>
                            setProfileForm({ ...profileForm, name: e.target.value })
                          }
                          required
                          className="w-full bg-[#180F05] border border-[#3D2C15] px-4 py-3 text-sm text-[#F3EBDC] focus:outline-none focus:border-[#D4A359]"
                        />
                      </div>

                      {/* Contact Number */}
                      <div>
                        <label className="block text-[10px] font-semibold tracking-[0.2em] uppercase text-[#D7D3CF]/70 mb-2">
                          CONTACT NUMBER
                        </label>
                        <input
                          type="text"
                          value={profileForm.phone}
                          onChange={(e) =>
                            setProfileForm({ ...profileForm, phone: e.target.value })
                          }
                          placeholder="+92 300 0000000"
                          className="w-full bg-[#180F05] border border-[#3D2C15] px-4 py-3 text-sm text-[#F3EBDC] focus:outline-none focus:border-[#D4A359]"
                        />
                      </div>
                    </div>

                    {/* Email Address (Uneditable) */}
                    <div>
                      <label className="block text-[10px] font-semibold tracking-[0.2em] uppercase text-[#D7D3CF]/70 mb-2">
                        EMAIL ADDRESS <span className="text-[#D7D3CF]/40">(UNEDITABLE)</span>
                      </label>
                      <input
                        type="email"
                        value={userEmail}
                        disabled
                        className="w-full bg-[#150D04] border border-[#3D2C15]/50 px-4 py-3 text-sm text-[#D7D3CF]/50 cursor-not-allowed"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={updating}
                      className="px-8 py-3.5 bg-[#A8752B] hover:bg-[#C08A38] text-white text-xs font-semibold tracking-[0.2em] uppercase transition-colors disabled:opacity-50"
                    >
                      {updating ? "Saving Changes..." : "Save Details"}
                    </button>
                  </form>
                </div>

                {/* 2. Embedded Saved Addresses Section */}
                <div className="bg-[#201509] border border-[#3D2C15] p-6 sm:p-8">
                  <AddressesTab
                    dbUser={dbUser}
                    authUser={authUser}
                    refreshUser={refreshUser}
                    setError={setError}
                    setSuccess={setSuccess}
                    updating={updating}
                    setUpdating={setUpdating}
                  />
                </div>
              </div>
            )}

            {/* ── TAB 4: SECURITY ───────────────────────────────────────── */}
            {activeTab === "security" && (
              <div className="bg-[#201509] border border-[#3D2C15] p-6 sm:p-8 space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-[#3D2C15]">
                  <Lock size={18} className="text-[#D4A359]" />
                  <h2 className="text-xs font-semibold tracking-[0.2em] uppercase text-[#F3EBDC]">
                    PASSWORD CREDENTIALS
                  </h2>
                </div>

                {/* Advisory notice */}
                <div className="bg-[#180F05] border border-[#3D2C15] p-4 text-xs text-[#D7D3CF]/80 leading-relaxed space-y-2">
                  <p>
                    To maintain the integrity of your account, we recommend periodically updating your credentials. Ensure your new password is unique and not shared across other platforms.
                  </p>
                  <p className="text-[10px] tracking-[0.18em] uppercase text-[#D4A359] font-medium">
                    REQUIREMENTS: 6+ CHARACTERS · ALPHANUMERIC RECOMMENDATION
                  </p>
                </div>

                <form onSubmit={handlePasswordSubmit} className="space-y-5 max-w-lg">
                  <div>
                    <label className="block text-[10px] font-semibold tracking-[0.2em] uppercase text-[#D7D3CF]/70 mb-2">
                      CURRENT PASSWORD
                    </label>
                    <input
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={(e) =>
                        setPasswordForm({
                          ...passwordForm,
                          currentPassword: e.target.value,
                        })
                      }
                      required
                      placeholder="••••••••"
                      className="w-full bg-[#180F05] border border-[#3D2C15] px-4 py-3 text-sm text-[#F3EBDC] focus:outline-none focus:border-[#D4A359]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold tracking-[0.2em] uppercase text-[#D7D3CF]/70 mb-2">
                      NEW PASSWORD
                    </label>
                    <input
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) =>
                        setPasswordForm({
                          ...passwordForm,
                          newPassword: e.target.value,
                        })
                      }
                      required
                      placeholder="••••••••"
                      className="w-full bg-[#180F05] border border-[#3D2C15] px-4 py-3 text-sm text-[#F3EBDC] focus:outline-none focus:border-[#D4A359]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold tracking-[0.2em] uppercase text-[#D7D3CF]/70 mb-2">
                      CONFIRM NEW PASSWORD
                    </label>
                    <input
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) =>
                        setPasswordForm({
                          ...passwordForm,
                          confirmPassword: e.target.value,
                        })
                      }
                      required
                      placeholder="••••••••"
                      className="w-full bg-[#180F05] border border-[#3D2C15] px-4 py-3 text-sm text-[#F3EBDC] focus:outline-none focus:border-[#D4A359]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={passwordLoading}
                    className="px-8 py-3.5 bg-[#A8752B] hover:bg-[#C08A38] text-white text-xs font-semibold tracking-[0.2em] uppercase transition-colors disabled:opacity-50"
                  >
                    {passwordLoading ? "Updating Password..." : "Update Password"}
                  </button>
                </form>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}