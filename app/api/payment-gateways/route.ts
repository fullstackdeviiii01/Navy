// app/api/admin/payment-gateways/route.js
import { NextRequest, NextResponse } from "next/server";
import { getIdTokenFromHeader, verifyIdToken } from "../../../lib/auth";
import connectDB from "../../../lib/db";
import PaymentGateway from "../../models/PaymentGateway";
import User from "../../models/User";

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
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const gateways = await (PaymentGateway as any).find()
      .select("-credentials")
      .sort({ created_at: -1 });

    return NextResponse.json({ gateways });
  } catch (error) {
    console.error("Payment gateways fetch failed:", error);
    return NextResponse.json(
      { error: "Failed to fetch payment gateways" },
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
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const body = await request.json();
    const { name, ...updateData } = body;

    let gateway = await (PaymentGateway as any).findOne({ name });

    if (gateway) {
      Object.keys(updateData).forEach((key) => {
        if (key === "credentials" && updateData[key]) {
          gateway.credentials = {
            ...gateway.credentials,
            ...updateData[key],
          };
        } else if (key === "settings" && updateData[key]) {
          gateway.settings = {
            ...gateway.settings,
            ...updateData[key],
          };
        } else {
          gateway[key] = updateData[key];
        }
      });
      gateway.updated_by = user._id;
      await gateway.save();
    } else {
      gateway = new PaymentGateway({
        ...body,
        created_by: user._id,
      });
      await gateway.save();
    }

    const safeGateway = gateway.toObject();
    delete safeGateway.credentials;

    return NextResponse.json({
      success: true,
      message: gateway ? "Gateway updated successfully" : "Gateway created successfully",
      gateway: safeGateway,
    });
  } catch (error) {
    console.error("Payment gateway save failed:", error);
    return NextResponse.json(
      { error: "Failed to save payment gateway" },
      { status: 500 }
    );
  }
}