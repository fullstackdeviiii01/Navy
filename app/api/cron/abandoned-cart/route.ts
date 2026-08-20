// app/api/cron/abandoned-cart/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "../../../../lib/db";
import Cart from "../../../models/Cart";
import User from "../../../models/User";
import EmailConfiguration from "../../../models/EmailConfiguration";
import { EmailService } from "../../../../lib/services/emailService";

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const emailConfig = await (EmailConfiguration as any).findOne();
    
    if (!emailConfig || !emailConfig.email_notifications.abandoned_cart.enabled) {
      return NextResponse.json({
        success: true,
        message: "Abandoned cart emails are disabled",
        sent: 0,
      });
    }

    const delayHours = emailConfig.email_notifications.abandoned_cart.delay_hours;
    const delayMs = delayHours * 60 * 60 * 1000;
    const cutoffDate = new Date(Date.now() - delayMs);

    // ← UPDATE THIS: Find carts with email (guest or user)
    const abandonedCarts = await Cart.find({
      "items.0": { $exists: true },
      updated_at: { $lte: cutoffDate },
      $or: [
        { user_id: { $exists: true, $ne: null } }, // Logged-in users
        { guest_email: { $exists: true, $ne: null } }, // Guests with email
      ],
    }).populate("user_id", "name email");

    let emailsSent = 0;
    const errors = [];

    for (const cart of abandonedCarts) {
      try {
        await cart.populate({
          path: "items.product_id",
          select: "name images pricing inventory",
        });

        let userEmail = null;
        let userName = "Customer";

        // ← UPDATE THIS: Handle both logged-in and guest users
        if (cart.user_id) {
          // Logged-in user
          const user = cart.user_id as any;
          if (!user || !user.email) continue;
          
          userEmail = user.email;
          userName = user.name || "Customer";
        } else if (cart.guest_email) {
          // Guest user with saved email
          userEmail = cart.guest_email;
          userName = "Guest";
        } else {
          // No email available, skip
          continue;
        }

        // Send abandoned cart email
        await EmailService.sendAbandonedCartEmail(cart, {
          email: userEmail,
          name: userName,
        });
        
        emailsSent++;

        // Update cart timestamp to prevent duplicate emails
        cart.updated_at = new Date();
        await cart.save();
      } catch (error: any) {
        console.error(`Failed to send abandoned cart email for cart ${cart._id}:`, error);
        errors.push({
          cartId: cart._id,
          error: error.message,
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${abandonedCarts.length} abandoned carts`,
      sent: emailsSent,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: any) {
    console.error("Abandoned cart cron failed:", error);
    return NextResponse.json(
      { error: "Failed to process abandoned carts" },
      { status: 500 }
    );
  }
}