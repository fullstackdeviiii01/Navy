// app/products/page.tsx (Updated)
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getStaticPageSettings, checkPageVisibility } from "../../lib/metadata/homeMetadata";
import ProductsPage from "../(public)/pages/ProductsPage";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getStaticPageSettings('products');
  
  return {
    title: settings?.meta_title || "Products",
    description: settings?.meta_description || "Browse our product collection",
  };
}

export default async function Products() {
  const isVisible = await checkPageVisibility('products');
  
  if (!isVisible) {
    notFound();
  }

  return <ProductsPage />;
}