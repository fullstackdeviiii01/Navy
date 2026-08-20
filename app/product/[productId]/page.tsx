// app/product/[productId]/page.tsx
import { Metadata } from "next";
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
  const { productId } = await params;
  return <ProductDetailPage productId={productId} />;
}