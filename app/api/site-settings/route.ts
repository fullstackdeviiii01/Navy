import { NextRequest, NextResponse } from "next/server";
import { getIdTokenFromHeader, verifyIdToken } from "../../../lib/auth";
import connectDB from "../../../lib/db";
import SiteSettings from "../../models/SiteSettings";
import User from "../../models/User";

async function getGlobalSettings() {
  console.log("   getGlobalSettings: Checking for existing global settings...");
  let settings = await (SiteSettings as any).findOne({ is_global_settings: true });
  
  if (!settings) {
    console.log("   getGlobalSettings: No global settings found, creating defaults...");
    const defaultComponents = [
      { component_key: 'category_carousel', component_type: 'static', display_name: 'Category Carousel', is_visible: true, sort_order: 0 },
      { component_key: 'new_arrivals', component_type: 'static', display_name: 'New Arrivals', is_visible: true, sort_order: 1 },
      { component_key: 'features_section', component_type: 'static', display_name: 'Features Section', is_visible: true, sort_order: 2 },
      { component_key: 'featured_products', component_type: 'static', display_name: 'Featured Products', is_visible: true, sort_order: 3 },
      { component_key: 'best_sellers', component_type: 'static', display_name: 'Best Sellers', is_visible: true, sort_order: 4 },
      { component_key: 'trending_products', component_type: 'static', display_name: 'Trending Products', is_visible: true, sort_order: 5 },
      { component_key: 'on_sale_products', component_type: 'static', display_name: 'On Sale Products', is_visible: true, sort_order: 6 }
    ];

    const defaultStaticPages = [
      { page_key: 'products', page_name: 'Products', page_path: '/products', is_visible: true },
      { page_key: 'categories', page_name: 'Categories', page_path: '/categories', is_visible: true },
      { page_key: 'cart', page_name: 'Shopping Cart', page_path: '/cart', is_visible: true },
      { page_key: 'checkout', page_name: 'Checkout', page_path: '/checkout', is_visible: true },
      { page_key: 'account', page_name: 'My Account', page_path: '/account', is_visible: true },
      { page_key: 'contact', page_name: 'Contact Us', page_path: '/contact', is_visible: true },
      { page_key: 'faq', page_name: 'FAQ', page_path: '/faq', is_visible: true }
    ];

    settings = await (SiteSettings as any).create({
      is_global_settings: true,
      slug: "_global_settings",
      home_components: defaultComponents,
      static_pages: defaultStaticPages
    });
    console.log("   getGlobalSettings: Default settings created");
  } else {
    console.log("   getGlobalSettings: Found existing settings");
  }
  
  return settings;
}

