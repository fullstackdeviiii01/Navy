// app/categories/page.tsx
import { Metadata } from "next";
import CategoriesPage from "../(public)/pages/CategoriesPage";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Browse Wooden Lamp Collections | Table, Floor, Sconces & Lanterns",
    description:
      "Browse our handcrafted lighting collections by category: solid timber table luminaires, tall ambient floor lamps, rustic pendant lanterns, and decorative wall sconces.",
    keywords: [
      "wooden lamp categories",
      "table lamp collection",
      "floor standing wooden lamps",
      "rustic lanterns pakistan",
      "architectural wall sconces",
    ],
    alternates: {
      canonical: "/categories",
    },
  };
}

export default async function Categories() {
  return <CategoriesPage />;
}
