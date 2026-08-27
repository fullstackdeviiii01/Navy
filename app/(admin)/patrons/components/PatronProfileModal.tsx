// app/(admin)/patrons/components/PatronProfileModal.tsx
"use client";

import { useState } from "react";
import {
  X,
  Mail,
  Phone,
  MapPin,
  ShoppingBag,
  Heart,
  Calendar,
  DollarSign,
  Shield,
  Clock,
} from "lucide-react";

interface Customer {
  _id: string;
  uid: string;
  email: string;
  name: string;
  phone?: string;
  role: string;
  is_active: boolean;
  is_banned: boolean;
  order_count: number;
  total_spent: number;
  customer_since: string;
  last_login_at: string;
  addresses: any[];
  cart: any[];
  wishlist: any[];
  preferred_currency?: string;
  marketing_opt_in?: boolean;
  isGuest?: boolean;
}

interface PatronProfileModalProps {
  customer: Customer;
  onClose: () => void;
  onUpdate: () => void;
}

export default function PatronProfileModal({
  customer,
  onClose,
  onUpdate,
}: PatronProfileModalProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "addresses" | "curation">("overview");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-theme-surface-light dark:bg-theme-surface-dark w-full max-w-3xl max-h-[90vh] rounded-2xl border border-theme-border-light dark:border-theme-border-dark shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-theme-border-light dark:border-theme-border-dark shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-800 dark:text-neutral-200 text-lg font-bold">
              {customer.name ? customer.name.charAt(0).toUpperCase() : "C"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
                  {customer.name || "Customer"}
                </h2>
                <span
                  className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                    customer.isGuest
                      ? "bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300"
                      : "bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300"
                  }`}
                >
                  {customer.isGuest ? "Guest Customer" : "Registered Customer"}
                </span>
              </div>
              <p className="text-xs text-theme-text-muted-light mt-0.5">
                {customer.email}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-theme-text-muted-light hover:text-theme-text-primary-light rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-theme-border-light dark:border-theme-border-dark px-5 gap-4 shrink-0 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            className={`py-3 font-semibold border-b-2 transition-colors ${
              activeTab === "overview"
                ? "border-neutral-900 text-neutral-900 dark:border-neutral-100 dark:text-white"
                : "border-transparent text-theme-text-secondary-light hover:text-theme-text-primary-light"
            }`}
          >
            Customer Overview
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("addresses")}
            className={`py-3 font-semibold border-b-2 transition-colors ${
              activeTab === "addresses"
                ? "border-neutral-900 text-neutral-900 dark:border-neutral-100 dark:text-white"
                : "border-transparent text-theme-text-secondary-light hover:text-theme-text-primary-light"
            }`}
          >
            Addresses ({customer.addresses?.length || 0})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("curation")}
            className={`py-3 font-semibold border-b-2 transition-colors ${
              activeTab === "curation"
                ? "border-neutral-900 text-neutral-900 dark:border-neutral-100 dark:text-white"
                : "border-transparent text-theme-text-secondary-light hover:text-theme-text-primary-light"
            }`}
          >
            Wishlist & Cart ({ (customer.wishlist?.length || 0) + (customer.cart?.length || 0) })
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1 text-xs">
          {activeTab === "overview" && (
            <div className="space-y-4">
              {/* Financial & Activity Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl border border-theme-border-light dark:border-theme-border-dark bg-theme-bg-light/60 dark:bg-theme-bg-dark/40 space-y-1">
                  <span className="text-[10px] uppercase text-theme-text-muted-light font-semibold">
                    Total Spent
                  </span>
                  <p className="text-base font-bold text-theme-text-primary-light dark:text-theme-text-primary-dark">
                    Rs. {customer.total_spent?.toLocaleString() || "0"}
                  </p>
                </div>

                <div className="p-3 rounded-xl border border-theme-border-light dark:border-theme-border-dark bg-theme-bg-light/60 dark:bg-theme-bg-dark/40 space-y-1">
                  <span className="text-[10px] uppercase text-theme-text-muted-light font-semibold">
                    Orders Placed
                  </span>
                  <p className="text-base font-bold text-theme-text-primary-light dark:text-theme-text-primary-dark">
                    {customer.order_count || 0} Orders
                  </p>
                </div>

                <div className="p-3 rounded-xl border border-theme-border-light dark:border-theme-border-dark bg-theme-bg-light/60 dark:bg-theme-bg-dark/40 space-y-1">
                  <span className="text-[10px] uppercase text-theme-text-muted-light font-semibold">
                    Joined Date
                  </span>
                  <p className="text-xs font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
                    {customer.customer_since
                      ? new Date(customer.customer_since).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>

                <div className="p-3 rounded-xl border border-theme-border-light dark:border-theme-border-dark bg-theme-bg-light/60 dark:bg-theme-bg-dark/40 space-y-1">
                  <span className="text-[10px] uppercase text-theme-text-muted-light font-semibold">
                    Last Visit
                  </span>
                  <p className="text-xs font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
                    {customer.last_login_at
                      ? new Date(customer.last_login_at).toLocaleDateString()
                      : "Recent"}
                  </p>
                </div>
              </div>

              {/* Contact Details */}
              <div className="p-4 rounded-xl border border-theme-border-light dark:border-theme-border-dark bg-theme-bg-light/40 dark:bg-theme-bg-dark/20 space-y-2">
                <h4 className="font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
                  Contact Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-theme-text-muted-light" />
                    <span>{customer.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-theme-text-muted-light" />
                    <span>{customer.phone || "No phone listed"}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "addresses" && (
            <div className="space-y-3">
              {customer.addresses && customer.addresses.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {customer.addresses.map((addr: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl border border-theme-border-light dark:border-theme-border-dark bg-theme-bg-light/60 dark:bg-theme-bg-dark/40 space-y-1 text-xs"
                    >
                      <div className="flex items-center justify-between font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark mb-1">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-indigo-500" />
                          <span>Address #{idx + 1}</span>
                        </span>
                        {addr.is_default && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 font-bold">
                            Default
                          </span>
                        )}
                      </div>
                      <p>{addr.street_address}</p>
                      {addr.apartment && <p>{addr.apartment}</p>}
                      <p>
                        {addr.city}, {addr.state} {addr.postal_code}
                      </p>
                      <p>{addr.country}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-theme-text-muted-light">
                  No saved addresses found for this customer.
                </div>
              )}
            </div>
          )}

          {activeTab === "curation" && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Active Cart */}
                <div className="p-3.5 rounded-xl border border-theme-border-light dark:border-theme-border-dark bg-theme-bg-light/60 dark:bg-theme-bg-dark/40 space-y-2">
                  <h4 className="font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark flex items-center gap-1.5">
                    <ShoppingBag className="w-3.5 h-3.5 text-blue-500" />
                    <span>Shopping Cart ({customer.cart?.length || 0})</span>
                  </h4>
                  {customer.cart && customer.cart.length > 0 ? (
                    <div className="space-y-1.5">
                      {customer.cart.map((item: any, i: number) => (
                        <div key={i} className="text-[11px] p-2 bg-theme-surface-light dark:bg-theme-surface-dark rounded-lg flex justify-between">
                          <span className="truncate">{item.name || `Item #${i+1}`}</span>
                          <span className="font-semibold">Qty: {item.quantity || 1}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-theme-text-muted-light text-[11px]">Cart is empty.</p>
                  )}
                </div>

                {/* Wishlist */}
                <div className="p-3.5 rounded-xl border border-theme-border-light dark:border-theme-border-dark bg-theme-bg-light/60 dark:bg-theme-bg-dark/40 space-y-2">
                  <h4 className="font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark flex items-center gap-1.5">
                    <Heart className="w-3.5 h-3.5 text-rose-500" />
                    <span>Saved Wishlist ({customer.wishlist?.length || 0})</span>
                  </h4>
                  {customer.wishlist && customer.wishlist.length > 0 ? (
                    <div className="space-y-1.5">
                      {customer.wishlist.map((item: any, i: number) => (
                        <div key={i} className="text-[11px] p-2 bg-theme-surface-light dark:bg-theme-surface-dark rounded-lg flex justify-between">
                          <span className="truncate">{item.name || `Product #${i+1}`}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-theme-text-muted-light text-[11px]">No wishlist items saved.</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-theme-border-light dark:border-theme-border-dark flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-neutral-100 dark:hover:bg-neutral-200 dark:text-neutral-900 text-xs font-semibold rounded-lg shadow-xs hover:shadow active:scale-[0.99] transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
