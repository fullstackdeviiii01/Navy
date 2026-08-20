// lib/services/refundService.ts - SIMPLIFIED WITH COD SUPPORT
import Stripe from "stripe";
import connectDB from "../db";
import PaymentGateway from "../../app/models/PaymentGateway";
import Payment from "../../app/models/Payment";
import Refund from "../../app/models/Refund";

export class RefundService {
  /**
   * Process refund through Stripe
   */
  static async processStripeRefund(
    paymentIntentId: string,
    amount: number,
    reason: string,
    rmaNumber: string
  ): Promise<{ success: boolean; refundId?: string; error?: string }> {
    try {
      await connectDB();

      const gateway = await (PaymentGateway as any).findOne({
        name: "stripe",
        is_enabled: true,
      });

      if (!gateway) {
        throw new Error("Stripe gateway not configured");
      }

      const stripe = new Stripe(gateway.credentials.stripe_secret_key);

      // Create refund
      const refund = await stripe.refunds.create({
        payment_intent: paymentIntentId,
        amount: Math.round(amount * 100), // Convert to cents
        reason: "requested_by_customer",
        metadata: {
          rma_number: rmaNumber,
          refund_reason: reason,
        },
      });

      return {
        success: true,
        refundId: refund.id,
      };
    } catch (error: any) {
      console.error("❌ Stripe refund failed:", error);
      return {
        success: false,
        error: error.message || "Refund failed",
      };
    }
  }

  /**
   * Process refund through PayPal
   */
  static async processPayPalRefund(
    captureId: string,
    amount: number,
    currency: string,
    reason: string,
    rmaNumber: string
  ): Promise<{ success: boolean; refundId?: string; error?: string }> {
    try {
      await connectDB();

      const gateway = await (PaymentGateway as any).findOne({
        name: "paypal",
        is_enabled: true,
      });

      if (!gateway) {
        throw new Error("PayPal gateway not configured");
      }

      // Get PayPal access token
      const auth = Buffer.from(
        `${gateway.credentials.paypal_client_id}:${gateway.credentials.paypal_client_secret}`
      ).toString("base64");

      const tokenResponse = await fetch(
        `https://api${gateway.is_test_mode ? "-m.sandbox" : ""}.paypal.com/v1/oauth2/token`,
        {
          method: "POST",
          headers: {
            Authorization: `Basic ${auth}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: "grant_type=client_credentials",
        }
      );

      const tokenData = await tokenResponse.json();
      const accessToken = tokenData.access_token;

      // Create refund
      const refundResponse = await fetch(
        `https://api${gateway.is_test_mode ? "-m.sandbox" : ""}.paypal.com/v2/payments/captures/${captureId}/refund`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            amount: {
              value: amount.toFixed(2),
              currency_code: currency,
            },
            note_to_payer: `Refund for RMA ${rmaNumber}: ${reason}`,
          }),
        }
      );

      const refundData = await refundResponse.json();

      if (!refundResponse.ok || refundData.status !== "COMPLETED") {
        throw new Error(refundData.message || "PayPal refund failed");
      }

