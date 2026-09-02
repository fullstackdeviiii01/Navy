import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("Error: MONGODB_URI is not defined in .env.local");
  process.exit(1);
}

async function cleanDatabase() {
  try {
    console.log("==================================================");
    console.log("   DATABASE PRE-HANDOVER CLEANUP & RESET TOOL    ");
    console.log("==================================================");
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("Successfully connected to MongoDB.\n");

    const db = mongoose.connection.db;
    if (!db) {
      throw new Error("Failed to get native MongoDB database reference.");
    }

    // List all collections in DB
    const allCollections = await db.listCollections().toArray();
    console.log("Found collections in database:");
    for (const col of allCollections) {
      const count = await db.collection(col.name).countDocuments();
      console.log(` - ${col.name}: ${count} documents`);
    }
    console.log("\n--- EXECUTING CLEANUP ---\n");

    // 1. Delete Orders
    if (allCollections.some((c) => c.name === "orders")) {
      const ordersRes = await db.collection("orders").deleteMany({});
      console.log(`✓ Orders deleted: ${ordersRes.deletedCount}`);
    }

    // 2. Delete Invoices
    if (allCollections.some((c) => c.name === "invoices")) {
      const invoicesRes = await db.collection("invoices").deleteMany({});
      console.log(`✓ Invoices deleted: ${invoicesRes.deletedCount}`);
    }

    // 3. Delete Payments
    if (allCollections.some((c) => c.name === "payments")) {
      const paymentsRes = await db.collection("payments").deleteMany({});
      console.log(`✓ Payments deleted: ${paymentsRes.deletedCount}`);
    }

    // 4. Delete Returns
    if (allCollections.some((c) => c.name === "returns")) {
      const returnsRes = await db.collection("returns").deleteMany({});
      console.log(`✓ Returns/Refunds deleted: ${returnsRes.deletedCount}`);
    }

    // 5. Delete Carts
    if (allCollections.some((c) => c.name === "carts")) {
      const cartsRes = await db.collection("carts").deleteMany({});
      console.log(`✓ Carts deleted: ${cartsRes.deletedCount}`);
    }

    // 6. Delete Wishlists
    if (allCollections.some((c) => c.name === "wishlists")) {
      const wishlistsRes = await db.collection("wishlists").deleteMany({});
      console.log(`✓ Wishlists deleted: ${wishlistsRes.deletedCount}`);
    }

    // 7. Delete Coupon Usages
    if (allCollections.some((c) => c.name === "couponusages")) {
      const couponUsageRes = await db.collection("couponusages").deleteMany({});
      console.log(`✓ Coupon usages deleted: ${couponUsageRes.deletedCount}`);
    }

    // 8. Reset Coupon used_count
    if (allCollections.some((c) => c.name === "coupons")) {
      const couponUpdateRes = await db.collection("coupons").updateMany(
        {},
        { $set: { used_count: 0 } }
      );
      console.log(`✓ Coupons reset (used_count = 0): ${couponUpdateRes.modifiedCount} modified`);
    }

    // 9. Delete Reviews
    if (allCollections.some((c) => c.name === "reviews")) {
      const reviewsRes = await db.collection("reviews").deleteMany({});
      console.log(`✓ Reviews deleted: ${reviewsRes.deletedCount}`);
    }

    // 10. Reset Product Ratings & Purchase Counters
    if (allCollections.some((c) => c.name === "products")) {
      const productsRes = await db.collection("products").updateMany(
        {},
        {
          $set: {
            rating_average: 0,
            rating_count: 0,
            purchase_count: 0,
          },
        }
      );
      console.log(`✓ Product review stats reset (rating_average=0, rating_count=0, purchase_count=0): ${productsRes.modifiedCount} products updated`);
    }

    // 11. Reset User shopping counters, carts, wishlists, and order stats
    if (allCollections.some((c) => c.name === "users")) {
      const usersRes = await db.collection("users").updateMany(
        {},
        {
          $set: {
            cart: [],
            wishlist: [],
            order_count: 0,
            total_spent: 0,
          },
          $unset: {
            last_order_at: "",
          },
        }
      );
      console.log(`✓ User shopping stats & embedded carts/wishlists reset: ${usersRes.modifiedCount} users updated`);
    }

    console.log("\n--- POST-CLEANUP VERIFICATION ---\n");
    for (const col of allCollections) {
      const count = await db.collection(col.name).countDocuments();
      console.log(` - ${col.name}: ${count} documents remaining`);
    }

    console.log("\n==================================================");
    console.log("   ALL TEST DATA CLEANED UP & VERIFIED SAFELY!   ");
    console.log("==================================================");
  } catch (error) {
    console.error("Cleanup error:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

cleanDatabase();
