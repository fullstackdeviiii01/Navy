// app/product/[productId]/page.tsx
import { Metadata } from "next";
import { getProductMetadata } from "../../../lib/metadata/homeMetadata";
import { getProductUrl } from "../../../lib/utils/productUrl";
import ProductDetailPage from "../../(public)/pages/ProductDetailPage";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ productId: string }>;
}): Promise<Metadata> {
  const { productId } = await params;
  const meta = await getProductMetadata(productId);
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || "https://talalwoodenlamp.com";
  const canonicalUrl = `${siteUrl}${getProductUrl(meta.product || { _id: productId })}`;

  return {
    title: meta.title,
    description: meta.description,
    keywords: [
      meta.product?.name || "wooden lamp",
      "handcrafted wooden lamp",
      "solid wood lighting",
      "artisanal lamp pakistan",
      "table lamp",
      "ambient lighting",
      meta.product?.category_id?.name || "wood lighting",
    ],
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: canonicalUrl,
      siteName: "Talal Wooden Lamps",
      images: [
        {
          url: meta.image || "/images/hero-atelier-lamp.jpg",
          width: 1200,
          height: 1200,
          alt: meta.product?.name || "Handcrafted Solid Wood Lamp",
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: meta.title,
      description: meta.description,
      images: [meta.image || "/images/hero-atelier-lamp.jpg"],
    },
  };
}

export default async function ProductDetail({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId } = await params;
  const meta = await getProductMetadata(productId);
  const product = meta.product;
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || "https://talalwoodenlamp.com";

  // Product Schema.org JSON-LD Structured Data
  const productJsonLd = product
    ? {
        "@context": "https://schema.org",
        "@type": "Product",
        name: product.name,
        image: product.images?.map((img: any) => img.url) || [
          `${siteUrl}/images/hero-atelier-lamp.jpg`,
        ],
        description:
          product.seo?.meta_description ||
          product.description?.replace(/<[^>]*>?/gm, "") ||
          `Handcrafted ${product.name} in solid hardwood.`,
        sku: product._id.toString(),
        brand: {
          "@type": "Brand",
          name: product.brand || "Talal Wooden Lamps",
        },
        offers: {
          "@type": "Offer",
          url: `${siteUrl}${getProductUrl(product)}`,
          priceCurrency: "PKR",
          price: product.pricing?.price || product.variantPricing?.minPrice || 0,
          availability:
            product.is_active !== false
              ? "https://schema.org/InStock"
              : "https://schema.org/OutOfStock",
          itemCondition: "https://schema.org/NewCondition",
          seller: {
            "@type": "Organization",
            name: "Talal Wooden Lamps",
          },
        },
      }
    : null;

  // Breadcrumbs Schema.org JSON-LD
  const breadcrumbsJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: siteUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Products",
        item: `${siteUrl}/products`,
      },
      ...(product?.category_id?.name
        ? [
            {
              "@type": "ListItem",
              position: 3,
              name: product.category_id.name,
              item: `${siteUrl}/products?category=${product.category_id.slug || product.category_id._id}`,
            },
            {
              "@type": "ListItem",
              position: 4,
              name: product.name,
              item: `${siteUrl}${getProductUrl(product)}`,
            },
          ]
        : [
            {
              "@type": "ListItem",
              position: 3,
              name: product?.name || "Product",
              item: `${siteUrl}${getProductUrl(product || { _id: productId })}`,
            },
          ]),
    ],
  };

  return (
    <>
      {productJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsJsonLd) }}
      />
      <ProductDetailPage productId={productId} />
    </>
  );
}