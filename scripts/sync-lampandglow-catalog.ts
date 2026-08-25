import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import Product from "../app/models/Product";
import Category from "../app/models/Category";
import User from "../app/models/User";

const COLOR_HEX_MAP: Record<string, string> = {
  natural: "#D4B996",
  "natural wood": "#D4B996",
  "light wood": "#E5D3B3",
  brown: "#6F4E37",
  "dark brown": "#4A3525",
  espresso: "#362B28",
  "espresso brown": "#362B28",
  "deep espresso": "#2B1E16",
  "deep espresso brown": "#2B1E16",
  walnut: "#5C4033",
  "dark walnut": "#3D2B1F",
  sheesham: "#704214",
  rosewood: "#65000B",
  teak: "#8B5A2B",
  oak: "#C19A6B",
  "white oak": "#DCD0B2",
  ash: "#B2BEB5",
  "ash wood": "#C4C4A8",
  mahogany: "#C04000",
  charred: "#232020",
  "burnt wood": "#2A2421",
  rustic: "#8B4513",
  "rustic brown": "#733D14",
  black: "#18181B",
  "matte black": "#222222",
  white: "#F8FAFC",
  "off-white": "#F5F2EB",
  cream: "#FFFDD0",
  beige: "#F5F5DC",
  gray: "#6B7280",
  grey: "#6B7280",
  "dark gray": "#374151",
  "light gray": "#E5E7EB",
  gold: "#D4AF37",
  golden: "#DAA520",
  brass: "#B5A642",
  "antique brass": "#9E8B4E",
  bronze: "#CD7F32",
  copper: "#B87333",
  amber: "#FFBF00",
  yellow: "#FBBF24",
  terracotta: "#E2725B",
  red: "#DC2626",
  green: "#16A34A",
  blue: "#2563EB",
  navy: "#1E3A8A",
  olive: "#808000",
  single: "#D4AF37",
  "the pair": "#6F4E37",
  pair: "#6F4E37",
  "set of 2": "#6F4E37",
  "set of 3": "#8B5A2B",
};

