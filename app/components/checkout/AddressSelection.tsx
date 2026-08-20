// app/components/checkout/AddressSelection.tsx - FULLY RESPONSIVE
"use client";

import { useState } from "react";
import { MapPin, CreditCard, Plus, Check } from "lucide-react";
import AddressForm from "./AddressForm";
import SavedAddressList from "./SavedAddressList";

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
  const [showShippingForm, setShowShippingForm] = useState(false);
  const [showBillingForm, setShowBillingForm] = useState(false);

  const shippingAddresses = savedAddresses.filter(
    (addr) => addr.type === "shipping",
  );
  const billingAddresses = savedAddresses.filter(
    (addr) => addr.type === "billing",
  );

  const handleSelectShippingAddress = (address: any) => {
    onShippingChange({
      full_name: address.full_name,
      phone: address.phone,
      line1: address.line1,
      line2: address.line2 || "",
      city: address.city,
      state: address.state,
      postal_code: address.postal_code,
      country: address.country,
    });
    setShowShippingForm(false);
  };

  const handleSelectBillingAddress = (address: any) => {
    onBillingChange({
      full_name: address.full_name,
      phone: address.phone,
      line1: address.line1,
      line2: address.line2 || "",
      city: address.city,
      state: address.state,
      postal_code: address.postal_code,
      country: address.country,
    });
    setShowBillingForm(false);
  };

  const handleShippingFormSubmit = (data: any) => {
    onShippingChange(data);
    setShowShippingForm(false);
  };

  const handleBillingFormSubmit = (data: any) => {
    onBillingChange(data);
    setShowBillingForm(false);
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Shipping Address */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
        <div className="px-3 sm:px-4 md:px-5 py-2.5 sm:py-3 md:py-4 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white flex items-center gap-1.5 sm:gap-2">
            <MapPin className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
            Shipping Address
          </h3>
        </div>

        <div className="p-3 sm:p-4 md:p-5">
          {shippingAddress && !showShippingForm ? (
            <div className="p-3 sm:p-3.5 md:p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
              <div className="flex items-start justify-between mb-1.5 sm:mb-2 gap-2">
                <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
                  <Check className="w-4 h-4 sm:w-[18px] sm:h-[18px] flex-shrink-0 text-blue-600 dark:text-blue-400" aria-hidden="true"/>
                  <p className="font-semibold text-gray-900 dark:text-white text-xs sm:text-sm md:text-base truncate">
                    {shippingAddress.full_name}
                  </p>
                </div>
                <button
                  onClick={() => setShowShippingForm(true)}
                  aria-label="Change shipping address"
                  className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 hover:underline flex-shrink-0 active:scale-95"
                >
                  Change
                </button>
              </div>
              <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 ml-5 sm:ml-6 md:ml-7 leading-relaxed">
                {shippingAddress.line1}
                {shippingAddress.line2 && `, ${shippingAddress.line2}`}
                <br />
                {shippingAddress.city}, {shippingAddress.state}{" "}
                {shippingAddress.postal_code}
                <br />
                {shippingAddress.country}
                <br />
                <span className="text-gray-600 dark:text-gray-400">
                  {shippingAddress.phone}
                </span>
              </p>
            </div>
          ) : (
            <>
              <SavedAddressList
                addresses={shippingAddresses}
                onSelect={handleSelectShippingAddress}
              />

              {!showShippingForm ? (
                <button
                  onClick={() => setShowShippingForm(true)}
                  className="flex items-center gap-1.5 sm:gap-2 text-blue-600 dark:text-blue-400 hover:underline text-xs sm:text-sm font-medium active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4"/>
                  Add New Address
                </button>
              ) : (
                <AddressForm
                  type="shipping"
                  onSubmit={handleShippingFormSubmit}
                  onCancel={() => setShowShippingForm(false)}
                />
              )}
            </>
          )}
        </div>
      </div>

      {/* Billing Address */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
        <div className="px-3 sm:px-4 md:px-5 py-2.5 sm:py-3 md:py-4 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white flex items-center gap-1.5 sm:gap-2">
            <CreditCard className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
            Billing Address
          </h3>
        </div>

        <div className="p-3 sm:p-4 md:p-5">
          <label className="flex items-center gap-2 sm:gap-2.5 md:gap-3 p-2.5 sm:p-3 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors mb-3 sm:mb-4 active:scale-[0.98]">
            <input
              type="checkbox"
              checked={sameAsShipping}
              onChange={(e) => {
                onSameAsShippingChange(e.target.checked);
                setShowBillingForm(false);
              }}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 flex-shrink-0"
            />
            <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
              Same as shipping address
            </span>
          </label>

          {!sameAsShipping && (
            <>
              {billingAddress && !showBillingForm ? (
                <div className="p-3 sm:p-3.5 md:p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
                  <div className="flex items-start justify-between mb-1.5 sm:mb-2 gap-2">
                    <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
                      <Check className="w-4 h-4 sm:w-[18px] sm:h-[18px] flex-shrink-0 text-blue-600 dark:text-blue-400" />
                      <p className="font-semibold text-gray-900 dark:text-white text-xs sm:text-sm md:text-base truncate">
                        {billingAddress.full_name}
                      </p>
                    </div>
                    <button
                      aria-label="Change billing address"
                      onClick={() => setShowBillingForm(true)}
                      className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 hover:underline flex-shrink-0 active:scale-95"
                    >
                      Change
                    </button>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 ml-5 sm:ml-6 md:ml-7 leading-relaxed">
                    {billingAddress.line1}
                    {billingAddress.line2 && `, ${billingAddress.line2}`}
                    <br />
                    {billingAddress.city}, {billingAddress.state}{" "}
                    {billingAddress.postal_code}
                    <br />
                    {billingAddress.country}
                    <br />
                    <span className="text-gray-600 dark:text-gray-400">
                      {billingAddress.phone}
                    </span>
                  </p>
                </div>
              ) : (
                <>
                  <SavedAddressList
                    addresses={billingAddresses}
                    onSelect={handleSelectBillingAddress}
                  />

                  {!showBillingForm ? (
                    <button
                      onClick={() => setShowBillingForm(true)}
                      className="flex items-center gap-1.5 sm:gap-2 text-blue-600 dark:text-blue-400 hover:underline text-xs sm:text-sm font-medium active:scale-95"
                    >
                      <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      Add New Address
                    </button>
                  ) : (
                    <AddressForm
                      type="billing"
                      onSubmit={handleBillingFormSubmit}
                      onCancel={() => setShowBillingForm(false)}
                    />
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
