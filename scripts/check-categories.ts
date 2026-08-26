// scripts/check-categories.ts
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function main() {
  await mongoose.connect(process.env.MONGODB_URI!);
  const db = mongoose.connection.db!;
  const categories = await db.collection("categories").find({}).toArray();
  const products = await db.collection("products").find({}).toArray();

  console.log("=== CATEGORY PRODUCT COUNTS ===");
  for (const cat of categories) {
    const total = products.filter(p => p.category_id?.toString() === cat._id.toString()).length;
    const active = products.filter(p => p.category_id?.toString() === cat._id.toString() && p.status === "active").length;
    console.log(`• ${cat.name}: ${active} Active (${total} Total in DB, stored product_count: ${cat.product_count})`);
  }

  await mongoose.disconnect();
}
main();
