// scripts/cleanup-expired-carts.ts - NEW FILE
// Run this as a cron job to cleanup expired guest carts
import connectDB from "../lib/db";
import Cart from "../app/models/Cart";

async function cleanupExpiredCarts() {
  try {
    await connectDB();

    const result = await Cart.deleteMany({
      expires_at: { $lt: new Date() },
      session_id: { $ne: null },
    });

    console.log(`Cleaned up ${result.deletedCount} expired guest carts`);
  } catch (error) {
    console.error("Cart cleanup failed:", error);
  } finally {
    process.exit(0);
  }
}

cleanupExpiredCarts();