// lib/services/refundService.ts - SIMPLIFIED WITH COD SUPPORT
import connectDB from "../db";
import Payment from "../../app/models/Payment";
import Refund from "../../app/models/Refund";

export class RefundService {
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
        payment_gateway: "bank_transfer",
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

      // Both cod and bank_transfer use bank transfer refund
      if (payment.payment_gateway === "cod" || payment.payment_gateway === "bank_transfer") {
        console.log("🔵 [REFUND] Processing bank transfer refund");
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

      if (refund.payment_gateway !== "cod" && refund.payment_gateway !== "bank_transfer") {
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