// // app/(public)/pages/CheckoutPage.tsx - UPDATED WITH EMAIL NOTIFICATION MODAL
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "../../context/UserContext";
import { cartApi } from "../../../lib/api/cart";
import { shippingApi } from "../../../lib/api/shipping";
import GuestInfoForm from "../../components/checkout/GuestInfoForm";
import AddressSelection from "../../components/checkout/AddressSelection";
import ShippingServiceSelector from "../../components/checkout/ShippingServiceSelector";
import OrderSummaryCheckout from "../../components/checkout/OrderSummaryCheckout";
import PaymentSection from "../../components/checkout/PaymentSection";
import EmailNotificationModal from "../../components/checkout/EmailNotificationModal";
import Loader from "../../components/shared/Loader";

export default function CheckoutPage() {
  const { authUser, dbUser, loading: userLoading, refreshCart, updateUserProfile, refreshUser } = useUser();
  const router = useRouter();
  const [cart, setCart] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showPayment, setShowPayment] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);

  const [guestInfo, setGuestInfo] = useState({
    email: "",
    name: "",
    phone: "",
  });
  const [shippingAddress, setShippingAddress] = useState<any>(null);
  const [billingAddress, setBillingAddress] = useState<any>(null);
  const [sameAsShipping, setSameAsShipping] = useState(true);
  const [customerNotes, setCustomerNotes] = useState("");

  const [selectedShippingService, setSelectedShippingService] = useState<string | null>(null);
  const [shippingLoading, setShippingLoading] = useState(false);

  // Ban state
  const [isEmailBanned, setIsEmailBanned] = useState(false);

  const isGuestCheckout = !authUser;

  useEffect(() => {
    if (!userLoading) {
      fetchCart();
      if (dbUser) {
        loadSavedAddresses();
      }
    }
  }, [userLoading, dbUser]);

  const fetchCart = async () => {
    try {
      const data = await cartApi.getCart();
      if (!data.cart || data.cart.items.length === 0) {
        router.push("/cart");
        return;
      }
      setCart(data.cart);

      if (data.cart.selected_shipping_service_id) {
        setSelectedShippingService(
          data.cart.selected_shipping_service_id._id ||
            data.cart.selected_shipping_service_id
        );
      }
    } catch (error) {
      console.error("Failed to fetch cart:", error);
      setError("Failed to load cart");
    } finally {
      setLoading(false);
    }
  };

  const loadSavedAddresses = () => {
    if (dbUser?.addresses) {
      const defaultShipping = dbUser.addresses.find(
        (addr: any) => addr.type === "shipping" && addr.is_default_shipping
      );
      const defaultBilling = dbUser.addresses.find(
        (addr: any) => addr.type === "billing" && addr.is_default_billing
      );

      if (defaultShipping) {
        setShippingAddress({
          full_name: defaultShipping.full_name,
          phone: defaultShipping.phone,
          line1: defaultShipping.line1,
          line2: defaultShipping.line2,
          city: defaultShipping.city,
          state: defaultShipping.state,
          postal_code: defaultShipping.postal_code,
          country: defaultShipping.country,
        });
      }

      if (defaultBilling) {
        setBillingAddress({
          full_name: defaultBilling.full_name,
          phone: defaultBilling.phone,
          line1: defaultBilling.line1,
          line2: defaultBilling.line2,
          city: defaultBilling.city,
          state: defaultBilling.state,
          postal_code: defaultBilling.postal_code,
          country: defaultBilling.country,
        });
      }
    }
  };

  const handleShippingSelect = async (serviceId: string) => {
    setShippingLoading(true);
    setError("");
    try {
      await shippingApi.selectService(serviceId);
      setSelectedShippingService(serviceId);
      await fetchCart();
    } catch (error: any) {
      setError(error.message || "Failed to select shipping service");
    } finally {
      setShippingLoading(false);
    }
  };

  const validateCheckoutForm = (): boolean => {
    if (isGuestCheckout) {
      if (!guestInfo.email || !guestInfo.name || !guestInfo.phone) {
        setError("Please fill in all required guest information");
        window.scrollTo(0, 0);
        return false;
      }
      if (isEmailBanned) {
        setError("This email address cannot be used to place orders. Please contact support.");
        window.scrollTo(0, 0);
        return false;
      }
    }

    if (!selectedShippingService) {
      setError("Please select a shipping method");
      window.scrollTo(0, 0);
      return false;
    }

    if (!shippingAddress) {
      setError("Please provide a shipping address");
      window.scrollTo(0, 0);
      return false;
    }

    if (!sameAsShipping && !billingAddress) {
      setError("Please provide a billing address");
      window.scrollTo(0, 0);
      return false;
    }

    return true;
  };

  const handleContinueToPayment = () => {
    if (!validateCheckoutForm()) return;

    setError("");

    // Show modal only for logged-in users with notifications explicitly disabled
    if (!isGuestCheckout && dbUser?.email_notifications === false) {
      setShowEmailModal(true);
      return;
    }

    setShowPayment(true);
  };

  const handleEnableNotifications = async () => {
    try {
      await updateUserProfile({ email_notifications: true });
      await refreshUser();
    } catch (e) {
      console.error("Failed to enable notifications:", e);
    } finally {
      setShowEmailModal(false);
      setShowPayment(true);
    }
  };

  const handleSkipNotifications = () => {
    setShowEmailModal(false);
    setShowPayment(true);
  };

  const handlePaymentSuccess = async (orderId: string) => {
    await refreshCart();
    router.push(`/order-confirmation/${orderId}`);
  };

  const checkExistingUser = async (email: string): Promise<boolean> => {
    try {
      const response = await fetch(
        `/api/users/check-email?email=${encodeURIComponent(email)}`
      );
      const data = await response.json();
      return data.exists;
    } catch (error) {
      return false;
    }
  };

  if (loading || userLoading) {
    return (
      <div className="relative h-48 sm:h-56 md:h-64">
        <Loader />
      </div>
    );
  }

  if (!cart) return null;

  if (showPayment) {
    const checkoutData = {
      shipping_address: shippingAddress,
      billing_address: sameAsShipping ? shippingAddress : billingAddress,
      same_as_shipping: sameAsShipping,
      customer_notes: customerNotes,
      ...(isGuestCheckout && { guest_info: guestInfo }),
    };

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <main className="max-w-4xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 md:py-5 lg:py-6">
          <h1 className="sr-only">Payment Information</h1>
          <PaymentSection
            cart={cart}
            checkoutData={checkoutData}
            onBack={() => setShowPayment(false)}
            onSuccess={handlePaymentSuccess}
          />
        </main>
      </div>
    );
  }

  // Calculate display total including tax
  const displayTotal = cart
    ? cart.subtotal - cart.discount_amount + cart.shipping_cost
    : 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 md:py-5 lg:py-6">
        <h1 className="sr-only">Checkout</h1>

        {error && (
          <div
            className="mb-3 sm:mb-4 p-2.5 sm:p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
            role="alert"
          >
            <p className="text-xs sm:text-sm text-red-800 dark:text-red-200">
              {error}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
          {/* Left Column - Forms */}
          <div className="lg:col-span-2 space-y-3 sm:space-y-4">
            {isGuestCheckout && (
              <GuestInfoForm
                guestInfo={guestInfo}
                onGuestInfoChange={setGuestInfo}
                onCheckExistingUser={checkExistingUser}
                onBannedEmail={setIsEmailBanned}
              />
            )}

            <ShippingServiceSelector
              selectedServiceId={selectedShippingService}
              onServiceSelect={handleShippingSelect}
              loading={shippingLoading}
            />

            <AddressSelection
              shippingAddress={shippingAddress}
              billingAddress={billingAddress}
              sameAsShipping={sameAsShipping}
              onShippingChange={(address) => {
                setShippingAddress(address);
              }}
              onBillingChange={setBillingAddress}
              onSameAsShippingChange={setSameAsShipping}
              savedAddresses={dbUser?.addresses || []}
            />

            {/* Order Notes */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 sm:p-4 md:p-5">
              <label
                htmlFor="order-notes"
                className="block text-xs sm:text-sm font-semibold text-gray-900 dark:text-white mb-2 sm:mb-2.5 md:mb-3"
              >
                Order Notes (Optional)
              </label>
              <textarea
                id="order-notes"
                value={customerNotes}
                onChange={(e) => setCustomerNotes(e.target.value)}
                rows={3}
                placeholder="Any special instructions for your order..."
                className="w-full px-3 sm:px-3.5 md:px-4 py-2 sm:py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-xs sm:text-sm"
                aria-describedby="order-notes-hint"
              />
              <p id="order-notes-hint" className="sr-only">
                Add any special instructions or notes for your order
              </p>
            </div>

            {/* Place Order Button - Mobile */}
            <div className="lg:hidden">
              <button
                onClick={handleContinueToPayment}
                className="w-full px-4 sm:px-5 md:px-6 py-2.5 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm sm:text-base font-semibold rounded-lg transition-colors shadow-sm active:scale-[0.98] min-h-[44px]"
                aria-label="Continue to payment information"
              >
                Continue to Payment
              </button>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <aside
            className="lg:col-span-1 order-first lg:order-last mb-3 sm:mb-4 lg:mb-0"
            aria-labelledby="order-summary-heading"
          >
            <h2 id="order-summary-heading" className="sr-only">
              Order Summary
            </h2>
            <div className="lg:sticky lg:top-6">
              <OrderSummaryCheckout
                cart={cart}
                guestInfo={isGuestCheckout ? guestInfo : undefined}
                shippingAddress={shippingAddress}
                billingAddress={sameAsShipping ? shippingAddress : billingAddress}
                onPlaceOrder={handleContinueToPayment}
                processing={false}
                displayTotal={displayTotal}
              />
            </div>
          </aside>
        </div>
      </main>

      {/* Email Notification Modal */}
      {showEmailModal && (
        <EmailNotificationModal
          onEnable={handleEnableNotifications}
          onSkip={handleSkipNotifications}
        />
      )}
    </div>
  );
}