export async function GET(request: NextRequest) {
  try {
    console.log("   GET /api/site-settings: Starting...");
    await connectDB();
    const url = new URL(request.url);
    const settingsType = url.searchParams.get("type");
    console.log("   GET /api/site-settings: Request type =", settingsType);

    if (settingsType === 'home') {
      console.log("   GET /api/site-settings: Fetching home settings...");
      const settings = await getGlobalSettings();
      
      let components = settings.home_components || [];
      console.log(`   GET /api/site-settings: Components count = ${components.length}`);

      return NextResponse.json({
        home_meta_title: settings.home_meta_title,
        home_meta_description: settings.home_meta_description,
        home_components: components
      });
    }

    if (settingsType === 'static') {
      console.log("   GET /api/site-settings: Fetching static pages config...");
      const settings = await getGlobalSettings();
      console.log(`   GET /api/site-settings: Found ${settings.static_pages?.length || 0} static pages`);
      return NextResponse.json({
        static_pages: settings.static_pages || []
      });
    }

    if (settingsType === 'company') {
      console.log("   GET /api/site-settings: Fetching company info...");
      const settings = await getGlobalSettings();
      console.log("   GET /api/site-settings: Company info:", settings.company_info ? "exists" : "not set");
      return NextResponse.json({
        company_info: settings.company_info || {}
      });
    }

    // Dynamic pages query
    console.log("   GET /api/site-settings: Fetching dynamic pages...");
    const includeInactive = url.searchParams.get("includeInactive") === "true";
    const pageType = url.searchParams.get("pageType");
    const slug = url.searchParams.get("slug");

    const query: any = { is_global_settings: { $ne: true } };

    if (!includeInactive) query.is_active = true;
    if (pageType) query.page_type = pageType;
    if (slug) query.slug = slug;

    const pages = await (SiteSettings as any)
      .find(query)
      .populate("created_by", "name email")
      .populate("updated_by", "name email")
      .sort({ sort_order: 1, created_at: -1 })
      .lean();

    console.log(`   GET /api/site-settings: Found ${pages.length} dynamic pages`);
    return NextResponse.json({ pages });
  } catch (error) {
    console.error("   GET /api/site-settings: Fetch failed:", error);
    return NextResponse.json({ error: "Failed to fetch site settings" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("   POST /api/site-settings: Creating dynamic page...");
    const token = getIdTokenFromHeader(request);
    if (!token) return NextResponse.json({ error: "No token provided" }, { status: 401 });

    const decodedToken = await verifyIdToken(token);
    if (!decodedToken) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    await connectDB();
    const adminUser = await (User as any).findOne({ uid: decodedToken.uid });
    if (!adminUser || adminUser.role !== "admin") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const body = await request.json();
    console.log("   POST /api/site-settings: Body received", body);
    
    if (!body.slug) {
      body.slug = body.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
      console.log("   POST /api/site-settings: Generated slug =", body.slug);
    }

    body.created_by = adminUser._id;
    body.is_global_settings = false;

    const page = new SiteSettings(body);
    await page.save();
    console.log("   POST /api/site-settings: Page created successfully, ID =", page._id);

    return NextResponse.json({ success: true, message: "Page created successfully", page });
  } catch (error: any) {
    console.error("   POST /api/site-settings: Creation failed:", error);
    if (error.code === 11000) {
      return NextResponse.json({ error: "Page with this slug already exists" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create page" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    console.log("   PUT /api/site-settings: Updating settings...");
    const token = getIdTokenFromHeader(request);
    if (!token) {
      console.log("   PUT /api/site-settings: No token provided");
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    const decodedToken = await verifyIdToken(token);
    if (!decodedToken) {
      console.log("   PUT /api/site-settings: Invalid token");
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    await connectDB();
    const adminUser = await (User as any).findOne({ uid: decodedToken.uid });
    if (!adminUser || adminUser.role !== "admin") {
      console.log("   PUT /api/site-settings: Access denied for user", adminUser?.email);
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const body = await request.json();
    const { updateType, ...data } = body;
    console.log(`   PUT /api/site-settings: Update type = ${updateType}`, data);

    const settings = await getGlobalSettings();
    console.log("   PUT /api/site-settings: Current settings ID =", settings._id);

    if (updateType === 'home') {
      console.log("   PUT /api/site-settings: Updating home settings...");
      
      if (data.home_meta_title !== undefined) {
        settings.home_meta_title = data.home_meta_title;
      }
      
      if (data.home_meta_description !== undefined) {
        settings.home_meta_description = data.home_meta_description;
      }
      
      if (data.home_components) {
        settings.home_components = data.home_components;
      }
    } else if (updateType === 'static') {
      console.log("   PUT /api/site-settings: Updating static pages...");
      if (data.static_pages) {
        settings.static_pages = data.static_pages;
      }
    } else if (updateType === 'company') {
      console.log("   PUT /api/site-settings: Updating company info...");
      if (data.company_info) {
        settings.company_info = data.company_info;
      }
    }

    settings.updated_by = adminUser._id;
    settings.updated_at = new Date();
    
    console.log("   PUT /api/site-settings: Saving settings...");
    await settings.save();
    console.log("   PUT /api/site-settings: Settings saved successfully");

    return NextResponse.json({ 
      success: true, 
      message: "Settings updated successfully", 
      settings: {
        _id: settings._id,
        updated_at: settings.updated_at
      }
    });
  } catch (error) {
    console.error("   PUT /api/site-settings: Update failed:", error);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}