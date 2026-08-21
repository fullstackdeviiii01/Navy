// scripts/seed-20-lamps.ts
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import mongoose from "mongoose";
import Category from "../app/models/Category";
import Product from "../app/models/Product";
import User from "../app/models/User";

async function seedProducts() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI environment variable is missing in .env.local");
  }

  await mongoose.connect(uri);
  console.log("Connected to MongoDB database.");

  // Fetch admin user
  const adminUser = await (User as any).findOne({ role: "admin" });
  if (!adminUser) {
    throw new Error("No admin user found to associate as product creator.");
  }
  const adminId = adminUser._id;

  // Fetch all categories
  const categories = await (Category as any).find({}).lean();
  const categoryMap: Record<string, any> = {};
  for (const cat of categories) {
    categoryMap[cat.slug] = cat._id;
  }

  console.log("Categories found:", Object.keys(categoryMap));

  const tableLampId = categoryMap["table-lamp"];
  const floorLampId = categoryMap["floor-lamp"];
  const deskLampId = categoryMap["desk-lamp"];
  const pendantLampId = categoryMap["pendant-lamp"];
  const tiffanyLampId = categoryMap["tiffany-lamp"];
  const arcLampId = categoryMap["arc-lamp"];
  const gooseneckLampId = categoryMap["gooseneck-lamp"];

  if (!tableLampId || !floorLampId || !deskLampId || !pendantLampId || !tiffanyLampId || !arcLampId || !gooseneckLampId) {
    throw new Error("One or more required lamp categories are missing.");
  }

  const productsData = [
    // =========================================================================
    // 1. SIMPLE PRODUCT (NO VARIANTS) - Table Lamp
    // =========================================================================
    {
      name: "Aethelgard Hand-Carved Oak Table Lamp",
      description:
        "The Aethelgard Table Lamp is turned from a single block of sustainably harvested solid oak. Finished with natural beeswax and organic botanical oils, it highlights the timber's unique grain and knots. Topped with a tailored natural Belgian linen drum shade that casts a warm, soothing ambient glow across bedside tables and study desks.",
      care_guide: "Dust regularly with a dry, lint-free microfiber cloth. Avoid harsh chemical cleaners or abrasive sponges. Treat wood base with natural beeswax polish annually.",
      shipping_info: "Dispatched within 2-3 business days in reinforced custom protective cushioning. Complimentary insured transit across Pakistan.",
      return_info: "Eligible for exchange or full return within 14 days of receipt in original packaging and condition.",
      brand: "Atelier Glow",
      category_id: tableLampId,
      status: "active",
      is_visible: true,
      visibility: "public",
      published_at: new Date(),
      hasVariants: false,
      pricing: {
        price: 8500,
        compare_at_price: 10500,
        cost_per_item: 4200,
        profit_margin: 50.5,
        currency: "PKR",
      },
      inventory: {
        sku: "LAMP-AETH-OAK-01",
        stock_quantity: 18,
        low_stock_threshold: 4,
        track_inventory: true,
        stock_status: "in_stock",
      },
      shipping: {
        weight: 2.8,
        weight_unit: "kg",
        dimensions: { length: 28, width: 28, height: 48, unit: "cm" },
        requires_shipping: true,
        is_fragile: true,
      },
      seo: {
        meta_title: "Aethelgard Hand-Carved Oak Table Lamp | Solid Wood Luminaire",
        meta_description: "Artisanal solid oak table lamp turned by hand with natural linen shade. Buy handcrafted lighting in Pakistan.",
        slug: "aethelgard-hand-carved-oak-table-lamp",
      },
      created_by: adminId,
    },

    // =========================================================================
    // 2. SIMPLE PRODUCT (NO VARIANTS) - Floor Lamp
    // =========================================================================
    {
      name: "Kallisto Minimalist Brass Reading Floor Lamp",
      description:
        "Slim silhouette crafted from solid architectural brass with an unlacquered satin brushed finish. The Kallisto features a directional 360-degree pivoting conical head, making it the quintessential reading companion beside a deep leather armchair or velvet sofa.",
      care_guide: "Wipe with a soft dry cloth. The unlacquered solid brass will develop a graceful living patina over time, or can be polished with brass restorer.",
      shipping_info: "Ships in modular protective foam packaging with all assembly hardware and hex keys included.",
      return_info: "14-day hassle-free returns on all standard lighting fixtures.",
      brand: "Lumina Studio",
      category_id: floorLampId,
      hasVariants: false,
      pricing: {
        price: 16800,
        compare_at_price: 19500,
        cost_per_item: 8000,
        profit_margin: 52.3,
        currency: "PKR",
      },
      inventory: {
        sku: "LAMP-KALL-BRS-01",
        stock_quantity: 12,
        low_stock_threshold: 3,
        track_inventory: true,
        stock_status: "in_stock",
      },
      shipping: {
        weight: 6.2,
        weight_unit: "kg",
        dimensions: { length: 35, width: 35, height: 145, unit: "cm" },
        requires_shipping: true,
        is_fragile: true,
      },
      seo: {
        meta_title: "Kallisto Minimalist Brass Reading Floor Lamp | Atelier Design",
        meta_description: "Solid brass reading floor lamp with 360-degree rotating conical head. Premium handcrafted lighting.",
        slug: "kallisto-minimalist-brass-reading-floor-lamp",
      },
      created_by: adminId,
    },

    // =========================================================================
    // 3. SIMPLE PRODUCT (NO VARIANTS) - Pendant Lamp
    // =========================================================================
    {
      name: "Nordic Solitude Ceramic Pendant Luminaire",
      description:
        "Wheel-thrown terracotta dome suspended by a twisted heritage jute cord and antique brass ceiling canopy. The unglazed matte terracotta exterior contrasts elegantly with a glazed reflective interior that projects direct, focused illumination over kitchen islands and breakfast nooks.",
      care_guide: "Wipe with a slightly damp cloth. Ensure power is switched off before cleaning the ceramic shade.",
      shipping_info: "Packed inside custom contoured polystyrene foam to guarantee transit integrity.",
      return_info: "14-day satisfaction guarantee with full return option.",
      brand: "Nordic Heritage",
      category_id: pendantLampId,
      hasVariants: false,
      pricing: {
        price: 7200,
        compare_at_price: 8900,
        cost_per_item: 3200,
        profit_margin: 55.5,
        currency: "PKR",
      },
      inventory: {
        sku: "LAMP-NORD-CER-01",
        stock_quantity: 24,
        low_stock_threshold: 5,
        track_inventory: true,
        stock_status: "in_stock",
      },
      shipping: {
        weight: 2.1,
        weight_unit: "kg",
        dimensions: { length: 26, width: 26, height: 22, unit: "cm" },
        requires_shipping: true,
        is_fragile: true,
      },
      seo: {
        meta_title: "Nordic Solitude Ceramic Pendant Luminaire | Handcrafted Ceiling Lamp",
        meta_description: "Wheel-thrown terracotta ceramic pendant ceiling luminaire with brass accents.",
        slug: "nordic-solitude-ceramic-pendant-luminaire",
      },
      created_by: adminId,
    },

    // =========================================================================
    // 4. VARIABLE PRODUCT - Table Lamp
    // =========================================================================
    {
      name: "Vespera Sculptural Walnut Table Lamp",
      description:
        "Sculpted with organic flowing curves, the Vespera Table Lamp stands as an architectural centerpiece in any living room or executive study. Equipped with a brushed brass rotary dimmer switch on the solid timber base and an off-white textured linen shade.",
      care_guide: "Dust shade lightly with a soft brush. Wipe timber base with a microfiber cloth.",
      shipping_info: "Dispatched within 24-48 hours. Insured nationwide door-to-door transit.",
      return_info: "14-day hassle-free returns.",
      brand: "Atelier Glow",
      category_id: tableLampId,
      hasVariants: true,
      pricing: { price: 11500, currency: "PKR" },
      inventory: { sku: "LAMP-VESP-BASE", stock_quantity: 25, stock_status: "in_stock" },
      shipping: { weight: 3.5, dimensions: { length: 32, width: 32, height: 56, unit: "cm" }, requires_shipping: true, is_fragile: true },
      variantOptions: [
        {
          name: "timber finish",
          displayName: "Timber Finish",
          values: ["Natural American Walnut", "Ebonized Smoked Ash", "Bleached White Oak"],
          position: 0,
        },
      ],
      variants: [
        {
          sku: "LAMP-VESP-WALNUT",
          attributes: [{ name: "timber finish", value: "Natural American Walnut" }],
          price: 11500,
          compareAtPrice: 13500,
          stockQuantity: 10,
          isAvailable: true,
          position: 0,
        },
        {
          sku: "LAMP-VESP-ASH",
          attributes: [{ name: "timber finish", value: "Ebonized Smoked Ash" }],
          price: 12200,
          compareAtPrice: 14000,
          stockQuantity: 8,
          isAvailable: true,
          position: 1,
        },
        {
          sku: "LAMP-VESP-OAK",
          attributes: [{ name: "timber finish", value: "Bleached White Oak" }],
          price: 11000,
          compareAtPrice: 12800,
          stockQuantity: 7,
          isAvailable: true,
          position: 2,
        },
      ],
      seo: {
        meta_title: "Vespera Sculptural Walnut Table Lamp | Artisan Lighting",
        meta_description: "Sculptural wooden table lamp with dimmable rotary switch and linen shade.",
        slug: "vespera-sculptural-walnut-table-lamp",
      },
      created_by: adminId,
    },

    // =========================================================================
    // 5. VARIABLE PRODUCT - Table Lamp
    // =========================================================================
    {
      name: "Elysian Fluted Marble & Brass Table Lamp",
      description:
        "Combining heavy hand-carved natural marble columns with solid spun brass finials and base collars. The heavy stone base provides stability while diffusing warm, glare-free light downward and through a tapered silk shantung shade.",
      care_guide: "Clean marble with mild soapy water or stone cleaner. Do not use acidic cleansers.",
      shipping_info: "Packed in reinforced wooden-braced cartons due to marble weight.",
      return_info: "14-day return policy with courier pickup.",
      brand: "Palazzo Luxury",
      category_id: tableLampId,
      hasVariants: true,
      pricing: { price: 14500, currency: "PKR" },
      inventory: { sku: "LAMP-ELY-BASE", stock_quantity: 15, stock_status: "in_stock" },
      shipping: { weight: 5.5, dimensions: { length: 30, width: 30, height: 52, unit: "cm" }, requires_shipping: true, is_fragile: true },
      variantOptions: [
        {
          name: "marble stone",
          displayName: "Marble Stone",
          values: ["Carrara White Veined", "Marquina Nero Black"],
          position: 0,
        },
      ],
      variants: [
        {
          sku: "LAMP-ELY-WHT",
          attributes: [{ name: "marble stone", value: "Carrara White Veined" }],
          price: 14500,
          compareAtPrice: 17500,
          stockQuantity: 8,
          isAvailable: true,
          position: 0,
        },
        {
          sku: "LAMP-ELY-BLK",
          attributes: [{ name: "marble stone", value: "Marquina Nero Black" }],
          price: 15200,
          compareAtPrice: 18000,
          stockQuantity: 7,
          isAvailable: true,
          position: 1,
        },
      ],
      seo: {
        meta_title: "Elysian Fluted Marble & Brass Table Lamp | Luxury Stone Lighting",
        meta_description: "Hand-carved fluted marble table lamp with solid brass hardware.",
        slug: "elysian-fluted-marble-brass-table-lamp",
      },
      created_by: adminId,
    },

    // =========================================================================
    // 6. VARIABLE PRODUCT - Table Lamp
    // =========================================================================
    {
      name: "Lumina Geometric Turned Timber Lamp",
      description:
        "Geometric faceted silhouette hand-turned on wood lathes. Features chamfered hexagonal profiles and an embedded solid brass toggle switch. Ideal for minimalist Scandinavian or Japanese Japandi interior aesthetics.",
      care_guide: "Wipe with dry microfiber cloth. Polish wood twice a year.",
      shipping_info: "Insured standard delivery within 3-4 business days.",
      return_info: "14-day satisfaction return window.",
      brand: "Atelier Glow",
      category_id: tableLampId,
      hasVariants: true,
      pricing: { price: 9200, currency: "PKR" },
      inventory: { sku: "LAMP-LUM-BASE", stock_quantity: 20, stock_status: "in_stock" },
      shipping: { weight: 2.9, dimensions: { length: 25, width: 25, height: 44, unit: "cm" }, requires_shipping: true, is_fragile: true },
      variantOptions: [
        {
          name: "timber stain",
          displayName: "Timber Stain",
          values: ["Golden Warm Teak", "Deep Antique Mahogany"],
          position: 0,
        },
      ],
      variants: [
        {
          sku: "LAMP-LUM-TEAK",
          attributes: [{ name: "timber stain", value: "Golden Warm Teak" }],
          price: 9200,
          compareAtPrice: 11000,
          stockQuantity: 12,
          isAvailable: true,
          position: 0,
        },
        {
          sku: "LAMP-LUM-MAHOG",
          attributes: [{ name: "timber stain", value: "Deep Antique Mahogany" }],
          price: 9600,
          compareAtPrice: 11500,
          stockQuantity: 8,
          isAvailable: true,
          position: 1,
        },
      ],
      seo: {
        meta_title: "Lumina Geometric Turned Timber Lamp | Japandi Table Luminaire",
        meta_description: "Faceted geometric solid timber table lamp with tactile toggle switch.",
        slug: "lumina-geometric-turned-timber-lamp",
      },
      created_by: adminId,
    },

    // =========================================================================
    // 7. VARIABLE PRODUCT - Table Lamp
    // =========================================================================
    {
      name: "Komorebi Woven Rattan & Brass Table Lamp",
      description:
        "Komorebi — the Japanese concept of sunlight filtering through trees. Handwoven natural cane rattan weaves diffuse soft dappled patterns across walls. Elevated on three architectural spun brass ball feet.",
      care_guide: "Gently vacuum rattan shade with soft brush attachment to remove dust.",
      shipping_info: "Ships with protective outer boxing and shock-absorbent corners.",
      return_info: "14-day returns supported.",
      brand: "Atelier Glow",
      category_id: tableLampId,
      hasVariants: true,
      pricing: { price: 10400, currency: "PKR" },
      inventory: { sku: "LAMP-KOMO-BASE", stock_quantity: 16, stock_status: "in_stock" },
      shipping: { weight: 2.4, dimensions: { length: 28, width: 28, height: 46, unit: "cm" }, requires_shipping: true, is_fragile: true },
      variantOptions: [
        {
          name: "weave tone",
          displayName: "Weave Tone",
          values: ["Natural Honey Cane", "Smoked Charcoal Rattan"],
          position: 0,
        },
      ],
      variants: [
        {
          sku: "LAMP-KOMO-HONEY",
          attributes: [{ name: "weave tone", value: "Natural Honey Cane" }],
          price: 10400,
          compareAtPrice: 12500,
          stockQuantity: 9,
          isAvailable: true,
          position: 0,
        },
        {
          sku: "LAMP-KOMO-SMOKE",
          attributes: [{ name: "weave tone", value: "Smoked Charcoal Rattan" }],
          price: 10900,
          compareAtPrice: 13000,
          stockQuantity: 7,
          isAvailable: true,
          position: 1,
        },
      ],
      seo: {
        meta_title: "Komorebi Woven Rattan Table Lamp | Bohemian Lighting",
        meta_description: "Handwoven natural cane and brass table lamp with dappled ambient diffusion.",
        slug: "komorebi-woven-rattan-brass-table-lamp",
      },
      created_by: adminId,
    },

    // =========================================================================
    // 8. VARIABLE PRODUCT - Arc Lamp
    // =========================================================================
    {
      name: "Aurelius Cantilevered Arc Floor Lamp",
      description:
        "The Aurelius features an expansive sweeping curved neck counterbalanced by a 14kg solid Nero Marquina marble slab base. The oversized spun metal dome casts generous downward light over large sectional sofas or dining tables without needing ceiling wiring.",
      care_guide: "Wipe arc stem and base with a soft dry cloth. Keep marble base level during assembly.",
      shipping_info: "Ships in 2 separate protective crates for safety. Assembly toolkit included.",
      return_info: "14-day return window. Contact concierge for oversized pickups.",
      brand: "Palazzo Luxury",
      category_id: arcLampId,
      hasVariants: true,
      pricing: { price: 24500, currency: "PKR" },
      inventory: { sku: "LAMP-AUR-BASE", stock_quantity: 8, stock_status: "in_stock" },
      shipping: { weight: 16.5, dimensions: { length: 110, width: 38, height: 215, unit: "cm" }, requires_shipping: true, is_fragile: true },
      variantOptions: [
        {
          name: "metal finish",
          displayName: "Metal Finish",
          values: ["Brushed Champagne Brass", "Matte Obsidian Black"],
          position: 0,
        },
      ],
      variants: [
        {
          sku: "LAMP-AUR-BRS",
          attributes: [{ name: "metal finish", value: "Brushed Champagne Brass" }],
          price: 24500,
          compareAtPrice: 28900,
          stockQuantity: 4,
          isAvailable: true,
          position: 0,
        },
        {
          sku: "LAMP-AUR-BLK",
          attributes: [{ name: "metal finish", value: "Matte Obsidian Black" }],
          price: 22800,
          compareAtPrice: 26500,
          stockQuantity: 4,
          isAvailable: true,
          position: 1,
        },
      ],
      seo: {
        meta_title: "Aurelius Cantilevered Arc Floor Lamp | Marble Base Luminaire",
        meta_description: "Grand architectural arc floor lamp with counterweight marble base.",
        slug: "aurelius-cantilevered-arc-floor-lamp",
      },
      created_by: adminId,
    },

    // =========================================================================
    // 9. VARIABLE PRODUCT - Arc Lamp
    // =========================================================================
    {
      name: "Seraphina Grand Arching Floor Lamp",
      description:
        "An elegant mid-reach arching floor lamp designed for cozy reading corners and intimate lounge layouts. Features an adjustable telescoping arm and a natural woven oatmeal linen drum shade with an internal acrylic glare diffuser.",
      care_guide: "Dust shade with dry soft cloth. Adjust arm extension using the knurled brass locking nut.",
      shipping_info: "Modular shipping carton with step-by-step assembly manual.",
      return_info: "14-day return guarantee.",
      brand: "Lumina Studio",
      category_id: arcLampId,
      hasVariants: true,
      pricing: { price: 18500, currency: "PKR" },
      inventory: { sku: "LAMP-SER-BASE", stock_quantity: 11, stock_status: "in_stock" },
      shipping: { weight: 9.8, dimensions: { length: 85, width: 35, height: 185, unit: "cm" }, requires_shipping: true, is_fragile: true },
      variantOptions: [
        {
          name: "arm finish",
          displayName: "Arm Finish",
          values: ["Polished Heritage Brass", "Matte Architectural Bronze"],
          position: 0,
        },
      ],
      variants: [
        {
          sku: "LAMP-SER-BRS",
          attributes: [{ name: "arm finish", value: "Polished Heritage Brass" }],
          price: 18500,
          compareAtPrice: 21500,
          stockQuantity: 6,
          isAvailable: true,
          position: 0,
        },
        {
          sku: "LAMP-SER-BRZ",
          attributes: [{ name: "arm finish", value: "Matte Architectural Bronze" }],
          price: 18500,
          compareAtPrice: 21500,
          stockQuantity: 5,
          isAvailable: true,
          position: 1,
        },
      ],
      seo: {
        meta_title: "Seraphina Grand Arching Floor Lamp | Telescoping Reading Lamp",
        meta_description: "Telescoping arching floor lamp with linen drum shade and brass joints.",
        slug: "seraphina-grand-arching-floor-lamp",
      },
      created_by: adminId,
    },

    // =========================================================================
    // 10. VARIABLE PRODUCT - Floor Lamp
    // =========================================================================
    {
      name: "Astrid Mid-Century Tripod Floor Lamp",
      description:
        "Three tapered solid timber legs joined by an interlocking solid cast brass hub. The Astrid evokes iconic 1950s Scandinavian modernism while integrating modern braided fabric cords and a step-on foot switch.",
      care_guide: "Clean timber legs with wood conditioner. Wipe linen shade lightly.",
      shipping_info: "Flat-pack protective packaging; tool-free 5-minute assembly.",
      return_info: "14-day returns supported.",
      brand: "Nordic Heritage",
      category_id: floorLampId,
      hasVariants: true,
      pricing: { price: 15500, currency: "PKR" },
      inventory: { sku: "LAMP-AST-BASE", stock_quantity: 18, stock_status: "in_stock" },
      shipping: { weight: 4.8, dimensions: { length: 50, width: 50, height: 152, unit: "cm" }, requires_shipping: true, is_fragile: false },
      variantOptions: [
        {
          name: "solid wood",
          displayName: "Solid Wood",
          values: ["Solid Burma Teak", "American Black Walnut", "Nordic White Birch"],
          position: 0,
        },
      ],
      variants: [
        {
          sku: "LAMP-AST-TEAK",
          attributes: [{ name: "solid wood", value: "Solid Burma Teak" }],
          price: 15500,
          compareAtPrice: 18000,
          stockQuantity: 7,
          isAvailable: true,
          position: 0,
        },
        {
          sku: "LAMP-AST-WALNUT",
          attributes: [{ name: "solid wood", value: "American Black Walnut" }],
          price: 16800,
          compareAtPrice: 19500,
          stockQuantity: 6,
          isAvailable: true,
          position: 1,
        },
        {
          sku: "LAMP-AST-BIRCH",
          attributes: [{ name: "solid wood", value: "Nordic White Birch" }],
          price: 14800,
          compareAtPrice: 17000,
          stockQuantity: 5,
          isAvailable: true,
          position: 2,
        },
      ],
      seo: {
        meta_title: "Astrid Mid-Century Tripod Floor Lamp | Solid Timber Lamp",
        meta_description: "Iconic mid-century three-legged tripod floor lamp with brass joint hardware.",
        slug: "astrid-mid-century-tripod-floor-lamp",
      },
      created_by: adminId,
    },

    // =========================================================================
    // 11. VARIABLE PRODUCT - Floor Lamp
    // =========================================================================
    {
      name: "Halcyon Linear Brass & Timber Floor Lamp",
      description:
        "Minimalist vertical column floor lamp combining warm natural hardwood with embedded warm-white 2700K indirect LED illumination. Controlled with an integrated continuous touch dimmer strip.",
      care_guide: "Wipe with clean dry cloth. LEDs rated for 50,000+ hours.",
      shipping_info: "Insured courier freight across all major cities in Pakistan.",
      return_info: "14-day full return satisfaction policy.",
      brand: "Lumina Studio",
      category_id: floorLampId,
      hasVariants: true,
      pricing: { price: 19500, currency: "PKR" },
      inventory: { sku: "LAMP-HAL-BASE", stock_quantity: 14, stock_status: "in_stock" },
      shipping: { weight: 7.2, dimensions: { length: 28, width: 28, height: 160, unit: "cm" }, requires_shipping: true, is_fragile: true },
      variantOptions: [
        {
          name: "combination",
          displayName: "Material Combination",
          values: ["Aged Brass & Black Walnut", "Matte Black & Natural Oak"],
          position: 0,
        },
      ],
      variants: [
        {
          sku: "LAMP-HAL-BRS-WAL",
          attributes: [{ name: "combination", value: "Aged Brass & Black Walnut" }],
          price: 20500,
          compareAtPrice: 23900,
          stockQuantity: 8,
          isAvailable: true,
          position: 0,
        },
        {
          sku: "LAMP-HAL-BLK-OAK",
          attributes: [{ name: "combination", value: "Matte Black & Natural Oak" }],
          price: 19500,
          compareAtPrice: 22500,
          stockQuantity: 6,
          isAvailable: true,
          position: 1,
        },
      ],
      seo: {
        meta_title: "Halcyon Linear Brass & Timber Floor Lamp | Dimmable LED Column",
        meta_description: "Architectural vertical column LED floor lamp with touch dimmer control.",
        slug: "halcyon-linear-brass-timber-floor-lamp",
      },
      created_by: adminId,
    },

    // =========================================================================
    // 12. VARIABLE PRODUCT - Desk Lamp
    // =========================================================================
    {
      name: "Zephyr Studio Task & Desk Lamp",
      description:
        "Engineered for focus and productivity. Dual tension springs and solid brass knurled lock nuts allow 180-degree multi-axis positioning. Includes a weighted base and an optional solid brass edge clamp for drafting tables.",
      care_guide: "Lubricate spring joints occasionally with mechanical oil if needed.",
      shipping_info: "Shipped in custom shock-absorbing foam inserts.",
      return_info: "14-day returns supported.",
      brand: "Atelier Glow",
      category_id: deskLampId,
      hasVariants: true,
      pricing: { price: 11200, currency: "PKR" },
      inventory: { sku: "LAMP-ZEPH-BASE", stock_quantity: 22, stock_status: "in_stock" },
      shipping: { weight: 3.8, dimensions: { length: 45, width: 20, height: 65, unit: "cm" }, requires_shipping: true, is_fragile: false },
      variantOptions: [
        {
          name: "metal finish",
          displayName: "Metal Finish",
          values: ["Vintage Brushed Brass", "Matte Cast Iron", "Brushed Satin Nickel"],
          position: 0,
        },
      ],
      variants: [
        {
          sku: "LAMP-ZEPH-BRS",
          attributes: [{ name: "metal finish", value: "Vintage Brushed Brass" }],
          price: 11800,
          compareAtPrice: 13900,
          stockQuantity: 8,
          isAvailable: true,
          position: 0,
        },
        {
          sku: "LAMP-ZEPH-IRON",
          attributes: [{ name: "metal finish", value: "Matte Cast Iron" }],
          price: 11200,
          compareAtPrice: 13000,
          stockQuantity: 9,
          isAvailable: true,
          position: 1,
        },
        {
          sku: "LAMP-ZEPH-NCK",
          attributes: [{ name: "metal finish", value: "Brushed Satin Nickel" }],
          price: 11500,
          compareAtPrice: 13500,
          stockQuantity: 5,
          isAvailable: true,
          position: 2,
        },
      ],
      seo: {
        meta_title: "Zephyr Studio Task & Desk Lamp | Articulated Architect Lamp",
        meta_description: "Articulated dual-spring task and desk lamp with solid brass joints.",
        slug: "zephyr-studio-task-desk-lamp",
      },
      created_by: adminId,
    },

    // =========================================================================
    // 13. VARIABLE PRODUCT - Desk Lamp
    // =========================================================================
    {
      name: "Corinthian Heavy-Base Architect Desk Lamp",
      description:
        "Substantial solid metal construction with a monolithic fluted base. Designed for executive offices, drafting studios, and library reading desks. Features a tactile click rotary switch and swivel dome head.",
      care_guide: "Wipe with a soft dry cloth. Avoid abrasive cleaners.",
      shipping_info: "Dispatched within 2 business days in reinforced packaging.",
      return_info: "14-day returns supported.",
      brand: "Palazzo Luxury",
      category_id: deskLampId,
      hasVariants: true,
      pricing: { price: 12500, currency: "PKR" },
      inventory: { sku: "LAMP-COR-BASE", stock_quantity: 15, stock_status: "in_stock" },
      shipping: { weight: 4.2, dimensions: { length: 30, width: 22, height: 48, unit: "cm" }, requires_shipping: true, is_fragile: false },
      variantOptions: [
        {
          name: "finish",
          displayName: "Finish",
          values: ["Raw Unlacquered Brass", "Gunmetal Slate Steel"],
          position: 0,
        },
      ],
      variants: [
        {
          sku: "LAMP-COR-BRS",
          attributes: [{ name: "finish", value: "Raw Unlacquered Brass" }],
          price: 13200,
          compareAtPrice: 15500,
          stockQuantity: 8,
          isAvailable: true,
          position: 0,
        },
        {
          sku: "LAMP-COR-GUN",
          attributes: [{ name: "finish", value: "Gunmetal Slate Steel" }],
          price: 12500,
          compareAtPrice: 14800,
          stockQuantity: 7,
          isAvailable: true,
          position: 1,
        },
      ],
      seo: {
        meta_title: "Corinthian Heavy-Base Architect Desk Lamp | Executive Lighting",
        meta_description: "Heavy solid brass and gunmetal architect desk lamp with rotary switch.",
        slug: "corinthian-heavy-base-architect-desk-lamp",
      },
      created_by: adminId,
    },

    // =========================================================================
    // 14. VARIABLE PRODUCT - Gooseneck Lamp
    // =========================================================================
    {
      name: "Orion Flexible Gooseneck Reading Lamp",
      description:
        "Featuring a heavy-duty continuous metal gooseneck arm that flexes smoothly to any angle and retains its position without slipping. Equipped with a focused warm 3000K spot optic that prevents disturbing sleeping partners.",
      care_guide: "Wipe with dry microfiber cloth. Flex arm gently into desired orientation.",
      shipping_info: "Standard express courier delivery.",
      return_info: "14-day hassle-free return guarantee.",
      brand: "Atelier Glow",
      category_id: gooseneckLampId,
      hasVariants: true,
      pricing: { price: 6800, currency: "PKR" },
      inventory: { sku: "LAMP-ORI-BASE", stock_quantity: 30, stock_status: "in_stock" },
      shipping: { weight: 1.9, dimensions: { length: 18, width: 18, height: 42, unit: "cm" }, requires_shipping: true, is_fragile: false },
      variantOptions: [
        {
          name: "body finish",
          displayName: "Body Finish",
          values: ["Brushed Brass", "Matte Obsidian Black", "Antique Copper"],
          position: 0,
        },
      ],
      variants: [
        {
          sku: "LAMP-ORI-BRS",
          attributes: [{ name: "body finish", value: "Brushed Brass" }],
          price: 7200,
          compareAtPrice: 8500,
          stockQuantity: 12,
          isAvailable: true,
          position: 0,
        },
        {
          sku: "LAMP-ORI-BLK",
          attributes: [{ name: "body finish", value: "Matte Obsidian Black" }],
          price: 6800,
          compareAtPrice: 8000,
          stockQuantity: 10,
          isAvailable: true,
          position: 1,
        },
        {
          sku: "LAMP-ORI-COPPER",
          attributes: [{ name: "body finish", value: "Antique Copper" }],
          price: 7400,
          compareAtPrice: 8800,
          stockQuantity: 8,
          isAvailable: true,
          position: 2,
        },
      ],
      seo: {
        meta_title: "Orion Flexible Gooseneck Reading Lamp | Bedside Spot Luminaire",
        meta_description: "Heavy-duty flexible gooseneck bedside reading lamp with focused warm light.",
        slug: "orion-flexible-gooseneck-reading-lamp",
      },
      created_by: adminId,
    },

    // =========================================================================
    // 15. VARIABLE PRODUCT - Gooseneck Lamp
    // =========================================================================
    {
      name: "Meridian Dual-Joint Articulated Gooseneck Lamp",
      description:
        "Combines rigid solid brass extension tubes with a flexible braided steel gooseneck neck. Built with an integrated USB-C fast charging port in the solid weighted base for modern convenience.",
      care_guide: "Keep base ports dry. Clean exterior metal with dry cloth.",
      shipping_info: "Dispatched in reinforced protective casing with power adapter.",
      return_info: "14-day returns supported.",
      brand: "Lumina Studio",
      category_id: gooseneckLampId,
      hasVariants: true,
      pricing: { price: 8900, currency: "PKR" },
      inventory: { sku: "LAMP-MER-BASE", stock_quantity: 16, stock_status: "in_stock" },
      shipping: { weight: 2.3, dimensions: { length: 20, width: 20, height: 50, unit: "cm" }, requires_shipping: true, is_fragile: false },
      variantOptions: [
        {
          name: "style",
          displayName: "Style",
          values: ["Satin Champagne Brass", "Industrial Raw Steel"],
          position: 0,
        },
      ],
      variants: [
        {
          sku: "LAMP-MER-BRS",
          attributes: [{ name: "style", value: "Satin Champagne Brass" }],
          price: 9400,
          compareAtPrice: 11200,
          stockQuantity: 9,
          isAvailable: true,
          position: 0,
        },
        {
          sku: "LAMP-MER-STL",
          attributes: [{ name: "style", value: "Industrial Raw Steel" }],
          price: 8900,
          compareAtPrice: 10500,
          stockQuantity: 7,
          isAvailable: true,
          position: 1,
        },
      ],
      seo: {
        meta_title: "Meridian Dual-Joint Gooseneck Lamp | USB-C Desk Luminaire",
        meta_description: "Articulated gooseneck desk lamp with integrated USB-C charging port.",
        slug: "meridian-dual-joint-articulated-gooseneck-lamp",
      },
      created_by: adminId,
    },

    // =========================================================================
    // 16. VARIABLE PRODUCT - Pendant Lamp
    // =========================================================================
    {
      name: "Celeste Hammered Brass Dome Pendant",
      description:
        "Hand-hammered solid brass dome creating thousands of miniature reflective facets that scatter an opulent, shimmering golden light downward. Supplied with 2 meters of adjustable matching braided fabric cable.",
      care_guide: "Wipe interior and exterior with soft microfiber cloth. Avoid ammonia-based cleaners.",
      shipping_info: "Protective double-boxed freight delivery.",
      return_info: "14-day satisfaction return policy.",
      brand: "Atelier Glow",
      category_id: pendantLampId,
      hasVariants: true,
      pricing: { price: 11000, currency: "PKR" },
      inventory: { sku: "LAMP-CEL-BASE", stock_quantity: 20, stock_status: "in_stock" },
      shipping: { weight: 3.2, dimensions: { length: 45, width: 45, height: 30, unit: "cm" }, requires_shipping: true, is_fragile: true },
      variantOptions: [
        {
          name: "shade size",
          displayName: "Shade Size",
          values: ["Compact 30cm Diameter", "Grand 45cm Diameter", "Statement 60cm Diameter"],
          position: 0,
        },
      ],
      variants: [
        {
          sku: "LAMP-CEL-30CM",
          attributes: [{ name: "shade size", value: "Compact 30cm Diameter" }],
          price: 11000,
          compareAtPrice: 13200,
          stockQuantity: 8,
          isAvailable: true,
          position: 0,
        },
        {
          sku: "LAMP-CEL-45CM",
          attributes: [{ name: "shade size", value: "Grand 45cm Diameter" }],
          price: 15800,
          compareAtPrice: 18900,
          stockQuantity: 7,
          isAvailable: true,
          position: 1,
        },
        {
          sku: "LAMP-CEL-60CM",
          attributes: [{ name: "shade size", value: "Statement 60cm Diameter" }],
          price: 21500,
          compareAtPrice: 25000,
          stockQuantity: 5,
          isAvailable: true,
          position: 2,
        },
      ],
      seo: {
        meta_title: "Celeste Hammered Brass Dome Pendant | Handcrafted Ceiling Fixture",
        meta_description: "Artisanal hand-hammered brass dome pendant ceiling luminaire in multiple diameters.",
        slug: "celeste-hammered-brass-dome-pendant",
      },
      created_by: adminId,
    },

    // =========================================================================
    // 17. VARIABLE PRODUCT - Pendant Lamp
    // =========================================================================
    {
      name: "Acantha Multi-Tier Smoked Glass Pendant",
      description:
        "Mouth-blown fluted glass pendant with solid brass finials. The vertical optical ribbing refracts filament bulb reflections into soft ribbons of light across dining tables and stairwells.",
      care_guide: "Clean glass shades with standard glass cleaner applied to microfiber cloth.",
      shipping_info: "Individually molded high-density foam packaging for glass safety.",
      return_info: "14-day satisfaction return guarantee.",
      brand: "Palazzo Luxury",
      category_id: pendantLampId,
      hasVariants: true,
      pricing: { price: 9800, currency: "PKR" },
      inventory: { sku: "LAMP-ACAN-BASE", stock_quantity: 18, stock_status: "in_stock" },
      shipping: { weight: 2.8, dimensions: { length: 28, width: 28, height: 35, unit: "cm" }, requires_shipping: true, is_fragile: true },
      variantOptions: [
        {
          name: "glass tint",
          displayName: "Glass Tint",
          values: ["Warm Amber Honey", "Smoked Charcoal Grey", "Optic Clear Ribbed"],
          position: 0,
        },
      ],
      variants: [
        {
          sku: "LAMP-ACAN-AMBER",
          attributes: [{ name: "glass tint", value: "Warm Amber Honey" }],
          price: 10400,
          compareAtPrice: 12500,
          stockQuantity: 7,
          isAvailable: true,
          position: 0,
        },
        {
          sku: "LAMP-ACAN-SMOKE",
          attributes: [{ name: "glass tint", value: "Smoked Charcoal Grey" }],
          price: 10400,
          compareAtPrice: 12500,
          stockQuantity: 6,
          isAvailable: true,
          position: 1,
        },
        {
          sku: "LAMP-ACAN-CLEAR",
          attributes: [{ name: "glass tint", value: "Optic Clear Ribbed" }],
          price: 9800,
          compareAtPrice: 11800,
          stockQuantity: 5,
          isAvailable: true,
          position: 2,
        },
      ],
      seo: {
        meta_title: "Acantha Multi-Tier Smoked Glass Pendant | Handblown Ceiling Lamp",
        meta_description: "Mouth-blown fluted ribbed glass pendant ceiling light with brass accents.",
        slug: "acantha-multi-tier-smoked-glass-pendant",
      },
      created_by: adminId,
    },

    // =========================================================================
    // 18. VARIABLE PRODUCT - Tiffany Lamp
    // =========================================================================
    {
      name: "Verona Dragonfly Stained Glass Tiffany Lamp",
      description:
        "Meticulously assembled using the authentic Louis Comfort Tiffany copper foil method with over 320 hand-cut art glass pieces and glass cabochon gems. Weighted heavy cast bronze dragonfly relief base.",
      care_guide: "Wipe stained glass shade with lemon oil-treated cloth to maintain vibrant glass luster.",
      shipping_info: "Double-boxed with custom die-cut foam protection for delicate glasswork.",
      return_info: "14-day return satisfaction policy.",
      brand: "Tiffany Heritage",
      category_id: tiffanyLampId,
      hasVariants: true,
      pricing: { price: 17800, currency: "PKR" },
      inventory: { sku: "LAMP-VER-BASE", stock_quantity: 10, stock_status: "in_stock" },
      shipping: { weight: 5.8, dimensions: { length: 42, width: 42, height: 58, unit: "cm" }, requires_shipping: true, is_fragile: true },
      variantOptions: [
        {
          name: "palette",
          displayName: "Stained Glass Palette",
          values: ["Emerald Lagoon Green", "Sunset Crimson Gold"],
          position: 0,
        },
      ],
      variants: [
        {
          sku: "LAMP-VER-EMERALD",
          attributes: [{ name: "palette", value: "Emerald Lagoon Green" }],
          price: 17800,
          compareAtPrice: 21000,
          stockQuantity: 5,
          isAvailable: true,
          position: 0,
        },
        {
          sku: "LAMP-VER-SUNSET",
          attributes: [{ name: "palette", value: "Sunset Crimson Gold" }],
          price: 18500,
          compareAtPrice: 22000,
          stockQuantity: 5,
          isAvailable: true,
          position: 1,
        },
      ],
      seo: {
        meta_title: "Verona Dragonfly Stained Glass Tiffany Lamp | Authentic Art Glass",
        meta_description: "Handcrafted dragonfly stained glass Tiffany table lamp with bronze base.",
        slug: "verona-dragonfly-stained-glass-tiffany-lamp",
      },
      created_by: adminId,
    },

    // =========================================================================
    // 19. VARIABLE PRODUCT - Tiffany Lamp
    // =========================================================================
    {
      name: "Montclaire Art Nouveau Floral Tiffany Table Lamp",
      description:
        "Featuring sweeping Art Nouveau botanical motifs with rich opalescent stained glass petals and rippled water glass borders. Fitted with dual heritage pull chains with solid brass acorn weighted fobs.",
      care_guide: "Dust gently with feather duster or soft dry brush. Polish bronze base periodically.",
      shipping_info: "Protective molded foam crating.",
      return_info: "14-day return satisfaction guarantee.",
      brand: "Tiffany Heritage",
      category_id: tiffanyLampId,
      hasVariants: true,
      pricing: { price: 16500, currency: "PKR" },
      inventory: { sku: "LAMP-MON-BASE", stock_quantity: 12, stock_status: "in_stock" },
      shipping: { weight: 5.2, dimensions: { length: 40, width: 40, height: 55, unit: "cm" }, requires_shipping: true, is_fragile: true },
      variantOptions: [
        {
          name: "base patina",
          displayName: "Base Patina",
          values: ["Classic Antique Bronze", "Aged Verdigris Green"],
          position: 0,
        },
      ],
      variants: [
        {
          sku: "LAMP-MON-BRONZE",
          attributes: [{ name: "base patina", value: "Classic Antique Bronze" }],
          price: 16500,
          compareAtPrice: 19500,
          stockQuantity: 7,
          isAvailable: true,
          position: 0,
        },
        {
          sku: "LAMP-MON-VERDI",
          attributes: [{ name: "base patina", value: "Aged Verdigris Green" }],
          price: 17200,
          compareAtPrice: 20000,
          stockQuantity: 5,
          isAvailable: true,
          position: 1,
        },
      ],
      seo: {
        meta_title: "Montclaire Art Nouveau Floral Tiffany Lamp | Handcrafted Stained Glass",
        meta_description: "Art Nouveau floral stained glass table lamp with dual pull chains.",
        slug: "montclaire-art-nouveau-floral-tiffany-table-lamp",
      },
      created_by: adminId,
    },

    // =========================================================================
    // 20. VARIABLE PRODUCT - Tiffany Lamp
    // =========================================================================
    {
      name: "Wisteria Hand-Cut Glass Mosaic Tiffany Floor Lamp",
      description:
        "A monumental statement floor lamp featuring cascading clusters of over 600 hand-soldered stained glass wisteria blossoms. The tree trunk-inspired cast bronze base rises gracefully to crown this museum-quality luminaire.",
      care_guide: "Dust shade with soft camel-hair brush. Clean bronze trunk with microfiber cloth.",
      shipping_info: "Dispatched in reinforced wooden-framed crate. White-glove delivery available.",
      return_info: "14-day return guarantee.",
      brand: "Tiffany Heritage",
      category_id: tiffanyLampId,
      hasVariants: true,
      pricing: { price: 28500, currency: "PKR" },
      inventory: { sku: "LAMP-WIS-BASE", stock_quantity: 6, stock_status: "in_stock" },
      shipping: { weight: 14.5, dimensions: { length: 55, width: 55, height: 168, unit: "cm" }, requires_shipping: true, is_fragile: true },
      variantOptions: [
        {
          name: "blossom shade",
          displayName: "Blossom Shade",
          values: ["Cobalt Blue & Violet Cascade", "Amber & Honey Blossom"],
          position: 0,
        },
      ],
      variants: [
        {
          sku: "LAMP-WIS-COBALT",
          attributes: [{ name: "blossom shade", value: "Cobalt Blue & Violet Cascade" }],
          price: 28500,
          compareAtPrice: 34000,
          stockQuantity: 3,
          isAvailable: true,
          position: 0,
        },
        {
          sku: "LAMP-WIS-AMBER",
          attributes: [{ name: "blossom shade", value: "Amber & Honey Blossom" }],
          price: 28500,
          compareAtPrice: 34000,
          stockQuantity: 3,
          isAvailable: true,
          position: 1,
        },
      ],
      seo: {
        meta_title: "Wisteria Mosaic Stained Glass Tiffany Floor Lamp | Museum Luminaire",
        meta_description: "Grand wisteria stained glass mosaic floor lamp with tree trunk cast bronze base.",
        slug: "wisteria-hand-cut-glass-mosaic-tiffany-floor-lamp",
      },
      created_by: adminId,
    },
  ];

  console.log(`Starting insertion of ${productsData.length} products...`);

  let count = 0;
  for (const item of productsData) {
    // Check if product with this slug exists
    const existing = await (Product as any).findOne({ "seo.slug": item.seo.slug });
    if (existing) {
      console.log(`- Product "${item.name}" already exists (${item.seo.slug}), skipping.`);
      continue;
    }

    const product = new Product(item);
    await product.save();
    count++;
    console.log(`+ Added [${count}/20] "${product.name}" (Variants: ${item.hasVariants ? item.variants?.length : 0})`);
  }

  // Update all category product counts
  console.log("Updating category product counts...");
  for (const catId of Object.values(categoryMap)) {
    const cat = await (Category as any).findById(catId);
    if (cat) {
      await cat.updateProductCount();
      console.log(`  * Updated category "${cat.name}" count -> ${cat.product_count}`);
    }
  }

  console.log(`\nSuccessfully finished adding ${count} new lamps! Total products seeded.`);
  await mongoose.disconnect();
}

seedProducts().catch((err) => {
  console.error("Seeding error:", err);
  process.exit(1);
});