function getHexCode(colorName: string): string {
  if (!colorName) return "#6F4E37";
  const clean = colorName.toLowerCase().trim();
  if (COLOR_HEX_MAP[clean]) return COLOR_HEX_MAP[clean];
  for (const [k, v] of Object.entries(COLOR_HEX_MAP)) {
    if (clean.includes(k)) return v;
  }
  return "#8B5A2B"; // Default warm wood tone
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function extractFlightTextChunks(rawPayload: string): Map<string, string> {
  const chunks = new Map<string, string>();
  const regex = /([0-9a-zA-Z]+):T[0-9a-zA-Z]+,([\s\S]*?)(?=(?:[0-9a-zA-Z]+:T[0-9a-zA-Z]+,|[0-9a-zA-Z]+:I\[|[0-9a-zA-Z]+:\[|[0-9a-zA-Z]+:\"|\"\n|$))/g;
  let m: RegExpExecArray | null;
  while ((m = regex.exec(rawPayload)) !== null) {
    const key = `$${m[1]}`;
    const val = m[2]
      .replace(/\\"/g, '"')
      .replace(/\\n/g, "\n")
      .replace(/\\u003c/g, "<")
      .replace(/\\u003e/g, ">")
      .replace(/\\u0026/g, "&")
      .replace(/\\\\/g, "\\");
    chunks.set(key, val);
  }
  return chunks;
}

async function syncCatalog() {
  console.log("=== STARTING LAMP & GLOW CATALOG SYNCHRONIZATION ===");
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI not found in .env.local");
  }
  await mongoose.connect(process.env.MONGODB_URI);
  console.log(" Connected to MongoDB");

  // Get Admin User ID
  const UserModel = User as any;
  const admin = (await UserModel.findOne({ role: "admin" })) || (await UserModel.findOne({}));
  if (!admin) throw new Error("No admin user found in database");
  const adminId = admin._id;
  console.log(` Admin User ID: ${adminId} (${admin.email})`);

  // Load existing categories
  const existingCategories = await Category.find({});
  const categoryBySlug = new Map<string, any>();
  const categoryByName = new Map<string, any>();
  existingCategories.forEach((c) => {
    categoryBySlug.set(c.slug.toLowerCase(), c);
    categoryByName.set(c.name.toLowerCase(), c);
  });
  console.log(` Loaded ${existingCategories.length} existing categories from DB`);

  // Category Synonym / Mapping Dictionary
  const CATEGORY_MAP: Record<string, string> = {
    "table-lamps": "table-lamp",
    "floor-lamps": "floor-lamp",
    pendants: "pendant-lamp",
    "study-office": "desk-lamp",
  };

  async function getOrCreateCategory(sourceCat: { name: string; slug?: string }) {
    const rawSlug = sourceCat.slug ? sourceCat.slug.toLowerCase().trim() : generateSlug(sourceCat.name);
    const targetSlug = CATEGORY_MAP[rawSlug] || rawSlug;
    const catName = sourceCat.name.trim();

    // Check by slug
    if (categoryBySlug.has(targetSlug)) return categoryBySlug.get(targetSlug);
    // Check by name
    if (categoryByName.has(catName.toLowerCase())) return categoryByName.get(catName.toLowerCase());

    // Create new category
    console.log(` Auto-generating category: "${catName}" (${targetSlug})`);
    const newCat = await Category.create({
      name: catName,
      slug: targetSlug,
      description: `Handcrafted solid wood ${catName.toLowerCase()} curated for modern artisanal interiors.`,
      is_active: true,
      product_count: 0,
      created_by: adminId,
    });
    categoryBySlug.set(targetSlug, newCat);
    categoryByName.set(catName.toLowerCase(), newCat);
    return newCat;
  }

  // Step 1: Fetch listing page to get all live active products
  console.log("\n Fetching active products list from https://www.lampandglow.com/products...");
  const listingRes = await fetch("https://www.lampandglow.com/products");
  const listingHtml = await listingRes.text();

  const chunkRegex = /self\.__next_f\.push\(\[1,\s*\"([\s\S]*?)\"\]\)/g;
  let listingPayload = "";
  let match: RegExpExecArray | null;
  while ((match = chunkRegex.exec(listingHtml)) !== null) {
    listingPayload += match[1];
  }
  const unescapedListing = listingPayload.replace(/\\"/g, '"').replace(/\\\\/g, '\\').replace(/\\n/g, '\n');

  const slugMatches = [...unescapedListing.matchAll(/\"slug\":\"([a-z0-9-]+)\",\"name\":\"([^\"]+)\"/g)];
  const productSlugs = new Map<string, string>();
  for (const m of slugMatches) {
    const slug = m[1];
    const name = m[2];
    if (!["table-lamps", "floor-lamps", "candle-holders", "pendants", "wall-lights", "signature", "all"].includes(slug)) {
      productSlugs.set(slug, name);
    }
  }

  console.log(` Total Live Products to Sync: ${productSlugs.size}`);

  let createdCount = 0;
  let updatedCount = 0;
  let failedCount = 0;
  const processedSlugs = Array.from(productSlugs.keys());

  for (let i = 0; i < processedSlugs.length; i++) {
    const slug = processedSlugs[i];
    const productUrl = `https://www.lampandglow.com/products/${slug}`;

    try {
      const res = await fetch(productUrl);
      if (!res.ok) {
        console.log(` Skipped HTTP ${res.status}: ${productUrl}`);
        failedCount++;
        continue;
      }
      const html = await res.text();

      // Extract Flight Payload
      let fullPayload = "";
      let chunkMatch: RegExpExecArray | null;
      const chunkReg = /self\.__next_f\.push\(\[1,\s*\"([\s\S]*?)\"\]\)/g;
      while ((chunkMatch = chunkReg.exec(html)) !== null) {
        fullPayload += chunkMatch[1];
      }

      const textChunks = extractFlightTextChunks(fullPayload);

      const unescaped = fullPayload
        .replace(/\\"/g, '"')
        .replace(/\\\\/g, '\\');

      const prodIdx = unescaped.indexOf('"product":{');
      if (prodIdx === -1) {
        console.log(` Product data not found in page payload: ${slug}`);
        failedCount++;
        continue;
      }

      let depth = 0;
      let start = prodIdx + '"product":'.length;
      let end = start;
      for (let j = start; j < unescaped.length; j++) {
        if (unescaped[j] === "{") depth++;
        else if (unescaped[j] === "}") {
          depth--;
          if (depth === 0) {
            end = j + 1;
            break;
          }
        }
      }

      let jsonSlice = unescaped.slice(start, end);
      // Sanitize unescaped control characters before JSON.parse
      jsonSlice = jsonSlice.replace(/[\x00-\x1F\x7F]/g, (char) => {
        if (char === "\n") return "\\n";
        if (char === "\r") return "\\r";
        if (char === "\t") return "\\t";
        return "";
      });

      const rawProd = JSON.parse(jsonSlice);
      if (!rawProd || !rawProd.name) {
        console.log(` Invalid product payload for: ${slug}`);
        failedCount++;
        continue;
      }

      // Resolve Description & Specifications from textChunks if referenced ($...)
      if (rawProd.description && typeof rawProd.description === "string" && rawProd.description.startsWith("$")) {
        if (textChunks.has(rawProd.description)) {
          rawProd.description = textChunks.get(rawProd.description);
        }
      }
      if (rawProd.specifications && typeof rawProd.specifications === "string" && rawProd.specifications.startsWith("$")) {
        if (textChunks.has(rawProd.specifications)) {
          rawProd.specifications = textChunks.get(rawProd.specifications);
        }
      }

      // Resolve Primary Category and Subcategories
      let primaryCategoryDoc: any = null;
      const subcategoryIds: any[] = [];

      if (rawProd.categories && Array.isArray(rawProd.categories) && rawProd.categories.length > 0) {
        for (let cIdx = 0; cIdx < rawProd.categories.length; cIdx++) {
          const catDoc = await getOrCreateCategory(rawProd.categories[cIdx]);
          if (cIdx === 0) {
            primaryCategoryDoc = catDoc;
          } else {
            subcategoryIds.push(catDoc._id);
          }
        }
      } else {
        primaryCategoryDoc = await getOrCreateCategory({ name: "Table Lamp", slug: "table-lamp" });
      }

      // Format Images Array
      const sourceImages = Array.isArray(rawProd.images) ? rawProd.images : [];
      const formattedImages = sourceImages.map((imgUrl: string, imgIdx: number) => ({
        url: imgUrl,
        alt_text: `${rawProd.name} - Handcrafted Solid Wood`,
        is_primary: imgIdx === 0,
        sort_order: imgIdx,
      }));

      // Format Videos Array if present
      const formattedVideos: any[] = [];
      if (rawProd.videoUrl) {
        formattedVideos.push({
          url: rawProd.videoUrl,
          is_primary: true,
          sort_order: 0,
        });
      }

      // Parse Specifications / Attributes Map
      const attributesMap = new Map<string, any>();
      if (rawProd.specifications && typeof rawProd.specifications === "string") {
        const rowRegex = /<td[^>]*><p><strong>([^<]+)<\/strong><\/p><\/td><td[^>]*><p>([^<]+)<\/p><\/td>/g;
        let rMatch: RegExpExecArray | null;
        while ((rMatch = rowRegex.exec(rawProd.specifications)) !== null) {
          const key = rMatch[1].toLowerCase().trim().replace(/[^a-z0-9_]/g, "_");
          const val = rMatch[2].trim();
          attributesMap.set(key, val);
        }
      }

      // Check for Variants
      const rawOptions = Array.isArray(rawProd.options) ? rawProd.options : [];
      const rawVariants = Array.isArray(rawProd.variants) ? rawProd.variants : [];
      const hasVariants = rawOptions.length > 0 && rawVariants.length > 0;

      let variantOptions: any[] = [];
      let variants: any[] = [];
      let variantPricing: any = undefined;
      let variantInventory: any = undefined;
      let basePrice = 0;
      let compareAtPrice = 0;
      let totalStock = 0;

      if (hasVariants) {
        // Build Variant Options
        variantOptions = rawOptions.map((opt: any, optIdx: number) => {
          const optName = opt.name.toLowerCase().trim();
          const isColorDimension =
            optName.includes("color") ||
            optName.includes("base") ||
            optName.includes("finish") ||
            optName.includes("shade") ||
            optName.includes("tone") ||
            optName.includes("wood");

          const colorHexCodes: Record<string, string> = {};
          const colorImages: Record<string, string[]> = {};

          if (isColorDimension) {
            opt.values.forEach((val: string) => {
              colorHexCodes[val] = getHexCode(val);

              // Find images for this color option from variants
              const matchingVariant = rawVariants.find(
                (v: any) => v.option1 === val || v.option2 === val || v.option3 === val
              );
              if (matchingVariant && matchingVariant.image) {
                colorImages[val] = [matchingVariant.image];
              }
            });
          }

          return {
            name: optName,
            displayName: opt.name,
            values: opt.values,
            colorHexCodes: isColorDimension ? colorHexCodes : undefined,
            colorImages: isColorDimension ? colorImages : undefined,
            position: optIdx,
          };
        });

        // Build Variants Array
        const prices: number[] = [];
        variants = rawVariants.map((v: any, vIdx: number) => {
          const attrs: { name: string; value: string }[] = [];
          if (v.option1 && rawOptions[0]) {
            attrs.push({ name: rawOptions[0].name.toLowerCase().trim(), value: v.option1 });
          }
          if (v.option2 && rawOptions[1]) {
            attrs.push({ name: rawOptions[1].name.toLowerCase().trim(), value: v.option2 });
          }
          if (v.option3 && rawOptions[2]) {
            attrs.push({ name: rawOptions[2].name.toLowerCase().trim(), value: v.option3 });
          }

          const vPrice = Number(v.price) || 0;
          const vCompareAt = Number(v.compareAtPrice) || undefined;
          const vStock = v.inventory?.[0]?.stockQuantity ?? 15;

          prices.push(vPrice);
          totalStock += vStock;

          return {
            attributes: attrs,
            price: vPrice,
            compareAtPrice: vCompareAt,
            stockQuantity: vStock,
            lowStockThreshold: 5,
            weight: Number(rawProd.weightValue) || 1,
            weightUnit: "kg",
            barcode: v.sku || undefined,
            imageUrl: v.image || sourceImages[0] || undefined,
            isAvailable: true,
            position: vIdx,
          };
        });

        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        basePrice = minPrice;
        compareAtPrice = rawVariants[0]?.compareAtPrice || 0;

        variantPricing = {
          minPrice,
          maxPrice,
          priceVaries: minPrice !== maxPrice,
        };

        variantInventory = {
          totalStock,
          availableVariantCount: variants.length,
        };
      } else {
        // Simple Product
        basePrice = Number(rawVariants[0]?.price) || Number(rawProd.price) || 5000;
        compareAtPrice = Number(rawVariants[0]?.compareAtPrice) || 0;
        totalStock = 20;
      }

      // Clean HTML Description
      let cleanDescription = rawProd.description;
      if (!cleanDescription || typeof cleanDescription !== "string" || cleanDescription.startsWith("$")) {
        cleanDescription = `<p>${rawProd.name} handcrafted from natural solid timber with artisanal lathe turning and natural botanical oil finish.</p>`;
      }

      // Build Complete Product Payload
      const productPayload: any = {
        name: rawProd.name.trim(),
        description: cleanDescription,
        care_guide:
          "Wipe gently with a soft dry microfiber cloth. Avoid placing in direct sunlight or excessive moisture. Apply natural teak oil once every 12 to 18 months.",
        shipping_info:
          "Carefully packaged with high-density protective foam. Dispatched within 24-48 business hours nationwide across Pakistan.",
        return_info: "7-day inspection window with 100% replacement guarantee against transit damage.",
        brand: "Rehan Wooden Lamps",
        category_id: primaryCategoryDoc._id,
        subcategory_ids: subcategoryIds,
        pricing: {
          price: basePrice,
          compare_at_price: compareAtPrice > 0 ? compareAtPrice : undefined,
          currency: "PKR",
        },
        inventory: {
          stock_quantity: totalStock,
          low_stock_threshold: 5,
          track_inventory: true,
          allow_backorder: false,
          stock_status: totalStock > 0 ? "in_stock" : "out_of_stock",
        },
        hasVariants,
        variantOptions,
        variants,
        variantPricing,
        variantInventory,
        images: formattedImages,
        videos: formattedVideos,
        shipping: {
          weight: Number(rawProd.weightValue) || 1,
          weight_unit: "kg",
          requires_shipping: true,
          is_fragile: true,
          dimensions: {
            length: 12,
            width: 12,
            height: 18,
            unit: "in",
          },
        },
        seo: {
          slug: rawProd.slug || slug,
          meta_title: `${rawProd.name} | Rehan Wooden Lamps`,
          meta_description:
            rawProd.metaDescription || `Handcrafted solid wood ${rawProd.name}. Designed and finished in Pakistan.`,
          meta_keywords: rawProd.tags || ["wooden lamp", "handcrafted", "solid wood"],
        },
        attributes: attributesMap,
        status: "active",
        is_visible: true,
        visibility: "public",
        published_at: new Date(),
        created_by: adminId,
        updated_by: adminId,
      };

      // Upsert into MongoDB
      const existingProduct = await Product.findOne({ "seo.slug": productPayload.seo.slug });
      if (existingProduct) {
        await Product.updateOne({ _id: existingProduct._id }, { $set: productPayload });
        updatedCount++;
      } else {
        await Product.create(productPayload);
        createdCount++;
      }

      console.log(
        `[${i + 1}/${processedSlugs.length}] Synced "${rawProd.name}" (${hasVariants ? variants.length + " variants" : "Simple"}, Rs. ${basePrice})`
      );
    } catch (err: any) {
      console.error(`❌ Error syncing ${slug}:`, err.message);
      failedCount++;
    }
  }

  // Update Category Product Counts
  console.log("\n Updating category product counts in DB...");
  const allCats = await Category.find({});
  for (const cat of allCats) {
    const count = await Product.countDocuments({
      $or: [{ category_id: cat._id }, { subcategory_ids: cat._id }],
      status: "active",
    });
    cat.product_count = count;
    await cat.save();
    console.log(` - Category "${cat.name}": ${count} products`);
  }

  console.log("\n==========================================");
  console.log("🎉 CATALOG SYNCHRONIZATION COMPLETE!");
  console.log(` Created Products: ${createdCount}`);
  console.log(` Updated Products: ${updatedCount}`);
  console.log(` Failed / Skipped: ${failedCount}`);
  console.log(` Total Active Products in Store: ${createdCount + updatedCount}`);
  console.log("==========================================");

  process.exit(0);
}

syncCatalog().catch((err) => {
  console.error("Fatal Synchronization Error:", err);
  process.exit(1);
});
