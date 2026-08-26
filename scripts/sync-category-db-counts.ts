// scripts/sync-category-db-counts.ts
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function main() {
  await mongoose.connect(process.env.MONGODB_URI!);
  const db = mongoose.connection.db!;
  const categories = await db.collection("categories").find({}).toArray();
  const products = await db.collection("products").find({}).toArray();

  for (const cat of categories) {
    const liveCount = products.filter(
      p => p.category_id?.toString() === cat._id.toString() && p.status === "active"
    ).length;
    await db.collection("categories").updateOne(
      { _id: cat._id },
      { $set: { product_count: liveCount } }
    );
  }
  console.log("Updated category product_count in DB successfully!");
  await mongoose.disconnect();
}
main();
