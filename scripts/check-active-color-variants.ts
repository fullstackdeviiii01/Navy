import mongoose from "mongoose";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("MONGODB_URI is not defined");
  process.exit(1);
}

async function checkActiveColorVariants() {
  await mongoose.connect(MONGODB_URI!);
  const db = mongoose.connection.db;
  if (!db) {
    console.error("DB connection failed");
    process.exit(1);
  }

  const productsColl = db.collection("products");
  
  const activeProducts = await productsColl.find({ status: "active" }).toArray();
  console.log(`Total Active Products in DB: ${activeProducts.length}`);

  const withColorVariants: any[] = [];
  const withoutColorVariants: any[] = [];

  for (const p of activeProducts) {
    const variantOptions = p.variantOptions || [];
    const colorOpt = variantOptions.find(
      (opt: any) =>
        opt.name?.toLowerCase() === "color" ||
        opt.displayName?.toLowerCase() === "color" ||
        opt.name?.toLowerCase() === "finish" ||
        opt.displayName?.toLowerCase() === "finish" ||
        opt.name?.toLowerCase() === "shade"
    );

    const hasColorInVariants = p.variants?.some((v: any) =>
      v.attributes?.some(
        (a: any) =>
          a.name?.toLowerCase() === "color" ||
          a.name?.toLowerCase() === "finish" ||
          a.name?.toLowerCase() === "shade"
      )
    );

    if (colorOpt || hasColorInVariants) {
      const colorValues = colorOpt?.values || [];
      withColorVariants.push({
        name: p.name,
        slug: p.seo?.slug,
        optionName: colorOpt?.name || colorOpt?.displayName || "Variant Attributes",
        values: colorValues,
        variantCount: p.variants?.length || 0,
      });
    } else {
      withoutColorVariants.push({
        name: p.name,
        variantOptionsCount: variantOptions.length,
        variantOptions: variantOptions.map((o: any) => o.name),
        variantCount: p.variants?.length || 0,
      });
    }
  }

  console.log("\n==========================================");
  console.log(`ACTIVE PRODUCTS WITH COLOR/FINISH VARIANTS: ${withColorVariants.length} of ${activeProducts.length}`);
  console.log("==========================================");
  withColorVariants.forEach((item, index) => {
    console.log(`${index + 1}. ${item.name}`);
    console.log(`   - Option: ${item.optionName}`);
    console.log(`   - Values: ${item.values.join(", ") || "Derived in variants"}`);
    console.log(`   - Total Variants: ${item.variantCount}`);
  });

  console.log("\n==========================================");
  console.log(`ACTIVE PRODUCTS WITHOUT COLOR VARIANTS: ${withoutColorVariants.length} of ${activeProducts.length}`);
  console.log("==========================================");
  withoutColorVariants.forEach((item, index) => {
    console.log(`${index + 1}. ${item.name} (Other options: ${item.variantOptions.join(", ") || "None / Simple"})`);
  });

  await mongoose.disconnect();
}

checkActiveColorVariants().catch((err) => {
  console.error(err);
  process.exit(1);
});
