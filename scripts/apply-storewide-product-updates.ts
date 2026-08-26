// scripts/apply-storewide-product-updates.ts
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/sysfoc_ecommerce";

// Generic wood descriptions generator based on product title and category
function generateArtisanalDescription(productName: string, categoryName?: string): string {
  const cleanTitle = productName.trim();
  const lowerTitle = cleanTitle.toLowerCase();
  
  let fixtureType = "handcrafted wooden luminaire";
  if (lowerTitle.includes("wall") || lowerTitle.includes("sconce")) fixtureType = "artisanal wooden wall sconce";
  else if (lowerTitle.includes("pendant") || lowerTitle.includes("hanging")) fixtureType = "architectural wooden pendant lamp";
  else if (lowerTitle.includes("chandelier")) fixtureType = "sculptural wooden chandelier";
  else if (lowerTitle.includes("floor") || lowerTitle.includes("standing")) fixtureType = "hand-turned wooden floor lamp";
  else if (lowerTitle.includes("table") || lowerTitle.includes("desk")) fixtureType = "lathe-turned wooden table lamp";
  else if (lowerTitle.includes("candle") || lowerTitle.includes("holder")) fixtureType = "solid hardwood candle holder";
  else if (lowerTitle.includes("ceiling")) fixtureType = "handcrafted wooden ceiling fixture";

  return `
<p>The <strong>${cleanTitle}</strong> by <strong>Talal Wooden Lamp</strong> is an exquisite ${fixtureType}, lathe-turned and sculpted by master Pakistani wood artisans from seasoned natural hardwood. Designed to bring organic warmth, textural depth, and architectural balance into your living sanctuary, each piece highlights the authentic grain, tone, and character of living wood.</p>

<h3>Artisanal Highlights</h3>
<ul>
  <li><strong>100% Solid Natural Hardwood:</strong> Responsibly harvested and kiln-seasoned to ensure lasting structural integrity and dimensional stability.</li>
  <li><strong>Handmade Precision:</strong> Turned on traditional wood lathes and hand-sanded across progressive grits for a velvety-smooth touch.</li>
  <li><strong>Two Signature Finishes:</strong> Available in a contemporary <em>Matt Finish</em> (soft matte botanical oil) or a rich <em>Shine Finish</em> (glossy protective luster).</li>
  <li><strong>Warm Ambient Glow:</strong> Engineered to cast a serene, glare-free radiance that transforms bedrooms, living rooms, dining nooks, and entryway consoles.</li>
  <li><strong>Standard E27 / E14 Socket:</strong> Fully compatible with warm-white LED filament bulbs for low energy consumption and long service life.</li>
</ul>

<h3>Craftsmanship & Care</h3>
<p>Every luminaire from Talal Wooden Lamp is handcrafted with personal dedication. Wipe gently with a dry microfiber cloth to keep it pristine. Nourish with natural beeswax or teak oil once every 12–18 months to preserve its rich grain and natural luster.</p>
`.trim();
}

