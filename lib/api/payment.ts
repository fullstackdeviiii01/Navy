// // lib/api/payment.ts - UPDATED WITH STRIPE TAX
import { getAuthToken, handleResponse } from "./helpers";

export const paymentApi = {
  // Admin - Get all payment gateways
  getGateways: async () => {
    const response = await fetch("/api/payment-gateways", {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
    return handleResponse(response);
  },

  // Admin - Get single gateway with credentials
  getGateway: async (name: string) => {
    const response = await fetch(`/api/payment-gateways/${name}`, {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
    return handleResponse(response);
  },

  // Admin - Save gateway configuration
  saveGateway: async (data: any) => {
    const response = await fetch("/api/payment-gateways", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  // Admin - Delete gateway
  deleteGateway: async (name: string) => {
    const response = await fetch(`/api/payment-gateways/${name}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
    return handleResponse(response);
  },

  // User - Get active payment gateways
  getActiveGateways: async () => {
    const response = await fetch("/api/payment/gateways/active");
    return handleResponse(response);
  },

  // UPDATED: Create Stripe payment intent WITH tax calculation ID
  createStripeIntent: async (
    amount: number,
    currency: string = "USD",
    checkoutData?: any,
    taxCalculationId?: string | null // NEW: optional tax calculation ID
  ) => {
    const response = await fetch("/api/payment/stripe/create-intent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify({
        amount,
        currency,
        checkoutData,
        tax_calculation_id: taxCalculationId || null, // NEW
      }),
    });
    return handleResponse(response);
  },

  // Create PayPal order (unchanged)
  createPayPalOrder: async (
    amount: number,
    currency: string = "USD",
    checkoutData?: any
  ) => {
    const response = await fetch("/api/payment/paypal/create-order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify({ amount, currency, checkoutData }),
    });
    return handleResponse(response);
  },

  // User - Capture PayPal payment (unchanged)
  capturePayPalOrder: async (paypalOrderId: string) => {
    const response = await fetch("/api/payment/paypal/capture-order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify({ paypalOrderId }),
    });
    return handleResponse(response);
  },
};