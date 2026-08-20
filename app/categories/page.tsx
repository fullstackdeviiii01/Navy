// app/categories/page.tsx (Updated)
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getStaticPageSettings, checkPageVisibility } from "../../lib/metadata/homeMetadata";
import CategoriesPage from "../(public)/pages/CategoriesPage";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getStaticPageSettings('categories');
  
  return {
    title: settings?.meta_title || "Categories",
    description: settings?.meta_description || "Explore our product categories",
  };
}

export default async function Categories() {
  const isVisible = await checkPageVisibility('categories');
  
  if (!isVisible) {
    notFound();
  }

  return <CategoriesPage />;
}