      return {
        success: true,
        refundId: refundData.id,
      };
    } catch (error: any) {
      console.error("❌ PayPal refund failed:", error);
      return {
        success: false,
        error: error.message || "Refund failed",
      };
    }
  }

  /**
   * Process bank transfer refund for COD orders
   */
  static async processBankTransferRefund(
    orderId: string,
    returnId: string,
    amount: number,
    currency: string,
    reason: string,
    rmaNumber: string,
    processedBy: string
  ): Promise<{
    success: boolean;
    refund?: any;
    error?: string;
  }> {
    try {
      await connectDB();

      // Create refund record in pending state
      const refund = await Refund.create({
        order_id: orderId,
        return_id: returnId,
        amount,
        currency,
        refund_method: "manual",
        payment_gateway: "cod",
        status: "pending", // Will be updated to "completed" manually by admin after bank transfer
        reason,
        processed_by: processedBy,
        metadata: {
          rma_number: rmaNumber,
          requires_manual_transfer: true,
          transfer_instructions: "Admin must manually transfer funds to customer's bank account",
        },
      });

      return {
        success: true,
        refund,
      };
    } catch (error: any) {
      console.error("❌ Bank transfer refund creation failed:", error);
      return {
        success: false,
        error: error.message || "Failed to create refund record",
      };
    }
  }

  /**
   * Process refund based on payment method
   */
  static async processRefund(
    orderId: string,
    returnId: string,
    amount: number,
    currency: string,
    reason: string,
    rmaNumber: string,
    processedBy: string
  ): Promise<{
    success: boolean;
    refund?: any;
    error?: string;
  }> {
    try {
      await connectDB();

      console.log("🔵 [REFUND] Processing refund for order:", orderId);

      // Find the payment record
      const payment = await (Payment as any).findOne({ order_id: orderId });

      if (!payment) {
        console.error("❌ [REFUND] Payment record not found");
        throw new Error("Payment record not found");
      }

      console.log("🔵 [REFUND] Payment method:", payment.payment_gateway);

      // Check if payment was successful
      if (payment.status !== "completed") {
        throw new Error("Cannot refund: Payment not completed");
      }

      let refundResult: { success: boolean; refundId?: string; error?: string };

      // Process refund based on payment gateway
      if (payment.payment_gateway === "stripe" && payment.payment_intent_id) {
        console.log("🔵 [REFUND] Processing Stripe refund");
        refundResult = await this.processStripeRefund(
          payment.payment_intent_id,
          amount,
          reason,
          rmaNumber
        );
      } else if (payment.payment_gateway === "paypal" && (payment.capture_id || payment.transaction_id)) {
        console.log("🔵 [REFUND] Processing PayPal refund");
        refundResult = await this.processPayPalRefund(
          payment.capture_id || payment.transaction_id,
          amount,
          currency,
          reason,
          rmaNumber
        );
      } else if (payment.payment_gateway === "cod") {
        console.log("🔵 [REFUND] Processing COD bank transfer refund");
        // For COD, create a pending refund record that admin will complete manually
        return await this.processBankTransferRefund(
          orderId,
          returnId,
          amount,
          currency,
          reason,
          rmaNumber,
          processedBy
        );
      } else {
        throw new Error("Unsupported payment method for refund");
      }

      if (!refundResult.success) {
        throw new Error(refundResult.error || "Refund processing failed");
      }

      console.log("✅ [REFUND] Refund processed successfully");

      // Create refund record
      const refund = await Refund.create({
        order_id: orderId,
        return_id: returnId,
        payment_id: payment._id,
        payment_intent_id: payment.payment_intent_id,
        paypal_refund_id: refundResult.refundId,
        amount,
        currency,
        refund_method: "original_payment",
        payment_gateway: payment.payment_gateway,
        status: "completed",
        reason,
        processed_by: processedBy,
        completed_at: new Date(),
      });

      // Update payment record
      payment.status = "refunded";
      payment.refund_amount = amount;
      payment.refund_reason = reason;
      payment.refunded_at = new Date();
      await payment.save();

      console.log("✅ [REFUND] Payment record updated");

      return {
        success: true,
        refund,
      };
    } catch (error: any) {
      console.error("❌ [REFUND] Refund processing failed:", error);
      return {
        success: false,
        error: error.message || "Refund processing failed",
      };
    }
  }

  /**
   * Mark bank transfer refund as completed (called by admin after manual transfer)
   */
  static async completeBankTransfer(
    refundId: string,
    adminId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      await connectDB();

      const refund = await (Refund as any).findById(refundId);

      if (!refund) {
        throw new Error("Refund not found");
      }

      if (refund.payment_gateway !== "cod") {
        throw new Error("This refund is not a bank transfer");
      }

      if (refund.status === "completed") {
        throw new Error("Refund already completed");
      }

      refund.status = "completed";
      refund.completed_at = new Date();
      refund.metadata.set("completed_by", adminId);
      refund.metadata.set("completion_notes", "Bank transfer completed manually by admin");
      
      await refund.save();

      // Update payment record
      const payment = await (Payment as any).findById(refund.payment_id);
      if (payment) {
        payment.status = "refunded";
        payment.refund_amount = refund.amount;
        payment.refunded_at = new Date();
        await payment.save();
      }

      console.log("✅ [REFUND] Bank transfer marked as completed");

      return {
        success: true,
      };
    } catch (error: any) {
      console.error("❌ [REFUND] Failed to complete bank transfer:", error);
      return {
        success: false,
        error: error.message || "Failed to complete bank transfer",
      };
    }
  }
}