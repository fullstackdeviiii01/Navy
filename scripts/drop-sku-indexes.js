// scripts/drop-sku-indexes.js
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("No MONGODB_URI found in environment variables.");
  process.exit(1);
}

async function dropSkuIndexes() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("Connected successfully.");

    const db = mongoose.connection.db;
    const collection = db.collection("products");

    // List all existing indexes on products collection
    const indexes = await collection.indexes();
    console.log("Existing indexes on 'products':", indexes.map((i) => i.name));

    for (const index of indexes) {
      if (
        index.name.includes("sku") ||
        (index.key && (index.key["inventory.sku"] || index.key["variants.sku"] || index.key.sku))
      ) {
        console.log(`Dropping index: ${index.name}`);
        try {
          await collection.dropIndex(index.name);
          console.log(`Successfully dropped index: ${index.name}`);
        } catch (dropErr) {
          console.error(`Failed to drop index ${index.name}:`, dropErr.message);
        }
      }
    }

    console.log("Finished checking and dropping SKU indexes.");

    // Unset SKU fields from existing products in DB
    const updateResult = await collection.updateMany(
      {},
      {
        $unset: {
          "inventory.sku": "",
          "variants.$[].sku": "",
        },
      }
    );
    console.log(`Cleaned SKU fields from existing products. Matched: ${updateResult.matchedCount}, Modified: ${updateResult.modifiedCount}`);

    await mongoose.disconnect();
    console.log("Database connection closed.");
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  }
}

dropSkuIndexes();
