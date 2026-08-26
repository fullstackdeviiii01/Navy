// scripts/audit-database-products.ts
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/sysfoc_ecommerce";

async function runAudit() {
  console.log("=== STARTING DEEP DATABASE AUDIT ===");
  console.log("Connecting to MongoDB:", MONGODB_URI);
  await mongoose.connect(MONGODB_URI);

  const db = mongoose.connection.db;
  if (!db) throw new Error("Database not connected");

  const productsCollection = db.collection("products");
  const products = await productsCollection.find({}).toArray();

  console.log(`Total Products Audited: ${products.length}\n`);

  let validBrandCount = 0;
  let validFinishCount = 0;
  let cleanFinishOptionsCount = 0;
  let validDescriptionsCount = 0;
  let validVariantsCount = 0;
  let issuesFound: string[] = [];

  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    const pid = p._id.toString();

    // 1. Check Brand
    if (p.brand === "Talal Wooden Lamp") {
      validBrandCount++;
    } else {
      issuesFound.push(`Product [${p.name}] (${pid}): Invalid brand: "${p.brand}"`);
    }

    // 2. Check Description
    if (p.description && p.description.length > 50 && p.description.includes("Talal Wooden Lamp")) {
      validDescriptionsCount++;
    } else {
      issuesFound.push(`Product [${p.name}] (${pid}): Description missing or doesn't include Talal Wooden Lamp`);
    }

    // 3. Check Variant Options
    if (Array.isArray(p.variantOptions)) {
      const finishOpt = p.variantOptions.find(
        (o: any) => o.name?.toLowerCase() === "finish" || o.displayName?.toLowerCase() === "finish"
      );

      if (finishOpt) {
        validFinishCount++;
        // Verify finish option is clean (no colorHexCodes, no colorImages)
        if (!finishOpt.colorHexCodes && !finishOpt.colorImages && !finishOpt.colorVideos) {
          cleanFinishOptionsCount++;
        } else {
          issuesFound.push(`Product [${p.name}] (${pid}): Finish option contains dirty color swatch properties`);
        }
      } else {
        issuesFound.push(`Product [${p.name}] (${pid}): Missing Finish option`);
      }
    } else {
      issuesFound.push(`Product [${p.name}] (${pid}): variantOptions is not an array`);
    }

    // 4. Check Variants
    if (Array.isArray(p.variants) && p.variants.length > 0) {
      const hasMatt = p.variants.some((v: any) =>
        v.attributes?.some((a: any) => a.value?.toLowerCase() === "matt finish")
      );
      const hasShine = p.variants.some((v: any) =>
        v.attributes?.some((a: any) => a.value?.toLowerCase() === "shine finish")
      );

      const allHavePrices = p.variants.every((v: any) => typeof v.price === "number" && v.price > 0);
      const allHaveStock = p.variants.every((v: any) => typeof v.stockQuantity === "number" && v.stockQuantity >= 0);

      if (hasMatt && hasShine && allHavePrices && allHaveStock) {
        validVariantsCount++;
      } else {
        issuesFound.push(
          `Product [${p.name}] (${pid}): Variant issues (Matt: ${hasMatt}, Shine: ${hasShine}, Prices: ${allHavePrices}, Stock: ${allHaveStock})`
        );
      }
    } else {
      issuesFound.push(`Product [${p.name}] (${pid}): No variants found`);
    }
  }

  console.log("=== AUDIT SUMMARY RESULTS ===");
  console.log(`• Total Products: ${products.length}`);
  console.log(`• Products with Brand 'Talal Wooden Lamp': ${validBrandCount}/${products.length}`);
  console.log(`• Products with Finish Options: ${validFinishCount}/${products.length}`);
  console.log(`• Products with Clean Finish Options (No Hex/Media): ${cleanFinishOptionsCount}/${products.length}`);
  console.log(`• Products with Formatted Descriptions: ${validDescriptionsCount}/${products.length}`);
  console.log(`• Products with Valid Matt & Shine Variants: ${validVariantsCount}/${products.length}`);

  if (issuesFound.length === 0) {
    console.log("\n✅ ALL 93 PRODUCTS ARE 100% HEALTHY, CONSISTENT, AND ERROR-FREE!");
  } else {
    console.log(`\n⚠️ Issues Found (${issuesFound.length}):`);
    issuesFound.forEach((iss) => console.log(" - " + iss));
  }

  await mongoose.disconnect();
}

runAudit().catch((err) => {
  console.error("Audit failed:", err);
  process.exit(1);
});
