// app/components/checkout/AddressSelection.tsx
"use client";

import { useState } from "react";
import { MapPin, CreditCard, Edit2 } from "lucide-react";
import AddressForm from "./AddressForm";

interface AddressSelectionProps {
  shippingAddress: any;
  billingAddress: any;
  sameAsShipping: boolean;
  onShippingChange: (address: any) => void;
  onBillingChange: (address: any) => void;
  onSameAsShippingChange: (value: boolean) => void;
  savedAddresses: any[];
}

export default function AddressSelection({
  shippingAddress,
  billingAddress,
  sameAsShipping,
  onShippingChange,
  onBillingChange,
  onSameAsShippingChange,
  savedAddresses,
}: AddressSelectionProps) {
  const [showShippingForm, setShowShippingForm] = useState(
    !shippingAddress || !shippingAddress.line1
  );
  const [showBillingForm, setShowBillingForm] = useState(
    !sameAsShipping && (!billingAddress || !billingAddress.line1)
  );

  const handleShippingSubmit = (data: any) => {
    onShippingChange(data);
    setShowShippingForm(false);
  };

  const handleBillingSubmit = (data: any) => {
    onBillingChange(data);
    setShowBillingForm(false);
  };

  return (
    <div className="space-y-4">
      {/* ── 1. Shipping Address ────────────────────────────────────────── */}
      <div className="bg-theme-surface-light dark:bg-theme-surface-dark border border-theme-border-light dark:border-theme-border-dark overflow-hidden">
        <div className="px-4 py-3 bg-[#E9DFCE]/40 dark:bg-[#48381A]/40 border-b border-theme-border-light dark:border-theme-border-dark flex items-center justify-between">
          <h3 className="text-xs sm:text-sm font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark uppercase tracking-wider flex items-center gap-2">
            <MapPin size={16} className="text-[#A8752B]" />
            Shipping Destination
          </h3>
          {shippingAddress?.line1 && !showShippingForm && (
            <button
              onClick={() => setShowShippingForm(true)}
              className="text-xs text-[#A8752B] hover:underline flex items-center gap-1 uppercase tracking-wider font-semibold"
            >
              <Edit2 size={12} />
              Change
            </button>
          )}
        </div>

        <div className="p-4 sm:p-5">
          {shippingAddress?.line1 && !showShippingForm ? (
            <div className="space-y-1.5 text-xs sm:text-sm text-theme-text-primary-light dark:text-theme-text-primary-dark">
              <p className="font-semibold text-base">
                {shippingAddress.full_name}
              </p>
              <p className="text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
                {shippingAddress.line1}
                {shippingAddress.line2 ? `, ${shippingAddress.line2}` : ""}
              </p>
              <p className="text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
                {shippingAddress.city}, {shippingAddress.state}{" "}
                {shippingAddress.postal_code}
              </p>
              <p className="text-[#A8752B] font-semibold uppercase text-xs">
                {shippingAddress.country || "Pakistan"}
              </p>
              {shippingAddress.phone && (
                <p className="text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark pt-1">
                  📞 {shippingAddress.phone}
                </p>
              )}
            </div>
          ) : (
            <AddressForm
              type="shipping"
              initialData={shippingAddress}
              onSubmit={handleShippingSubmit}
              onCancel={
                shippingAddress?.line1
                  ? () => setShowShippingForm(false)
                  : undefined
              }
            />
          )}
        </div>
      </div>

      {/* ── 2. Billing Address ─────────────────────────────────────────── */}
      <div className="bg-theme-surface-light dark:bg-theme-surface-dark border border-theme-border-light dark:border-theme-border-dark overflow-hidden">
        <div className="px-4 py-3 bg-[#E9DFCE]/40 dark:bg-[#48381A]/40 border-b border-theme-border-light dark:border-theme-border-dark">
          <h3 className="text-xs sm:text-sm font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark uppercase tracking-wider flex items-center gap-2">
            <CreditCard size={16} className="text-[#A8752B]" />
            Billing Details
          </h3>
        </div>

        <div className="p-4 sm:p-5 space-y-4">
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={sameAsShipping}
              onChange={(e) => {
                const checked = e.target.checked;
                onSameAsShippingChange(checked);
                if (checked) {
                  onBillingChange(shippingAddress);
                } else {
                  setShowBillingForm(true);
                }
              }}
              className="w-4 h-4 accent-[#A8752B]"
            />
            <span className="text-xs sm:text-sm font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark">
              Billing address is same as shipping address
            </span>
          </label>

          {!sameAsShipping && (
            <div className="pt-3 border-t border-theme-border-light dark:border-theme-border-dark">
              {billingAddress?.line1 && !showBillingForm ? (
                <div className="space-y-1.5 text-xs sm:text-sm text-theme-text-primary-light dark:text-theme-text-primary-dark">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold text-base">
                      {billingAddress.full_name}
                    </p>
                    <button
                      onClick={() => setShowBillingForm(true)}
                      className="text-xs text-[#A8752B] hover:underline flex items-center gap-1 uppercase tracking-wider font-semibold"
                    >
                      <Edit2 size={12} />
                      Change
                    </button>
                  </div>
                  <p className="text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
                    {billingAddress.line1}
                    {billingAddress.line2 ? `, ${billingAddress.line2}` : ""}
                  </p>
                  <p className="text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
                    {billingAddress.city}, {billingAddress.state}{" "}
                    {billingAddress.postal_code}
                  </p>
                  <p className="text-[#A8752B] font-semibold uppercase text-xs">
                    {billingAddress.country || "Pakistan"}
                  </p>
                </div>
              ) : (
                <AddressForm
                  type="billing"
                  initialData={billingAddress}
                  onSubmit={handleBillingSubmit}
                  onCancel={
                    billingAddress?.line1
                      ? () => setShowBillingForm(false)
                      : undefined
                  }
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
