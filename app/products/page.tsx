// app/products/page.tsx
import { Metadata } from "next";
import ProductsPage from "../(public)/pages/ProductsPage";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Products",
    description: "Browse our product collection",
  };
}

export default async function Products() {
  return <ProductsPage />;
}