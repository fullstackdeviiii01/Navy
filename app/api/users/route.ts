// app/api/users/route.ts
import { NextResponse } from "next/server";
import { getIdTokenFromHeader, verifyIdToken } from "../../../lib/auth";
import connectDB from "../../../lib/db";
import User from "../../models/User";
import Cart from "../../models/Cart";
import Product from "../../models/Product";

export async function GET(request: Request) {
  try {
    const token = getIdTokenFromHeader(request);

    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    const decodedToken = await verifyIdToken(token);

    if (!decodedToken) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    await connectDB();

    // Check if user is admin
    const adminUser = await (User as any).findOne({ email: decodedToken.email });
    if (!adminUser || adminUser.role !== "admin") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Get all users
    const users = await (User as any).find(
      {},
      {
        uid: 1,
        email: 1,
        name: 1,
        phone: 1,
        role: 1,
        is_active: 1,
        is_banned: 1,
        order_count: 1,
        total_spent: 1,
        customer_since: 1,
        last_login_at: 1,
        wishlist: 1,
        addresses: 1,
        login_history: 1,
        created_at: 1,
      }
    )
      .sort({ created_at: -1 })
      .lean();

    // Enrich users with populated Cart and Wishlist products
    const enrichedUsers = await Promise.all(
      users.map(async (user: any) => {
        // Fetch active cart from Cart model
        let cartItems: any[] = [];
        try {
          const userCart = await Cart.findOne({ user_id: user._id })
            .populate("items.product_id", "name pricing images")
            .lean();

          if (userCart && Array.isArray(userCart.items)) {
            cartItems = userCart.items
              .filter((item: any) => item && (item.product_id || item.product_name))
              .map((item: any) => ({
                product_id: item.product_id?._id || item.product_id,
                name: item.product_id?.name || item.product_name || "Lamp Item",
                price:
                  item.price ||
                  item.product_id?.pricing?.price ||
                  item.product_id?.price ||
                  0,
                quantity: item.quantity || 1,
                image:
                  item.product_id?.images?.[0]?.url ||
                  item.image ||
                  null,
              }));
          }
        } catch (cartErr) {
          console.error("Cart enrichment error for user:", user._id, cartErr);
        }

        // Fetch populated wishlist products
        let wishlistItems: any[] = [];
        try {
          if (Array.isArray(user.wishlist) && user.wishlist.length > 0) {
            const products = await (Product as any)
              .find({ _id: { $in: user.wishlist } }, "name pricing images")
              .lean();

            wishlistItems = products.map((p: any) => ({
              product_id: p._id,
              name: p.name,
              price: p.pricing?.price || p.price || 0,
              image: p.images?.[0]?.url || null,
            }));
          }
        } catch (wishErr) {
          console.error("Wishlist enrichment error for user:", user._id, wishErr);
        }

        return {
          ...user,
          cart: cartItems,
          wishlist: wishlistItems,
        };
      })
    );

    return NextResponse.json({ users: enrichedUsers });
  } catch (error) {
    console.error("Users fetch failed:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}
