import { NextResponse } from "next/server";
import connectDB from "../../../../lib/db";
import Product from "../../../models/Product";
import Category from "../../../models/Category";

// Ensure models are registered in mongoose
const _models = [Product, Category];

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://talalwoodenlamp.com";

function escapeXml(unsafe?: string | null): string {
  if (!unsafe) return "";
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function cleanDescription(desc?: string | null): string {
  if (!desc) return "Handcrafted solid wood lamp and architectural luminaire.";
  // Strip html tags if any
  const text = desc.replace(/<[^>]*>?/gm, "").trim();
  return text.slice(0, 5000);
}

export async function GET() {
  try {
    await connectDB();

    // Fetch all active products
    const products = await (Product as any)
      .find({ status: "active" })
      .populate("category_id", "name slug")
      .lean();

    const itemsXml = products
      .map((product: any) => {
        const id = product._id?.toString();
        const title = product.name || "Handmade Wooden Lamp";
        const description = cleanDescription(product.description || product.short_description);
        const link = `${BASE_URL}/product/${id}`;

        // Get primary image
        let imageUrl = `${BASE_URL}/placeholder-lamp.png`;
        if (Array.isArray(product.images) && product.images.length > 0) {
          const primary = product.images.find((img: any) => img.is_primary) || product.images[0];
          const rawUrl = primary.url || primary;
          if (rawUrl) {
            imageUrl = rawUrl.startsWith("http") ? rawUrl : `${BASE_URL}${rawUrl.startsWith("/") ? "" : "/"}${rawUrl}`;
          }
        }

        // Calculate price
        let price = product.pricing?.price || 0;
        if (product.hasVariants && product.variantPricing?.minPrice) {
          price = product.variantPricing.minPrice;
        }
        const formattedPrice = `${price.toFixed(2)} PKR`;

        // Availability
        const isOutOfStock =
          product.inventory?.stock_status === "out_of_stock" ||
          (typeof product.inventory?.stock_quantity === "number" && product.inventory.stock_quantity <= 0);
        const availability = isOutOfStock ? "out_of_stock" : "in_stock";

        // Category & Brand
        const categoryName = product.category_id?.name || "Wooden Lamps";
        const brand = product.brand || "Talal Wooden Lamp";

        return `    <item>
      <g:id>${escapeXml(id)}</g:id>
      <g:title><![CDATA[${title}]]></g:title>
      <g:description><![CDATA[${description}]]></g:description>
      <g:link>${escapeXml(link)}</g:link>
      <g:image_link>${escapeXml(imageUrl)}</g:image_link>
      <g:brand><![CDATA[${brand}]]></g:brand>
      <g:condition>new</g:condition>
      <g:availability>${availability}</g:availability>
      <g:price>${formattedPrice}</g:price>
      <g:google_product_category>Home &amp; Garden &gt; Lighting &gt; Lamps</g:google_product_category>
      <g:product_type><![CDATA[${categoryName}]]></g:product_type>
      <g:custom_label_0>100% Solid Wood Handmade</g:custom_label_0>
      <g:custom_label_1><![CDATA[${categoryName}]]></g:custom_label_1>
    </item>`;
      })
      .join("\n");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>Talal Wooden Lamp Product Catalog</title>
    <link>${BASE_URL}</link>
    <description>Handcrafted Solid Wood Architectural Lamps and Luminaires</description>
${itemsXml}
  </channel>
</rss>`;

    return new NextResponse(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (error: any) {
    console.error("[Meta Catalog Feed Error]:", error);
    return new NextResponse(
      `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>Error</title><description>${escapeXml(
        error.message
      )}</description></channel></rss>`,
      {
        status: 500,
        headers: { "Content-Type": "application/xml; charset=utf-8" },
      }
    );
  }
}
