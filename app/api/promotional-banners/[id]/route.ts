import { NextRequest, NextResponse } from "next/server";
import { getIdTokenFromHeader, verifyIdToken } from "../../../../lib/firebase/auth";
import connectDB from "../../../../lib/db";
import PromotionalBanner from "../../../models/PromotionalBanner";
import SiteSettings from "../../../models/SiteSettings";
import User from "../../../models/User";
import { deleteBannerImages } from "../../../../lib/media-deletion/bannerFileUtils";


export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    await connectDB();

    const banner = await (PromotionalBanner as any).findById(id).lean();

    if (!banner) {
      return NextResponse.json({ error: "Banner not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      banner,
    });
  } catch (error: any) {
    console.error("Banner fetch failed:", error);
    return NextResponse.json(
      { error: "Failed to fetch banner" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

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

    const body = await request.json();

    // Validate position for categories/products
    if ((body.target_page === "categories" || body.target_page === "products") && !body.position) {
      return NextResponse.json({ 
        error: "Position is required for categories and products pages" 
      }, { status: 400 });
    }

    // Remove position for home page
    if (body.target_page === "home") {
      delete body.position;
    }

    // Handle image deletion
    if (body.hasOwnProperty("images")) {
      const oldBanner = await (PromotionalBanner as any).findById(id);
      if (oldBanner && oldBanner.images && oldBanner.images.length > 0) {
        const oldImageUrls = oldBanner.images.map((img: any) => img.url);
        const newImageUrls = body.images.map((img: any) => img.url);
        const imagesToDelete = oldImageUrls.filter((url: string) => !newImageUrls.includes(url));
        
        if (imagesToDelete.length > 0) {
          await deleteBannerImages(imagesToDelete);
        }
      }
    }

    body.updated_by = adminUser._id;

    const banner = await (PromotionalBanner as any).findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    if (!banner) {
      return NextResponse.json({ error: "Banner not found" }, { status: 404 });
    }

    // Update in home_components if title changed
    if (banner.target_page === 'home' && body.title) {
      const settings = await (SiteSettings as any).findOne({ is_global_settings: true });
      if (settings && settings.home_components) {
        const componentIndex = settings.home_components.findIndex(
          (c: any) => c.component_type === 'banner' && c.banner_id?.toString() === id
        );
        if (componentIndex !== -1) {
          settings.home_components[componentIndex].display_name = banner.title;
          settings.updated_by = adminUser._id;
          await settings.save();
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: "Banner updated successfully",
      banner,
    });
  } catch (error: any) {
    console.error("Banner update failed:", error);
    return NextResponse.json(
      { error: "Failed to update banner" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

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

    const banner = await (PromotionalBanner as any).findById(id);
    if (!banner) {
      return NextResponse.json({ error: "Banner not found" }, { status: 404 });
    }

    const imageUrls = banner.images?.map((img: any) => img.url) || [];

    await (PromotionalBanner as any).findByIdAndDelete(id);

    // Remove from home_components if it's a home banner
    if (banner.target_page === 'home') {
      const settings = await (SiteSettings as any).findOne({ is_global_settings: true });
      if (settings && settings.home_components) {
        settings.home_components = settings.home_components.filter(
          (c: any) => !(c.component_type === 'banner' && c.banner_id?.toString() === id)
        );
        settings.updated_by = adminUser._id;
        await settings.save();
      }
    }

    if (imageUrls.length > 0) {
      await deleteBannerImages(imageUrls);
    }

    return NextResponse.json({
      success: true,
      message: "Banner deleted successfully",
    });
  } catch (error) {
    console.error("Banner deletion failed:", error);
    return NextResponse.json(
      { error: "Failed to delete banner" },
      { status: 500 }
    );
  }
}