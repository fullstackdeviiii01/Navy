"use client";

import { useState, useEffect } from "react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { paymentApi } from "../../../lib/api/payment";

interface PayPalPaymentButtonProps {
  checkoutData: any;
  amount: number;
  currency: string;
  onSuccess: (paypalOrderId: string) => void;
  onError: (error: string) => void;
}

export default function PayPalPaymentButton({
  checkoutData,
  amount,
  currency,
  onSuccess,
  onError,
}: PayPalPaymentButtonProps) {
  const [clientId, setClientId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializePayPal();
  }, []);

  const initializePayPal = async () => {
    try {
      const gatewaysData = await paymentApi.getActiveGateways();
      const paypalGateway = gatewaysData.gateways?.find(
        (g: any) => g.name === "paypal"
      );

      if (!paypalGateway?.credentials?.paypal_client_id) {
        throw new Error("PayPal is not configured");
      }

      setClientId(paypalGateway.credentials.paypal_client_id);
    } catch (error: any) {
      onError(error.message || "Failed to initialize PayPal");
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

  if (!clientId) {
    return (
      <div className="text-center py-6 sm:py-8">
        <p className="text-xs sm:text-sm text-red-600 dark:text-red-400">
          Failed to load PayPal. Please try another payment method.
        </p>
      </div>
    );
  }

  return (
    <PayPalScriptProvider
      options={{
        clientId,
        currency: currency.toUpperCase(),
        intent: "capture",
      }}
    >
      <PayPalButtons
        style={{ layout: "vertical", shape: "rect", label: "pay" }}
        createOrder={async () => {
          try {
            const data = await paymentApi.createPayPalOrder(
              amount,
              currency,
              checkoutData
            );
            return data.orderId;
          } catch (error: any) {
            onError(error.message || "Failed to create PayPal order");
            throw error;
          }
        }}
        onApprove={async (data) => {
          try {
            await paymentApi.capturePayPalOrder(data.orderID);
            onSuccess(data.orderID);
          } catch (error: any) {
            onError(error.message || "Payment capture failed. Please contact support.");
          }
        }}
        onError={() => {
          onError("PayPal payment failed. Please try again or use a different payment method.");
        }}
        onCancel={() => {
          onError("Payment was cancelled.");
        }}
      />
    </PayPalScriptProvider>
  );
}