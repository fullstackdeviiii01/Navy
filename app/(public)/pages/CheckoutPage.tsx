// app/(public)/pages/CheckoutPage.tsx
"use client";

import { useState, useEffect, useRef } from "react";
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
import { trackInitiateCheckout } from "../../../lib/meta/pixel";

export default function CheckoutPage() {
  const { cart: contextCart, authUser, dbUser, loading: userLoading, refreshCart, updateCart, updateUserProfile, refreshUser } = useUser();
  const router = useRouter();
  const [cart, setCart] = useState<any>(contextCart || null);
  const [loading, setLoading] = useState(!contextCart);
  const [error, setError] = useState("");
  const [showPayment, setShowPayment] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const isOrderPlaced = useRef(false);
  const hasFiredInitiateCheckout = useRef(false);

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
  const [isEmailBanned, setIsEmailBanned] = useState(false);

  const isGuestCheckout = !authUser;

  // React immediately whenever context cart updates (e.g. if modified in cart sidebar)
  useEffect(() => {
    if (isOrderPlaced.current) return;
    if (!userLoading) {
      if (contextCart) {
        if (!contextCart.items || contextCart.items.length === 0) {
          if (!isOrderPlaced.current) {
            router.push("/cart");
          }
          return;
        }
        setCart(contextCart);
        if (contextCart.selected_shipping_service_id) {
          setSelectedShippingService(
            contextCart.selected_shipping_service_id._id ||
            contextCart.selected_shipping_service_id
          );
        }
        setLoading(false);
      } else {
        fetchCart();
      }

      if (dbUser) {
        loadSavedAddresses();
      }
    }
  }, [contextCart, userLoading, dbUser, router]);

  // Track Meta Pixel InitiateCheckout
  useEffect(() => {
    if (cart && cart.items && cart.items.length > 0 && !hasFiredInitiateCheckout.current) {
      hasFiredInitiateCheckout.current = true;
      trackInitiateCheckout({
        content_ids: cart.items.map((i: any) => (i.product_id?._id || i.product_id)?.toString()),
        num_items: cart.items.length,
        value: cart.total_price || cart.subtotal || 0,
        currency: "PKR",
      });
    }
  }, [cart]);

  // Always scroll to top on initial page mount and when toggling between Address and Payment steps
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }
  }, [showPayment]);

  const fetchCart = async () => {
    if (isOrderPlaced.current) return;
    try {
      const data = await cartApi.getCart();
      if (!data.cart || data.cart.items.length === 0) {
        if (!isOrderPlaced.current) {
          router.push("/cart");
        }
        return;
      }
      setCart(data.cart);
      updateCart?.(data.cart);

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
      const data = await shippingApi.selectService(serviceId);
      setSelectedShippingService(serviceId);
      if (data?.cart) {
        setCart(data.cart);
        updateCart?.(data.cart);
      }
      await refreshCart();
    } catch (error: any) {
      setError(error.message || "Failed to select shipping service");
    } finally {
      setShippingLoading(false);
    }
  };

  const validateCheckoutForm = (): boolean => {
    if (!cart || !cart.items || cart.items.length === 0) {
      setError("Your cart is empty. Please add items before checking out.");
      router.push("/cart");
      return false;
    }

    if (isGuestCheckout) {
      if (!guestInfo.email || !guestInfo.name || !guestInfo.phone) {
        setError("Please fill in all required contact details");
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
      setError("Please select a delivery method");
      window.scrollTo(0, 0);
      return false;
    }

    if (!shippingAddress) {
      setError("Please provide a valid delivery address");
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
    isOrderPlaced.current = true;
    updateCart?.({ items: [], subtotal: 0, total: 0 });
    router.replace(`/order-confirmation/${orderId}`);
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
      <div className="min-h-screen bg-theme-bg-light dark:bg-theme-bg-dark flex items-center justify-center">
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
      <div className="min-h-screen bg-theme-bg-light dark:bg-theme-bg-dark transition-colors">
        <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 md:py-14">
          {/* Header */}
          <div className="mb-6 sm:mb-8 border-b border-theme-border-light dark:border-theme-border-dark pb-5 sm:pb-6">
            <p className="text-[10px] sm:text-xs font-semibold tracking-[0.25em] uppercase text-theme-hover-light dark:text-theme-hover-dark mb-1.5 sm:mb-2">
              STEP 2 OF 2
            </p>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark tracking-tight">
              Payment & Verification
            </h1>
          </div>

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

  return (
    <div className="min-h-screen bg-theme-bg-light dark:bg-theme-bg-dark transition-colors">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 md:py-14">
        {/* Editorial Header */}
        <div className="mb-8 sm:mb-10 border-b border-theme-border-light dark:border-theme-border-dark pb-6 sm:pb-8">
          <p className="text-[10px] sm:text-xs font-semibold tracking-[0.25em] uppercase text-theme-hover-light dark:text-theme-hover-dark mb-1.5 sm:mb-2">
            STEP 1 OF 2 — DELIVERY
          </p>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark mb-2 sm:mb-3 tracking-tight">
            Finalize Your Order
          </h1>
          <p className="text-xs sm:text-sm text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
            Complete your delivery details to ensure handcrafted care from workshop to your room.
          </p>
        </div>

        {error && (
          <div
            className="mb-6 p-4 bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs"
            role="alert"
          >
            <p>{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Left Column - Forms */}
          <div className="lg:col-span-2 space-y-6">
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
              cartSubtotal={cart?.subtotal || 0}
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
            <div className="border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark p-6 transition-colors">
              <label
                htmlFor="order-notes"
                className="block text-xs uppercase tracking-[0.15em] font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-2"
              >
                Special Delivery Instructions (Optional)
              </label>
              <textarea
                id="order-notes"
                value={customerNotes}
                onChange={(e) => setCustomerNotes(e.target.value)}
                rows={3}
                placeholder="Gate code, landmark notes, or packaging preferences..."
                className="w-full p-3 border border-theme-border-light dark:border-theme-border-dark bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark placeholder:text-theme-text-muted-light focus:outline-none focus:border-theme-hover-light resize-none text-xs sm:text-sm"
              />
            </div>

            {/* Mobile Proceed Button */}
            <div className="lg:hidden">
              <button
                onClick={handleContinueToPayment}
                className="w-full py-4 px-6 bg-theme-primary hover:bg-theme-hover-light dark:hover:bg-theme-hover-dark text-theme-btn-text text-xs uppercase tracking-[0.2em] font-medium transition-all"
                aria-label="Continue to payment information"
              >
                CONTINUE TO PAYMENT
              </button>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <aside
            className="lg:col-span-1"
            aria-labelledby="order-summary-heading"
          >
            <div className="lg:sticky lg:top-24">
              <OrderSummaryCheckout
                cart={cart}
                guestInfo={isGuestCheckout ? guestInfo : undefined}
                shippingAddress={shippingAddress}
                billingAddress={sameAsShipping ? shippingAddress : billingAddress}
                onPlaceOrder={handleContinueToPayment}
                processing={false}
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