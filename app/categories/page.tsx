// app/categories/page.tsx
import { Metadata } from "next";
import CategoriesPage from "../(public)/pages/CategoriesPage";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Categories",
    description: "Explore our product categories",
  };
}

export default async function Categories() {
  return <CategoriesPage />;
}
