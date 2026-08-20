// app/api/admin/payment-gateways/[name]/route.js
import { NextRequest, NextResponse } from "next/server";
import { getIdTokenFromHeader, verifyIdToken } from "../../../../lib/auth";
import connectDB from "../../../../lib/db";
import PaymentGateway from "../../../models/PaymentGateway";
import User from "../../../models/User";

// GET - Fetch single gateway (with credentials for editing)
export async function GET(request, { params }) {
  try {
    const { name } = await params;
    const token = getIdTokenFromHeader(request);
    
    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    const decodedToken = await verifyIdToken(token);
    if (!decodedToken) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    await connectDB();

    const user = await User.findOne({ email: decodedToken.email });
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const gateway = await PaymentGateway.findOne({ name });

    if (!gateway) {
      return NextResponse.json({ error: "Gateway not found" }, { status: 404 });
    }

    return NextResponse.json({ gateway });
  } catch (error) {
    console.error("Payment gateway fetch failed:", error);
    return NextResponse.json(
      { error: "Failed to fetch payment gateway" },
      { status: 500 }
    );
  }
}

// DELETE - Delete gateway
export async function DELETE(request, { params }) {
  try {
    const { name } = await params;
    const token = getIdTokenFromHeader(request);
    
    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    const decodedToken = await verifyIdToken(token);
    if (!decodedToken) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    await connectDB();

    const user = await User.findOne({ email: decodedToken.email });
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const gateway = await PaymentGateway.findOneAndDelete({ name });

    if (!gateway) {
      return NextResponse.json({ error: "Gateway not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Gateway deleted successfully",
    });
  } catch (error) {
    console.error("Payment gateway deletion failed:", error);
    return NextResponse.json(
      { error: "Failed to delete payment gateway" },
      { status: 500 }
    );
  }
}