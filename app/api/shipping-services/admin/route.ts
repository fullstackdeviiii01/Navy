// app/api/shipping-services/admin/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getIdTokenFromHeader, verifyIdToken } from "../../../../lib/auth";
import connectDB from "../../../../lib/db";
import ShippingService from "../../../models/ShippingService";
import User from "../../../models/User";

export async function GET(request: NextRequest) {
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

    const user = await (User as any).findOne({ email: decodedToken.email });
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 403 }
      );
    }

    const services = await ShippingService.find()
      .sort({ sort_order: 1, created_at: -1 })
      .lean();

    return NextResponse.json({ services });
  } catch (error) {
    console.error("Fetch shipping services failed:", error);
    return NextResponse.json(
      { error: "Failed to fetch shipping services" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    const user = await (User as any).findOne({ email: decodedToken.email });
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      name,
      display_name,
      description,
      base_price,
      currency,
      estimated_days_min,
      estimated_days_max,
      is_active,
      is_standard,
      sort_order,
    } = body;

    if (!name || !display_name || base_price === undefined) {
      return NextResponse.json(
        { error: "Name, display name, and base price are required" },
        { status: 400 }
      );
    }

    const existingService = await ShippingService.findOne({ name });
    if (existingService) {
      return NextResponse.json(
        { error: "Shipping service with this name already exists" },
        { status: 400 }
      );
    }

    // If this new service is marked as standard, unmark all other services
    if (is_standard) {
      await ShippingService.updateMany(
        { is_standard: true },
        { $set: { is_standard: false } }
      );
    }

    const service = new ShippingService({
      name,
      display_name,
      description,
      base_price,
      currency: currency || "PKR",
      estimated_days_min,
      estimated_days_max,
      is_active: is_active !== undefined ? is_active : true,
      is_standard: Boolean(is_standard),
      sort_order: sort_order !== undefined ? sort_order : 0,
    });

    await service.save();

    return NextResponse.json({
      success: true,
      message: "Shipping service created successfully",
      service,
    });
  } catch (error: any) {
    console.error("Create shipping service failed:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create shipping service" },
      { status: 500 }
    );
  }
}