// /**
//  * GET /api/cj/product?id=CJ_PID
//  *
//  * Fetches and returns a TRANSFORMED preview of a CJ Dropshipping product
//  * without saving it to the database.
//  * Mirrors GET /api/aliexpress/product exactly.
//  *
//  * Query params:
//  *   id  — CJ product pid  (e.g. "04A22450-67F0-4617-A132-E7AE7F8963B0")
//  *       — OR CJ productSku (e.g. "CJNSSYWY01847")
//  */

// import { NextRequest, NextResponse } from "next/server";
// import {
//   getIdTokenFromHeader,
//   verifyIdToken,
// } from "../../../../lib/auth";
// import connectDB from "../../../../lib/db";
// import User from "../../../models/User";
// import Product from "../../../models/Product";
// import { cjGet } from "../../../../lib/cj";
// import {
//   transformCJProduct,
//   CJProductDetail,
// } from "../../../../lib/cj/transformer";

// export async function GET(request: NextRequest) {
//   try {
//     // ── Auth ─────────────────────────────────────────────────────────────────
//     const token = getIdTokenFromHeader(request);
//     if (!token) {
//       return NextResponse.json({ error: "No token provided" }, { status: 401 });
//     }

//     const decodedToken = await verifyIdToken(token);
//     if (!decodedToken) {
//       return NextResponse.json({ error: "Invalid token" }, { status: 401 });
//     }

//     await connectDB();

//     const adminUser = await (User as any).findOne({ uid: decodedToken.uid });
//     if (!adminUser || adminUser.role !== "admin") {
//       return NextResponse.json({ error: "Access denied" }, { status: 403 });
//     }

//     // ── Parse query ───────────────────────────────────────────────────────────
//     const { searchParams } = new URL(request.url);
//     let id = searchParams.get("id") || "";

//     // Extract pid from CJ product URL if a full URL is pasted
//     const urlMatch = id.match(/\-p\-(\d+)\.html/);
//     if (urlMatch) {
//       id = urlMatch[1];
//     }

//     if (!id) {
//       return NextResponse.json(
//         { error: "id query parameter is required (CJ pid or product URL)" },
//         { status: 400 },
//       );
//     }

//     // ── Detect ID type: UUID pid vs productSku ────────────────────────────────
//     // CJ pids are UUIDs like "04A22450-67F0-4617-A132-E7AE7F8963B0" (36 chars)
//     // productSkus are alphanumeric like "CJNSSYWY01847"
//     const isUUID = /^[0-9a-fA-F-]{36}$/.test(id);

//     // ── Check if already imported ─────────────────────────────────────────────
//     const alreadyImported = await (Product as any)
//       .findOne({
//         $or: [{ "cj.productId": id }, { "cj.productSku": id }],
//       })
//       .select("_id name");

//     // ── Fetch raw data from CJ API ────────────────────────────────────────────
//     // Send as `pid` if UUID, otherwise send as `productSku`
//     const rawData: CJProductDetail = await cjGet("/product/query", {
//       ...(isUUID ? { pid: id } : { productSku: id }),
//       features: "enable_inventory",
//     });

//     // ── Transform for preview ─────────────────────────────────────────────────
//     const transformed = transformCJProduct(rawData);

//     return NextResponse.json({
//       success: true,
//       alreadyImported: alreadyImported
//         ? { _id: alreadyImported._id, name: alreadyImported.name }
//         : null,
//       data: transformed,
//     });
//   } catch (error: any) {
//     console.error("[CJ Preview] Failed:", error);
//     return NextResponse.json(
//       { error: error.message || "Failed to fetch product" },
//       { status: 500 },
//     );
//   }
// }

/**
 * GET /api/cj/product?id=CJ_PID
 *
 * Fetches and returns a TRANSFORMED preview of a CJ Dropshipping product
 * without saving it to the database.
 * Mirrors GET /api/aliexpress/product exactly.
 *
 * Query params:
 *   id  — CJ product pid  (e.g. "04A22450-67F0-4617-A132-E7AE7F8963B0")
 *       — OR CJ productSku (e.g. "CJNSSYWY01847")
 *       — OR CJ product URL (e.g. "https://www.cjdropshipping.com/product/...-p-1560487329956114432.html")
 *       — OR numeric pid   (e.g. "1560487329956114432")
 */

import { NextRequest, NextResponse } from "next/server";
import {
  getIdTokenFromHeader,
  verifyIdToken,
} from "../../../../lib/auth";
import connectDB from "../../../../lib/db";
import User from "../../../models/User";
import Product from "../../../models/Product";
import { cjGet } from "../../../../lib/cj";
import {
  transformCJProduct,
  CJProductDetail,
} from "../../../../lib/cj/transformer";

export async function GET(request: NextRequest) {
  try {
    // ── Auth ─────────────────────────────────────────────────────────────────
    const token = getIdTokenFromHeader(request);
    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    const decodedToken = await verifyIdToken(token);
    if (!decodedToken) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    await connectDB();

    const adminUser = await (User as any).findOne({ uid: decodedToken.uid });
    if (!adminUser || adminUser.role !== "admin") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // ── Parse query ───────────────────────────────────────────────────────────
    const { searchParams } = new URL(request.url);
    let id = searchParams.get("id") || "";

    // Extract pid from CJ product URL if a full URL is pasted
    // e.g. https://www.cjdropshipping.com/product/...-p-1560487329956114432.html
    let forceAsPid = false;
    const urlMatch = id.match(/\-p\-(\d+)\.html/);
    if (urlMatch) {
      id = urlMatch[1];
      forceAsPid = true; // numeric IDs extracted from URLs are always pids
    }

    if (!id) {
      return NextResponse.json(
        { error: "id query parameter is required (CJ pid, productSku, or product URL)" },
        { status: 400 },
      );
    }

    // ── Detect ID type ────────────────────────────────────────────────────────
    // UUID pid:      "04A22450-67F0-4617-A132-E7AE7F8963B0"  (36 chars with dashes)
    // Numeric pid:   "1560487329956114432"                    (long numeric string)
    // productSku:    "CJNSSYWY01847"                         (alphanumeric, starts with CJ)
    const isUUID = /^[0-9a-fA-F-]{36}$/.test(id);
    const isNumericPid = /^\d+$/.test(id);
    const sendAsPid = forceAsPid || isUUID || isNumericPid;

    // ── Check if already imported ─────────────────────────────────────────────
    const alreadyImported = await (Product as any)
      .findOne({
        $or: [{ "cj.productId": id }, { "cj.productSku": id }],
      })
      .select("_id name");

    // ── Fetch raw data from CJ API ────────────────────────────────────────────
    // Send as `pid` for UUIDs and numeric IDs, otherwise send as `productSku`
    const rawData: CJProductDetail = await cjGet("/product/query", {
      ...(sendAsPid ? { pid: id } : { productSku: id }),
      features: "enable_inventory",
    });

    // ── Transform for preview ─────────────────────────────────────────────────
    const transformed = transformCJProduct(rawData);

    return NextResponse.json({
      success: true,
      alreadyImported: alreadyImported
        ? { _id: alreadyImported._id, name: alreadyImported.name }
        : null,
      data: transformed,
    });
  } catch (error: any) {
    console.error("[CJ Preview] Failed:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch product" },
      { status: 500 },
    );
  }
}