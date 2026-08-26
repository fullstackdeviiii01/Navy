// scripts/set-active-products-and-draft-rest.ts
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const activeNames = [
  "Wall Leaning Standing Floor Wooden Lamp",
  "Tipped Hat Wooden Standing Lamp",
  "Sigma Floor lamp",
  "Pattern Ring Floor lamp",
  "Modern Wooden Tripod Standing Lamp",
  "Briar Floor Lamps",
  "Mushroom Floor Lamp",
  "Nordic Vertical LED Wooden Standing Indoor Lamp",
  "Wooden log Cutting Lamp",
  "The Zoro Table Lamp",
  "VECTOR Table Lamp | Wooden Bedside",
  "Romeo Wooden lamp",
  "Rhodes Wooden Lamp",
  "Red Rock Wooden Table Lamp",
  "Rambo Wood Table Lamp",
  "Nostalgic Totally Customize Wooden Lamp",
  "Hunter Charred Wood Lamp",
  "Lovers on the Bench Table Lamp",
  "Mushroom Wooden Lamp",
  "Rustic Vibes 6 Light Rope Chandelier",
  "Rustic Wood Beam LED Pendant Hanging Wooden Lamp",
  "Linear LED Pendant Hanging Wooden Lamp",
  "Minimalist Ash Wood Linear LED Pendant",
  "Wooden Pillar Candlestick Holder",
  "Tempe Wooden Candle Holder",
  "Tapered Silhouette Wooden Candle Holders",
  "Pallet Wall mounted Wooden Candle Holders",
  "Mercana Candelero Wooden Round Candlestick Holder",
  "Interlocking Timber Wooden Tealight Holder",
  "Floor Standing Candle Holders (set of 3)",
  "Oak Candlestick Holder (Set of 3)",
  "Treen Turned Oak Candlestick Holder",
  "Handmade Wood Stack Candle Holders",
  "Lamcy Plaza Wooden Candlestick Holder",
  "Modern Wooden Tealight Candle Holder",
  "Rope Wall Hanging Sconce",
  "Handcrafted Linear Wall Lamp",
];

async function main() {
  console.log("Connecting to MongoDB...");
  await mongoose.connect(process.env.MONGODB_URI!);
  const db = mongoose.connection.db!;
  const productsCol = db.collection("products");

  // 1. Set the 37 listed products to active
  const activeResult = await productsCol.updateMany(
    { name: { $in: activeNames } },
    {
      $set: {
        status: "active",
        is_active: true,
        updated_at: new Date(),
      },
    }
  );

  // 2. Set all other products to draft
  const draftResult = await productsCol.updateMany(
    { name: { $nin: activeNames } },
    {
      $set: {
        status: "draft",
        is_active: false,
        updated_at: new Date(),
      },
    }
  );

  const activeCount = await productsCol.countDocuments({ status: "active" });
  const draftCount = await productsCol.countDocuments({ status: "draft" });
  const totalCount = await productsCol.countDocuments({});

  console.log(`\n=== CATALOG STATUS UPDATE COMPLETE ===`);
  console.log(`• Total Products: ${totalCount}`);
  console.log(`• Active Products (Published on Storefront): ${activeCount}`);
  console.log(`• Draft Products (Moved to Drafts): ${draftCount}`);

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
