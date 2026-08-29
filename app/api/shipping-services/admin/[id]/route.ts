// app/api/shipping-services/admin/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getIdTokenFromHeader, verifyIdToken } from "../../../../../lib/auth";
import connectDB from "../../../../../lib/db";
import ShippingService from "../../../../models/ShippingService";
import User from "../../../../models/User";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const service = await ShippingService.findById(id);

    if (!service) {
      return NextResponse.json(
        { error: "Shipping service not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ service });
  } catch (error) {
    console.error("Fetch shipping service failed:", error);
    return NextResponse.json(
      { error: "Failed to fetch shipping service" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const body = await request.json();

    const service = await ShippingService.findById(id);
    if (!service) {
      return NextResponse.json(
        { error: "Shipping service not found" },
        { status: 404 }
      );
    }

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

    if (name && name !== service.name) {
      const existingService = await ShippingService.findOne({ name });
      if (existingService) {
        return NextResponse.json(
          { error: "Shipping service with this name already exists" },
          { status: 400 }
        );
      }
      service.name = name;
    }

    if (display_name !== undefined) service.display_name = display_name;
    if (description !== undefined) service.description = description;
    if (base_price !== undefined) service.base_price = base_price;
    if (currency !== undefined) service.currency = currency;
    if (estimated_days_min !== undefined)
      service.estimated_days_min = estimated_days_min;
    if (estimated_days_max !== undefined)
      service.estimated_days_max = estimated_days_max;
    if (is_active !== undefined) service.is_active = is_active;
    if (sort_order !== undefined) service.sort_order = sort_order;

    if (is_standard !== undefined) {
      if (is_standard) {
        // Unmark all other services as standard
        await ShippingService.updateMany(
          { _id: { $ne: id }, is_standard: true },
          { $set: { is_standard: false } }
        );
        service.is_standard = true;
      } else {
        service.is_standard = false;
      }
    }

    await service.save();

    return NextResponse.json({
      success: true,
      message: "Shipping service updated successfully",
      service,
    });
  } catch (error: any) {
    console.error("Update shipping service failed:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update shipping service" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const service = await ShippingService.findById(id);

    if (!service) {
      return NextResponse.json(
        { error: "Shipping service not found" },
        { status: 404 }
      );
    }

    await ShippingService.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "Shipping service deleted successfully",
    });
  } catch (error) {
    console.error("Delete shipping service failed:", error);
    return NextResponse.json(
      { error: "Failed to delete shipping service" },
      { status: 500 }
    );
  }
}