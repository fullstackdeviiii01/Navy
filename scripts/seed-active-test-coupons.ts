import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import mongoose from "mongoose";
import Coupon from "../app/models/Coupon";
import Category from "../app/models/Category";
import User from "../app/models/User";

async function seedCoupons() {
  await mongoose.connect(process.env.MONGODB_URI!);

  // Find admin user to assign created_by
  let adminUser = await (User as any).findOne({ role: "admin" });
  if (!adminUser) {
    adminUser = await (User as any).findOne();
  }

  if (!adminUser) {
    console.error("No user found in database");
    process.exit(1);
  }

  const floorCategory = await (Category as any).findOne({ slug: "floor-lamp" });
  const tableCategory = await (Category as any).findOne({ slug: "table-lamp" });
  const candleCategory = await (Category as any).findOne({ slug: "candle-holders" });
  const pendantCategory = await (Category as any).findOne({ slug: "pendant-lamp" });

  const now = new Date();
  const validUntil = new Date();
  validUntil.setFullYear(now.getFullYear() + 1); // Valid for 1 year

  const couponTemplates = [
    {
      code: "WELCOME10",
      description: "Welcome to Talal Wooden Lamps",
      discount_type: "percentage",
      discount_value: 10,
      min_order_amount: 5000,
      max_discount: 3000,
      valid_from: now,
      valid_until: validUntil,
      usage_limit: 500,
      per_user_limit: 1,
      applicable_to: {
        type: "all",
        category_ids: [],
        product_ids: [],
      },
      is_active: true,
      show_on_products: true,
      created_by: adminUser._id,
    },
    {
      code: "FLOOR15",
      description: "Artisan Standing Floor Luminaires Special",
      discount_type: "percentage",
      discount_value: 15,
      min_order_amount: 8000,
      max_discount: 5000,
      valid_from: now,
      valid_until: validUntil,
      usage_limit: 300,
      per_user_limit: 2,
      applicable_to: {
        type: "categories",
        category_ids: floorCategory ? [floorCategory._id] : [],
        product_ids: [],
      },
      is_active: true,
      show_on_products: true,
      created_by: adminUser._id,
    },
    {
      code: "TABLE12",
      description: "Handcrafted Table & Bedside Lamps Promotion",
      discount_type: "percentage",
      discount_value: 12,
      min_order_amount: 4000,
      max_discount: 2500,
      valid_from: now,
      valid_until: validUntil,
      usage_limit: 300,
      per_user_limit: 2,
      applicable_to: {
        type: "categories",
        category_ids: tableCategory ? [tableCategory._id] : [],
        product_ids: [],
      },
      is_active: true,
      show_on_products: true,
      created_by: adminUser._id,
    },
    {
      code: "CANDLE500",
      description: "Lathe-Turned Timber Candle Holders Offer",
      discount_type: "fixed",
      discount_value: 500,
      min_order_amount: 2500,
      max_discount: 500,
      valid_from: now,
      valid_until: validUntil,
      usage_limit: 200,
      per_user_limit: 2,
      applicable_to: {
        type: "categories",
        category_ids: candleCategory ? [candleCategory._id] : [],
        product_ids: [],
      },
      is_active: true,
      show_on_products: true,
      created_by: adminUser._id,
    },
    {
      code: "PENDANT20",
      description: "Architectural Beam & Pendant Lighting Discount",
      discount_type: "percentage",
      discount_value: 20,
      min_order_amount: 10000,
      max_discount: 6000,
      valid_from: now,
      valid_until: validUntil,
      usage_limit: 150,
      per_user_limit: 1,
      applicable_to: {
        type: "categories",
        category_ids: pendantCategory ? [pendantCategory._id] : [],
        product_ids: [],
      },
      is_active: true,
      show_on_products: true,
      created_by: adminUser._id,
    },
  ];

  console.log("Seeding test coupons...");

  for (const t of couponTemplates) {
    const existing = await (Coupon as any).findOne({ code: t.code });
    if (existing) {
      Object.assign(existing, t);
      await existing.save();
      console.log(`✓ Updated coupon: ${t.code}`);
    } else {
      const newCoupon = new Coupon(t);
      await newCoupon.save();
      console.log(`✓ Created coupon: ${t.code}`);
    }
  }

  console.log("\nAll 5 test coupons seeded and activated successfully!");
  await mongoose.disconnect();
}

seedCoupons().catch((err) => {
  console.error(err);
  process.exit(1);
});
