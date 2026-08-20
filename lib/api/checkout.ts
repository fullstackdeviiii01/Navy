// lib/api/checkout.ts
import { getAuthToken, handleResponse } from "./helpers";

export interface CheckoutAddress {
  full_name: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

export interface CheckoutData {
  shipping_address: CheckoutAddress;
  billing_address?: CheckoutAddress;
  same_as_shipping: boolean;
  customer_notes?: string;
  guest_info?: {
    email: string;
    name: string;
    phone: string;
  };
  payment_method: "stripe" | "cod" | "paypal";
  payment_intent_id?: string;    // Stripe
  paypal_order_id?: string;      // PayPal
  tax_calculation_id?: string;   // Stripe Tax
  tax_amount?: number;           // Stripe Tax amount
}

export interface CheckoutResponse {
  success: boolean;
  message: string;
  order: {
    _id: string;
    order_number: string;
    status: string;
    payment_status: string;
    pricing: {
      subtotal: number;
      discount_amount: number;
      tax_amount: number;
      shipping_cost: number;
      total: number;
      currency: string;
    };
  };
}

export const checkoutApi = {
  processCheckout: async (data: CheckoutData): Promise<CheckoutResponse> => {
    const response = await fetch("/api/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },
};