async function main() {
  console.log("Connecting to MongoDB:", MONGODB_URI);
  await mongoose.connect(MONGODB_URI);
  console.log("Connected successfully!");

  const db = mongoose.connection.db;
  if (!db) {
    throw new Error("Database connection not established");
  }

  const productsCollection = db.collection("products");
  const categoriesCollection = db.collection("categories");

  const categories = await categoriesCollection.find({}).toArray();
  const categoryMap = new Map<string, string>();
  categories.forEach((cat) => {
    categoryMap.set(cat._id.toString(), cat.name);
  });

  const products = await productsCollection.find({}).toArray();
  console.log(`Found ${products.length} products to update.`);

  let updatedCount = 0;

  for (const p of products) {
    const categoryName = p.category_id ? categoryMap.get(p.category_id.toString()) : undefined;
    const newDescription = generateArtisanalDescription(p.name, categoryName);

    // 1. Finish Variant Options
    let variantOptions: any[] = p.variantOptions ? [...p.variantOptions] : [];
    
    // Check if finish option already exists
    const finishOptIndex = variantOptions.findIndex(
      (opt) => opt.name?.toLowerCase() === "finish" || opt.displayName?.toLowerCase() === "finish"
    );

    if (finishOptIndex >= 0) {
      variantOptions[finishOptIndex].values = ["Matt Finish", "Shine Finish"];
    } else {
      variantOptions.push({
        name: "finish",
        displayName: "Finish",
        values: ["Matt Finish", "Shine Finish"],
        position: variantOptions.length,
      });
    }

    // 2. Expand Variants to include Matt Finish and Shine Finish
    let variants: any[] = [];
    const basePrice = p.pricing?.price || 2500;
    const comparePrice = p.pricing?.compare_at_price;
    const baseStock = p.inventory?.stock_quantity || 20;
    const defaultImage = p.images?.[0]?.url;

    if (p.hasVariants && p.variants && p.variants.length > 0) {
      // Check if existing variants already have finish attribute
      const hasFinishAttr = p.variants.some((v: any) =>
        v.attributes?.some((a: any) => a.name?.toLowerCase() === "finish")
      );

      if (hasFinishAttr) {
        variants = p.variants;
      } else {
        // Expand each existing variant for Matt and Shine
        let pos = 0;
        for (const existingVar of p.variants) {
          const baseAttrs = (existingVar.attributes || []).filter(
            (a: any) => a.name?.toLowerCase() !== "finish"
          );

          // Matt Finish
          variants.push({
            ...existingVar,
            _id: new mongoose.Types.ObjectId(),
            attributes: [...baseAttrs, { name: "finish", value: "Matt Finish" }],
            price: existingVar.price || basePrice,
            compareAtPrice: existingVar.compareAtPrice || comparePrice,
            stockQuantity: existingVar.stockQuantity || baseStock,
            isAvailable: existingVar.isAvailable !== false,
            imageUrl: existingVar.imageUrl || defaultImage,
            position: pos++,
          });

          // Shine Finish
          variants.push({
            ...existingVar,
            _id: new mongoose.Types.ObjectId(),
            attributes: [...baseAttrs, { name: "finish", value: "Shine Finish" }],
            price: existingVar.price || basePrice,
            compareAtPrice: existingVar.compareAtPrice || comparePrice,
            stockQuantity: existingVar.stockQuantity || baseStock,
            isAvailable: existingVar.isAvailable !== false,
            imageUrl: existingVar.imageUrl || defaultImage,
            position: pos++,
          });
        }
      }
    } else {
      // Simple product becomes a variant product with Matt and Shine finishes
      variants = [
        {
          _id: new mongoose.Types.ObjectId(),
          attributes: [{ name: "finish", value: "Matt Finish" }],
          price: basePrice,
          compareAtPrice: comparePrice,
          stockQuantity: Math.max(10, Math.floor(baseStock / 2)),
          isAvailable: true,
          imageUrl: defaultImage,
          position: 0,
        },
        {
          _id: new mongoose.Types.ObjectId(),
          attributes: [{ name: "finish", value: "Shine Finish" }],
          price: basePrice,
          compareAtPrice: comparePrice,
          stockQuantity: Math.max(10, Math.floor(baseStock / 2)),
          isAvailable: true,
          imageUrl: defaultImage,
          position: 1,
        },
      ];
    }

    // Calculate variant pricing and inventory
    const variantPrices = variants.map((v) => v.price).filter((pr) => typeof pr === "number");
    const minPrice = variantPrices.length > 0 ? Math.min(...variantPrices) : basePrice;
    const maxPrice = variantPrices.length > 0 ? Math.max(...variantPrices) : basePrice;
    const totalStock = variants.reduce((sum, v) => sum + (v.stockQuantity || 0), 0);

    const updateDoc = {
      $set: {
        brand: "Talal Wooden Lamp",
        description: newDescription,
        hasVariants: true,
        variantOptions: variantOptions,
        variants: variants,
        variantPricing: {
          minPrice: minPrice,
          maxPrice: maxPrice,
          priceVaries: minPrice !== maxPrice,
        },
        variantInventory: {
          totalStock: totalStock,
          availableVariantCount: variants.filter((v) => v.isAvailable).length,
        },
        "inventory.stock_quantity": totalStock,
        updated_at: new Date(),
      },
      $unset: {
        care_guide: "",
        shipping_info: "",
        return_info: "",
      },
    };

    await productsCollection.updateOne({ _id: p._id }, updateDoc);
    updatedCount++;
  }

  console.log(`Successfully updated ${updatedCount} products with:`);
  console.log("- Brand set to 'Talal Wooden Lamp'");
  console.log("- Professional artisanal descriptions rewritten");
  console.log("- 'Matt Finish' & 'Shine Finish' variants added across all items");
  console.log("- Cleaned up obsolete care_guide, shipping_info, return_info fields");

  await mongoose.disconnect();
  console.log("Migration complete!");
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
