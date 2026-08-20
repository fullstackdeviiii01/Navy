"use client";

import { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { paymentApi } from "../../../lib/api/payment";

interface StripePaymentFormProps {
  checkoutData: any;
  amount: number;
  currency: string;
  taxCalculationId?: string | null;
  onSuccess: (paymentIntentId: string) => void;
  onError: (error: string) => void;
}

function CheckoutForm({
  checkoutData,
  onSuccess,
  onError,
}: {
  checkoutData: any;
  onSuccess: (paymentIntentId: string) => void;
  onError: (error: string) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setLoading(true);

    sessionStorage.setItem(
      "stripe_pending_checkout",
      JSON.stringify({ ...checkoutData, payment_method: "stripe" })
    );

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: "if_required",
        confirmParams: {
          return_url: `${window.location.origin}/payment/success`,
        },
      });

      sessionStorage.removeItem("stripe_pending_checkout");

      if (error) {
        onError(error.message || "Payment failed");
        setLoading(false);
      } else if (paymentIntent && paymentIntent.status === "succeeded") {
        onSuccess(paymentIntent.id);
      } else {
        onError("Payment processing failed");
        setLoading(false);
      }
    } catch (error: any) {
      sessionStorage.removeItem("stripe_pending_checkout");
      onError(error.message || "Payment failed");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 md:space-y-6">
      <PaymentElement />
      <button
        type="submit"
        aria-label="Stripe payment button"
        disabled={!stripe || loading}
        className="w-full px-4 sm:px-5 md:px-6 py-2.5 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm sm:text-base font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
      >
        {loading ? "Processing Payment..." : "Pay Now"}
      </button>
    </form>
  );
}

export default function StripePaymentForm({
  checkoutData,
  amount,
  currency,
  taxCalculationId,
  onSuccess,
  onError,
}: StripePaymentFormProps) {
  const [stripePromise, setStripePromise] = useState<any>(null);
  const [clientSecret, setClientSecret] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeStripe();
  }, []);

  const initializeStripe = async () => {
    try {
      // Fetch publishable key from DB via active gateways
      const gatewaysData = await paymentApi.getActiveGateways();
      const stripeGateway = gatewaysData.gateways.find(
        (g: any) => g.name === "stripe"
      );

      if (!stripeGateway?.credentials?.stripe_publishable_key) {
        throw new Error("Stripe not configured");
      }

      // Create payment intent
      const intentData = await paymentApi.createStripeIntent(
        amount,
        currency,
        checkoutData,
        taxCalculationId
      );
      setClientSecret(intentData.clientSecret);

      // Load Stripe with publishable key from DB
      const stripe = await loadStripe(
        stripeGateway.credentials.stripe_publishable_key
      );
      setStripePromise(stripe);
    } catch (error: any) {
      onError(error.message || "Failed to initialize payment");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-6 sm:py-8">
        <div className="animate-spin rounded-full h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 border-2 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!clientSecret || !stripePromise) {
    return (
      <div className="text-center py-6 sm:py-8">
        <p className="text-xs sm:text-sm text-red-600 dark:text-red-400">
          Failed to load payment form
        </p>
      </div>
    );
  }

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: {
          theme: "stripe",
        },
      }}
    >
      <CheckoutForm checkoutData={checkoutData} onSuccess={onSuccess} onError={onError} />
    </Elements>
  );
}