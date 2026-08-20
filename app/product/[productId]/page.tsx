// app/product/[productId]/page.tsx
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { checkPageVisibility } from "../../../lib/metadata/homeMetadata";
import { getProductMetadata } from "../../../lib/metadata/homeMetadata";
import ProductDetailPage from "../../(public)/pages/ProductDetailPage";

export async function generateMetadata({ params }: { params: Promise<{ productId: string }> }): Promise<Metadata> {
  const { productId } = await params;
  const productMeta = await getProductMetadata(productId);
  
  return {
    title: productMeta.title,
    description: productMeta.description,
  };
}

export default async function ProductDetail({ params }: { params: Promise<{ productId: string }> }) {
  const isVisible = await checkPageVisibility('product_detail');
  
  if (!isVisible) {
    notFound();
  }

  const { productId } = await params;
  return <ProductDetailPage productId={productId} />;
}

// app/product/[productId]/ProductDetailPageContent.tsx
// Move the existing product detail page content here
// Add productId as prop