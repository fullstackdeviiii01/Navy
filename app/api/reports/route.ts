// ============================================
// app/api/reports/route.ts
// ============================================
import { NextRequest, NextResponse } from "next/server";
import { getIdTokenFromHeader, verifyIdToken } from "../../../lib/auth";
import connectDB from "../../../lib/db";
import User from "../../models/User";
import { calculateDateRange, calculatePreviousPeriod } from "../../../lib/utils/reports/dateUtils";
import { generateSalesReport } from "../../../lib/utils/reports/services/salesReportService";
import { generateProductReport } from "../../../lib/utils/reports/services/productReportService";
import { generateCustomerReport } from "../../../lib/utils/reports/services/customerReportService";
import { generateInventoryReport } from "../../../lib/utils/reports/services/inventoryReportService";

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

    const adminUser = await (User as any).findOne({ email: decodedToken.email });
    if (!adminUser || adminUser.role !== "admin") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const url = new URL(request.url);
    const reportType = url.searchParams.get("type") || "sales";
    const startDate = url.searchParams.get("startDate");
    const endDate = url.searchParams.get("endDate");
    const range = url.searchParams.get("range") || "30d";

    const { start, end } = calculateDateRange(range, startDate, endDate);
    const { prevStart, prevEnd } = calculatePreviousPeriod(start, end);

    let reportData: any = {};

    switch (reportType) {
      case "sales":
        reportData = await generateSalesReport(start, end, prevStart, prevEnd);
        break;
      case "products":
        reportData = await generateProductReport(start, end);
        break;
      case "customers":
        reportData = await generateCustomerReport(start, end);
        break;
      case "inventory":
        reportData = await generateInventoryReport();
        break;
      default:
        return NextResponse.json({ error: "Invalid report type" }, { status: 400 });
    }

    return NextResponse.json({
      reportType,
      period: { start, end },
      previousPeriod: { start: prevStart, end: prevEnd },
      data: reportData,
    });
  } catch (error) {
    console.error("Report generation failed:", error);
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 }
    );
  }
}