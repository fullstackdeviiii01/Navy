import { NextRequest, NextResponse } from "next/server";
import { getIdTokenFromHeader, verifyIdToken } from "../../../lib/firebase/auth";
import connectDB from "../../../lib/db";
import PromotionalBanner from "../../models/PromotionalBanner";
import SiteSettings from "../../models/SiteSettings";
import User from "../../models/User";

export async function GET(request: NextRequest) {
  try {
    console.log("   GET /api/promotional-banners: Fetching banners...");
    await connectDB();
    
    const url = new URL(request.url);
    const target_page = url.searchParams.get("target_page");
    const is_active = url.searchParams.get("is_active");
    const includeInactive = url.searchParams.get("includeInactive") === "true";

    const query: any = {};
    
    if (target_page) query.target_page = target_page;
    
    if (!includeInactive) {
      query.is_active = true;
    } else if (is_active) {
      query.is_active = is_active === "true";
    }

    console.log(`   GET /api/promotional-banners: Query =`, query);

    const banners = await (PromotionalBanner as any)
      .find(query)
      .populate("created_by", "name email")
      .sort({ sort_order: 1, created_at: -1 })
      .lean();

    console.log(`   GET /api/promotional-banners: Found ${banners.length} banners`);
    return NextResponse.json({ success: true, banners }, { status: 200 });
  } catch (error: any) {
    console.error("   GET /api/promotional-banners: Fetch failed:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("   POST /api/promotional-banners: Creating new banner...");
    const token = getIdTokenFromHeader(request);
    if (!token) {
      console.log("   POST /api/promotional-banners: No token provided");
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    const decodedToken = await verifyIdToken(token);
    if (!decodedToken) {
      console.log("   POST /api/promotional-banners: Invalid token");
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    await connectDB();
    
    const adminUser = await (User as any).findOne({ uid: decodedToken.uid });
    if (!adminUser || adminUser.role !== "admin") {
      console.log("   POST /api/promotional-banners: Access denied for user", adminUser?.email);
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const body = await request.json();
    console.log("   POST /api/promotional-banners: Banner data received", body);

    // Validate position for categories/products
    if ((body.target_page === "categories" || body.target_page === "products") && !body.position) {
      console.log("   POST /api/promotional-banners: Position required for categories/products");
      return NextResponse.json({ 
        error: "Position is required for categories and products pages" 
      }, { status: 400 });
    }

    // Remove position for home page
    if (body.target_page === "home") {
      delete body.position;
    }

    // Get the highest sort_order for this target_page
    const maxSortOrder = await (PromotionalBanner as any)
      .findOne({ target_page: body.target_page })
      .sort({ sort_order: -1 })
      .select('sort_order')
      .lean();

    const sortOrder = maxSortOrder ? maxSortOrder.sort_order + 1 : 0;
    console.log(`   POST /api/promotional-banners: New sort_order = ${sortOrder}`);

    // Create banner with is_active based on target_page
    const bannerData = {
      ...body,
      is_active: body.target_page === "home" ? false : (body.is_active !== undefined ? body.is_active : true),
      sort_order: sortOrder,
      created_by: adminUser._id,
    };

    console.log("   POST /api/promotional-banners: Creating banner with data:", bannerData);
    const banner = await (PromotionalBanner as any).create(bannerData);

    console.log(`   POST /api/promotional-banners: Banner created, ID = ${banner._id}`);

    // If it's a home banner, add it to home_components
    if (body.target_page === 'home') {
      console.log("   POST /api/promotional-banners: Adding home banner to home_components...");
      const settings = await (SiteSettings as any).findOne({ is_global_settings: true });
      if (settings) {
        const components = settings.home_components || [];
        const newComponent = {
          component_key: `banner_${banner._id}`,
          component_type: 'banner',
          banner_id: banner._id.toString(),
          display_name: banner.title,
          is_visible: false,
          sort_order: components.length
        };
        components.push(newComponent);
        settings.home_components = components;
        settings.updated_by = adminUser._id;
        settings.updated_at = new Date();
        await settings.save();
        console.log(`   POST /api/promotional-banners: Added banner to home_components, new count = ${components.length}`);
      } else {
        console.log("   POST /api/promotional-banners: No global settings found");
      }
    }

    return NextResponse.json(
      { 
        success: true, 
        banner: {
          _id: banner._id,
          title: banner.title,
          target_page: banner.target_page,
          position: banner.position,
          is_active: banner.is_active,
          sort_order: banner.sort_order
        }, 
        message: "Banner created successfully" 
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("   POST /api/promotional-banners: Creation failed:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}