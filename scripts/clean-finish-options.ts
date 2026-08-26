// scripts/clean-finish-options.ts
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/sysfoc_ecommerce";

async function main() {
  console.log("Connecting to MongoDB:", MONGODB_URI);
  await mongoose.connect(MONGODB_URI);
  console.log("Connected successfully!");

  const db = mongoose.connection.db;
  if (!db) throw new Error("DB not connected");

  const productsCollection = db.collection("products");
  const products = await productsCollection.find({}).toArray();

  let cleaned = 0;

  for (const p of products) {
    if (!Array.isArray(p.variantOptions)) continue;

    let modified = false;
    const cleanVariantOptions = p.variantOptions.map((opt: any) => {
      // If the option is Finish, strip colorHexCodes, colorImages, colorVideos
      if (opt.name?.toLowerCase() === "finish" || opt.displayName?.toLowerCase() === "finish") {
        modified = true;
        return {
          name: "finish",
          displayName: "Finish",
          values: opt.values && opt.values.length > 0 ? opt.values : ["Matt Finish", "Shine Finish"],
          position: opt.position ?? 1,
        };
      }
      return opt;
    });

    if (modified) {
      await productsCollection.updateOne(
        { _id: p._id },
        {
          $set: {
            variantOptions: cleanVariantOptions,
            updated_at: new Date(),
          },
        }
      );
      cleaned++;
    }
  }

  console.log(`Cleaned Finish options on ${cleaned} products!`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("Cleanup error:", err);
  process.exit(1);
});
