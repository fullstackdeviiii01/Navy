// app/products/page.tsx
import { Metadata } from "next";
import ProductsPage from "../(public)/pages/ProductsPage";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Handcrafted Wooden Lamps Catalog | Table, Floor & Pendant Lights",
    description:
      "Explore our complete collection of solid hardwood lamps. Scandinavian minimalism meets traditional lathe-turned woodwork. Filter by category, timber finish, and price with nationwide Pakistan shipping.",
    keywords: [
      "buy wooden lamps online",
      "solid wood table lamp pakistan",
      "architectural floor lamps",
      "handcrafted luminaires",
      "sheesham wood lighting",
    ],
    alternates: {
      canonical: "/products",
    },
  };
}

export default async function Products() {
  return <ProductsPage />;
}