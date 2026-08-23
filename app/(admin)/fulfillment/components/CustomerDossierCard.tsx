// app/(admin)/fulfillment/components/CustomerDossierCard.tsx
"use client";

import { User, Mail, Phone, MapPin } from "lucide-react";

interface CustomerDossierCardProps {
  order: any;
}

export default function CustomerDossierCard({ order }: CustomerDossierCardProps) {
  const customerName =
    order.user_id?.name || order.guest_info?.name || "Customer";
  const customerEmail =
    order.user_id?.email || order.guest_info?.email || "No email";
  const customerPhone =
    order.shipping_address?.phone ||
    order.guest_info?.phone ||
    order.user_id?.phone ||
    "No contact number";

  const shipping = order.shipping_address;
  const billing = order.billing_address || shipping;

  return (
    <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-xl border border-theme-border-light dark:border-theme-border-dark p-4 sm:p-5 space-y-4 shadow-xs">
      <div className="border-b border-theme-border-light dark:border-theme-border-dark pb-3">
        <h3 className="text-sm font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark flex items-center gap-2">
          <User className="w-4 h-4 text-theme-hover-light" />
          <span>Customer & Delivery Details</span>
        </h3>
      </div>

      {/* Customer Contact */}
      <div className="space-y-2 text-xs">
        <p className="font-bold text-sm text-theme-text-primary-light dark:text-theme-text-primary-dark">
          {customerName}
        </p>

        <div className="flex items-center gap-2 text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
          <Mail className="w-3.5 h-3.5 text-theme-text-muted-light" />
          <span>{customerEmail}</span>
        </div>

        <div className="flex items-center gap-2 text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
          <Phone className="w-3.5 h-3.5 text-theme-text-muted-light" />
          <span>{customerPhone}</span>
        </div>
      </div>

      {/* Addresses Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-theme-border-light/60 dark:border-theme-border-dark/60 text-xs">
        {/* Shipping Address */}
        <div className="p-3 rounded-lg bg-theme-bg-light/60 dark:bg-theme-bg-dark/40 border border-theme-border-light/60 dark:border-theme-border-dark/60 space-y-1">
          <div className="flex items-center gap-1.5 font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark mb-1">
            <MapPin className="w-3 h-3 text-indigo-500" />
            <span>Shipping Address</span>
          </div>
          {shipping ? (
            <div className="text-theme-text-secondary-light dark:text-theme-text-secondary-dark leading-relaxed">
              <p>{shipping.street_address}</p>
              {shipping.apartment && <p>{shipping.apartment}</p>}
              <p>
                {shipping.city}, {shipping.state} {shipping.postal_code}
              </p>
              <p>{shipping.country}</p>
            </div>
          ) : (
            <p className="text-theme-text-muted-light">No address recorded</p>
          )}
        </div>

        {/* Billing Address */}
        <div className="p-3 rounded-lg bg-theme-bg-light/60 dark:bg-theme-bg-dark/40 border border-theme-border-light/60 dark:border-theme-border-dark/60 space-y-1">
          <div className="flex items-center gap-1.5 font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark mb-1">
            <MapPin className="w-3 h-3 text-purple-500" />
            <span>Billing Address</span>
          </div>
          {billing ? (
            <div className="text-theme-text-secondary-light dark:text-theme-text-secondary-dark leading-relaxed">
              <p>{billing.street_address}</p>
              {billing.apartment && <p>{billing.apartment}</p>}
              <p>
                {billing.city}, {billing.state} {billing.postal_code}
              </p>
              <p>{billing.country}</p>
            </div>
          ) : (
            <p className="text-theme-text-muted-light">Same as shipping</p>
          )}
        </div>
      </div>
    </div>
  );
}
