// app/faq/page.tsx (Updated)
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getStaticPageSettings, checkPageVisibility } from "../../lib/metadata/homeMetadata";
import FAQPage from "../components/faq/FAQPage";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getStaticPageSettings('faq');
  
  return {
    title: settings?.meta_title || "FAQ",
    description: settings?.meta_description || "Find answers to commonly asked questions",
  };
}

export default async function FAQ() {
  const isVisible = await checkPageVisibility('faq');
  
  if (!isVisible) {
    notFound();
  }

  return <FAQPage />;
}