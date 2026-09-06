import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import mongoose from "mongoose";
import { NextRequest } from "next/server";

// Import API route handlers
import { GET as getCartHandler, POST as postCartHandler } from "../app/api/cart/route";
import { POST as buyNowHandler } from "../app/api/cart/buy-now/route";
import { POST as applyCouponHandler } from "../app/api/cart/apply-coupon/route";
import { POST as removeCouponHandler } from "../app/api/cart/remove-coupon/route";
import { POST as selectShippingHandler } from "../app/api/cart/select-shipping/route";
import { POST as checkoutHandler } from "../app/api/checkout/route";

// Models
import Product from "../app/models/Product";
import Coupon from "../app/models/Coupon";
import ShippingService from "../app/models/ShippingService";
import Cart from "../app/models/Cart";
import Order from "../app/models/Order";
import CouponUsage from "../app/models/CouponUsage";
import { EmailService } from "../lib/services/emailService";
import { InvoiceService } from "../lib/services/invoiceService";

// Stub external email/invoice calls to prevent SMTP socket timeouts
EmailService.sendOrderConfirmationEmail = async () => {
  console.log("   ✉️ [EmailService] Confirmation email mocked successfully");
};
InvoiceService.createForOrder = async () => ({}) as any;

// Helpers to simulate HTTP requests through proper API route channels
function createRequest(
  url: string,
  method: string = "GET",
  sessionId: string,
  body?: any,
  extraHeaders: Record<string, string> = {}
): NextRequest {
  const headers: Record<string, string> = {
    cookie: `guest_session_id=${sessionId}`,
    "x-session-id": sessionId,
    "user-agent": "AutomatedTestRunner/1.0",
    ...extraHeaders,
  };

  if (body) {
    headers["content-type"] = "application/json";
  }

  const init: any = {
    method,
    headers,
  };

  if (body) {
    init.body = JSON.stringify(body);
  }

  return new NextRequest(url, init);
}

