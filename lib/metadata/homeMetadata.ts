// lib/metadata/homeMetadata.ts
export async function getHomeSettings() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const response = await fetch(`${baseUrl}/api/site-settings?type=home`, {
      cache: "no-store",
    });

    if (!response.ok) {
      return {
        home_meta_title: null,
        home_meta_description: null,
        home_components: [],
      };
    }

    return response.json();
  } catch (error) {
    console.error("Error fetching home settings:", error);
    return {
      home_meta_title: null,
      home_meta_description: null,
      home_components: [],
    };
  }
}

// lib/metadata/staticPageMetadata.ts
export async function getStaticPageSettings(pageKey: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const response = await fetch(`${baseUrl}/api/site-settings?type=static`, {
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const page = data.static_pages?.find((p: any) => p.page_key === pageKey);
    
    return page || null;
  } catch (error) {
    console.error("Error fetching static page settings:", error);
    return null;
  }
}

export async function checkPageVisibility(pageKey: string): Promise<boolean> {
  try {
    const pageSettings = await getStaticPageSettings(pageKey);
    return pageSettings ? pageSettings.is_visible : true; // Default to visible
  } catch (error) {
    console.error("Error checking page visibility:", error);
    return true; // Default to visible on error
  }
}

// lib/metadata/productMetadata.ts
import connectDB from "../db";
import Product from "../../app/models/Product";

export async function getProductMetadata(productId: string) {
  try {
    await connectDB();
    
    const product = await (Product as any)
      .findById(productId)
      .select("name description seo")
      .lean();

    if (!product) {
      return {
        title: "Product Not Found",
        description: "The product you're looking for doesn't exist.",
      };
    }

    return {
      title: product.seo?.meta_title || product.name,
      description: product.seo?.meta_description || product.description?.substring(0, 160),
    };
  } catch (error) {
    console.error("Error fetching product metadata:", error);
    return {
      title: "Product",
      description: "View product details",
    };
  }
}