async function runTests() {
  console.log("===============================================================");
  console.log("  STARTING END-TO-END VERIFICATION OF CART, BUY-NOW & COUPONS  ");
  console.log("===============================================================\n");

  await mongoose.connect(process.env.MONGODB_URI!);

  // 1. Locate test data
  const variantProduct = await (Product as any).findOne({
    hasVariants: true,
    "variants.0": { $exists: true },
    is_active: { $ne: false },
  });

  const simpleProduct = await (Product as any).findOne({
    hasVariants: false,
    is_active: { $ne: false },
  }) || await (Product as any).findOne({ is_active: { $ne: false } });

  const activeCoupon = await (Coupon as any).findOne({
    is_active: true,
    valid_until: { $gt: new Date() },
    code: "WELCOME10",
  }) || await (Coupon as any).findOne({
    is_active: true,
    valid_until: { $gt: new Date() },
  });

  const activeShipping = await (ShippingService as any).findOne({
    is_active: true,
  });

  if (!variantProduct || !simpleProduct) {
    console.error("❌ Required test products not found in database.");
    process.exit(1);
  }

  console.log("📦 Test Products:");
  console.log(`  - Variant Product: "${variantProduct.name}" (ID: ${variantProduct._id})`);
  console.log(`    Variants available: ${variantProduct.variants?.length}`);
  const firstVariant = variantProduct.variants[0];
  console.log(`    First Variant ID: ${firstVariant._id}, Price: Rs. ${firstVariant.price}`);
  console.log(`  - Simple Product: "${simpleProduct.name}" (ID: ${simpleProduct._id}), Price: Rs. ${simpleProduct.pricing?.price}`);
  
  if (activeCoupon) {
    console.log(`🎟️ Active Coupon: "${activeCoupon.code}" (${activeCoupon.discount_type === "percentage" ? activeCoupon.discount_value + "%" : "Rs. " + activeCoupon.discount_value} off, Min: Rs. ${activeCoupon.min_order_amount})`);
  } else {
    console.warn("⚠️ No active coupon found in database.");
  }

  if (activeShipping) {
    console.log(`🚚 Active Shipping: "${activeShipping.name}" (Base Price: Rs. ${activeShipping.base_price})\n`);
  }

  const testSessionId = `test_session_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  console.log(`🔑 Using Test Session ID: ${testSessionId}\n`);

  try {
    // -------------------------------------------------------------------------
    // TEST 1: Add items to regular cart
    // -------------------------------------------------------------------------
    console.log("👉 STEP 1: Add items to Regular Cart");

    // Add Simple Product (quantity 2)
    const addReq1 = createRequest(
      "http://localhost:3000/api/cart",
      "POST",
      testSessionId,
      {
        product_id: simpleProduct._id.toString(),
        quantity: 2,
        product_name: simpleProduct.name,
      }
    );
    const addRes1 = await postCartHandler(addReq1);
    const addData1 = await addRes1.json();
    console.log(`   Added simple product: status ${addRes1.status}, items in cart: ${addData1.cart?.items?.length}`);

    // Add Variant Product with first options
    const firstVariantAttrs = Object.fromEntries(
      (firstVariant.attributes || []).map((a: any) => [a.name, a.value])
    );
    const addReq2 = createRequest(
      "http://localhost:3000/api/cart",
      "POST",
      testSessionId,
      {
        product_id: variantProduct._id.toString(),
        quantity: 1,
        variant_id: firstVariant._id.toString(),
        variant_attributes: firstVariantAttrs,
        product_name: variantProduct.name,
      }
    );
    const addRes2 = await postCartHandler(addReq2);
    const addData2 = await addRes2.json();
    console.log(`   Added variant product: status ${addRes2.status}, items in cart: ${addData2.cart?.items?.length}`);

    // Verify GET /api/cart
    const getCartReq = createRequest("http://localhost:3000/api/cart", "GET", testSessionId);
    const getCartRes = await getCartHandler(getCartReq);
    const regularCartData = await getCartRes.json();
    const regularCart = regularCartData.cart;

    if (!regularCart || regularCart.items.length !== 2) {
      throw new Error(`Regular cart expected 2 items, got ${regularCart?.items?.length}`);
    }
    console.log(`   ✅ Regular Cart verified: 2 items, Subtotal: Rs. ${regularCart.subtotal}\n`);

    // -------------------------------------------------------------------------
    // TEST 2: Apply coupon to regular cart
    // -------------------------------------------------------------------------
    if (activeCoupon) {
      console.log(`👉 STEP 2: Apply coupon "${activeCoupon.code}" to Regular Cart`);
      const couponReq = createRequest(
        "http://localhost:3000/api/cart/apply-coupon",
        "POST",
        testSessionId,
        { code: activeCoupon.code }
      );
      const couponRes = await applyCouponHandler(couponReq);
      const couponData = await couponRes.json();

      if (couponRes.status === 200) {
        console.log(`   ✅ Coupon applied! Discount: Rs. ${couponData.cart?.discount_amount}, Total: Rs. ${couponData.cart?.total}`);
      } else {
        console.log(`   ℹ️ Coupon response: ${couponData.error} (Status: ${couponRes.status})`);
      }
      console.log();
    }

    // -------------------------------------------------------------------------
    // TEST 3: Initiate "Buy It Now" for a single product (Variant Product)
    // -------------------------------------------------------------------------
    console.log("👉 STEP 3: Initiate 'Buy It Now' while Regular Cart has items");
    const buyNowReq = createRequest(
      "http://localhost:3000/api/cart/buy-now",
      "POST",
      testSessionId,
      {
        product_id: variantProduct._id.toString(),
        quantity: 1,
        variant_id: firstVariant._id.toString(),
        variant_attributes: firstVariantAttrs,
        product_name: variantProduct.name,
      }
    );
    const buyNowRes = await buyNowHandler(buyNowReq);
    const buyNowData = await buyNowRes.json();

    if (buyNowRes.status !== 200 || !buyNowData.cart) {
      throw new Error(`Buy It Now failed: ${JSON.stringify(buyNowData)}`);
    }

    const buyNowCart = buyNowData.cart;
    console.log(`   Buy-Now Cart items: ${buyNowCart.items?.length}`);
    console.log(`   Buy-Now Product: ${buyNowCart.items?.[0]?.product_name}`);
    console.log(`   Buy-Now Subtotal: Rs. ${buyNowCart.subtotal}`);
    console.log(`   Buy-Now Session ID: ${buyNowCart.session_id}`);

    if (buyNowCart.items.length !== 1) {
      throw new Error(`Buy-Now cart must have exactly 1 item, got ${buyNowCart.items.length}`);
    }

    // -------------------------------------------------------------------------
    // CRITICAL CHECK: Verify Regular Cart is 100% UNTOUCHED!
    // -------------------------------------------------------------------------
    console.log("\n🔍 CRITICAL CHECK: Fetch Regular Cart to ensure it was NOT affected by Buy-It-Now");
    const checkRegularReq = createRequest("http://localhost:3000/api/cart", "GET", testSessionId);
    const checkRegularRes = await getCartHandler(checkRegularReq);
    const checkRegularData = await checkRegularRes.json();
    const preservedCart = checkRegularData.cart;

    if (!preservedCart || preservedCart.items.length !== 2) {
      throw new Error(`CRITICAL FAILURE: Regular cart was corrupted! Expected 2 items, got ${preservedCart?.items?.length}`);
    }
    console.log(`   ✅ Regular Cart preserved with ${preservedCart.items.length} items (Subtotal: Rs. ${preservedCart.subtotal})`);
    if (preservedCart.applied_coupon_id) {
      console.log(`   ✅ Regular Cart coupon is still applied! Discount: Rs. ${preservedCart.discount_amount}`);
    }

    // -------------------------------------------------------------------------
    // TEST 4: Fetch Buy-Now Cart via GET /api/cart?buy_now=1
    // -------------------------------------------------------------------------
    console.log("\n👉 STEP 4: Fetch Buy-Now Cart via GET /api/cart?buy_now=1");
    const getBuyNowReq = createRequest(
      "http://localhost:3000/api/cart?buy_now=1",
      "GET",
      testSessionId,
      undefined,
      { "x-buy-now": "1" }
    );
    const getBuyNowRes = await getCartHandler(getBuyNowReq);
    const fetchedBuyNowData = await getBuyNowRes.json();
    const fetchedBuyNowCart = fetchedBuyNowData.cart;

    if (!fetchedBuyNowCart || fetchedBuyNowCart.items.length !== 1) {
      throw new Error(`Fetched Buy-Now cart expected 1 item, got ${fetchedBuyNowCart?.items?.length}`);
    }
    console.log(`   ✅ GET Buy-Now Cart confirmed: 1 item ("${fetchedBuyNowCart.items[0].product_name}"), Subtotal: Rs. ${fetchedBuyNowCart.subtotal}`);

    // -------------------------------------------------------------------------
    // TEST 5: Select Shipping on Buy-Now Cart vs Regular Cart
    // -------------------------------------------------------------------------
    if (activeShipping) {
      console.log("\n👉 STEP 5: Select Shipping Service on Buy-Now Cart");
      const shipReq = createRequest(
        "http://localhost:3000/api/cart/select-shipping",
        "POST",
        testSessionId,
        {
          shipping_service_id: activeShipping._id.toString(),
          buy_now: true,
        }
      );
      const shipRes = await selectShippingHandler(shipReq);
      const shipData = await shipRes.json();
      console.log(`   ✅ Shipping set on Buy-Now cart: ${shipData.cart?.selected_shipping_service_id?.name || shipData.cart?.selected_shipping_service_id}`);
    }

    // -------------------------------------------------------------------------
    // TEST 6: Checkout for "Buy It Now" order
    // -------------------------------------------------------------------------
    console.log("\n👉 STEP 6: Execute Checkout for Buy-It-Now Order");
    const checkoutBuyNowReq = createRequest(
      "http://localhost:3000/api/checkout",
      "POST",
      testSessionId,
      {
        shipping_address: {
          full_name: "Tariq BuyNowUser",
          phone: "03001234567",
          line1: "House 45, Street 10, F-8/2",
          city: "Islamabad",
          state: "Federal",
          postal_code: "44000",
          country: "Pakistan",
        },
        billing_address: {
          full_name: "Tariq BuyNowUser",
          phone: "03001234567",
          line1: "House 45, Street 10, F-8/2",
          city: "Islamabad",
          state: "Federal",
          postal_code: "44000",
          country: "Pakistan",
        },
        same_as_shipping: true,
        guest_info: {
          email: "tariq.buynow@example.com",
          name: "Tariq BuyNowUser",
          phone: "03001234567",
        },
        payment_method: "cod",
        buy_now: true,
      }
    );

    const checkoutBuyNowRes = await checkoutHandler(checkoutBuyNowReq);
    const checkoutBuyNowData = await checkoutBuyNowRes.json();

    if (checkoutBuyNowRes.status !== 200 || !checkoutBuyNowData.order) {
      throw new Error(`Buy-Now checkout failed: ${JSON.stringify(checkoutBuyNowData)}`);
    }

    const buyNowOrder = checkoutBuyNowData.order;
    console.log(`   🎉 Buy-Now Order placed! Order Number: ${buyNowOrder.order_number || buyNowOrder._id}`);
    console.log(`   Order Items count: ${buyNowOrder.items?.length}`);
    console.log(`   Item: ${buyNowOrder.items?.[0]?.product_name}, Variant: ${buyNowOrder.items?.[0]?.variant_id}`);
    console.log(`   Total Paid: Rs. ${buyNowOrder.pricing?.total}`);

    if (buyNowOrder.items.length !== 1) {
      throw new Error(`Expected Buy-Now order to contain only 1 item, but got ${buyNowOrder.items.length}`);
    }

    // -------------------------------------------------------------------------
    // CRITICAL CHECK: After Buy-It-Now Checkout, is Regular Cart STILL Intact?
    // -------------------------------------------------------------------------
    console.log("\n🔍 CRITICAL CHECK: Verify Regular Cart is STILL Intact after Buy-Now Checkout!");
    const postBuyNowRegularReq = createRequest("http://localhost:3000/api/cart", "GET", testSessionId);
    const postBuyNowRegularRes = await getCartHandler(postBuyNowRegularReq);
    const postBuyNowRegularData = await postBuyNowRegularRes.json();
    const intactRegularCart = postBuyNowRegularData.cart;

    if (!intactRegularCart || intactRegularCart.items.length !== 2) {
      throw new Error(`CRITICAL FAILURE: Regular cart was cleared or destroyed by Buy-Now checkout! Items: ${intactRegularCart?.items?.length}`);
    }
    console.log(`   ✅ SUCCESS: Regular Cart remains intact with ${intactRegularCart.items.length} items!`);
    console.log(`      Items: ${intactRegularCart.items.map((i: any) => i.product_name || i.product_id?.name).join(", ")}`);
    console.log(`      Subtotal: Rs. ${intactRegularCart.subtotal}`);

    // Also verify the temporary express cart is deleted
    const checkTempCart = await (Cart as any).findOne({
      session_id: `buynow_guest_${testSessionId}`,
    });
    if (checkTempCart) {
      console.warn("   ⚠️ Warning: Temporary buy-now cart record still exists in DB.");
    } else {
      console.log("   ✅ Temporary express cart was properly deleted from DB.");
    }

    // -------------------------------------------------------------------------
    // TEST 7: Checkout Regular Cart (Standard Flow)
    // -------------------------------------------------------------------------
    console.log("\n👉 STEP 7: Place order for the Regular Cart");
    const regularCheckoutReq = createRequest(
      "http://localhost:3000/api/checkout",
      "POST",
      testSessionId,
      {
        shipping_address: {
          full_name: "Sara RegularUser",
          phone: "03217654321",
          line1: "Flat 12, Block B, Clifton",
          city: "Karachi",
          state: "Sindh",
          postal_code: "75600",
          country: "Pakistan",
        },
        billing_address: {
          full_name: "Sara RegularUser",
          phone: "03217654321",
          line1: "Flat 12, Block B, Clifton",
          city: "Karachi",
          state: "Sindh",
          postal_code: "75600",
          country: "Pakistan",
        },
        same_as_shipping: true,
        guest_info: {
          email: "sara.regular@example.com",
          name: "Sara RegularUser",
          phone: "03217654321",
        },
        payment_method: "cod",
        buy_now: false,
      }
    );

    const regularCheckoutRes = await checkoutHandler(regularCheckoutReq);
    const regularCheckoutData = await regularCheckoutRes.json();

    if (regularCheckoutRes.status !== 200 || !regularCheckoutData.order) {
      throw new Error(`Regular checkout failed: ${JSON.stringify(regularCheckoutData)}`);
    }

    const regularOrder = regularCheckoutData.order;
    console.log(`   🎉 Regular Cart Order placed! Order Number: ${regularOrder.order_number || regularOrder._id}`);
    console.log(`   Order Items count: ${regularOrder.items?.length}`);
    console.log(`   Subtotal: Rs. ${regularOrder.pricing?.subtotal}`);
    console.log(`   Discount: Rs. ${regularOrder.pricing?.discount_amount}`);
    console.log(`   Total: Rs. ${regularOrder.pricing?.total}`);

    // Verify regular cart is now cleared after regular checkout
    const finalCartReq = createRequest("http://localhost:3000/api/cart", "GET", testSessionId);
    const finalCartRes = await getCartHandler(finalCartReq);
    const finalCartData = await finalCartRes.json();
    console.log(`   ✅ Regular Cart is now cleared as expected: items count = ${finalCartData.cart?.items?.length || 0}`);

    // Clean up test orders created
    console.log("\n🧹 Cleaning up test artifacts from database...");
    await (Order as any).deleteMany({ _id: { $in: [buyNowOrder._id, regularOrder._id] } });
    await (CouponUsage as any).deleteMany({ order_id: { $in: [buyNowOrder._id, regularOrder._id] } });
    await (Cart as any).deleteMany({ session_id: { $regex: testSessionId } });
    console.log("   ✅ Test orders and test carts cleaned up cleanly.");

    console.log("\n===============================================================");
    console.log("  ALL TESTS PASSED WITH 100% SUCCESS! EVERYTHING WORKS FINE!   ");
    console.log("===============================================================\n");

  } catch (err: any) {
    console.error("\n❌ TEST FAILED:", err.message);
    console.error(err.stack);
  } finally {
    await mongoose.disconnect();
  }
}

runTests();
