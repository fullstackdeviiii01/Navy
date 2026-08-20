// app/contact/page.tsx (Updated)
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getStaticPageSettings, checkPageVisibility } from "../../lib/metadata/homeMetadata";
import ContactPage from "../components/contact/ContactPage";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getStaticPageSettings('contact');
  
  return {
    title: settings?.meta_title || "Contact Us",
    description: settings?.meta_description || "Get in touch with us",
  };
}

export default async function Contact() {
  const isVisible = await checkPageVisibility('contact');
  
  if (!isVisible) {
    notFound();
  }

  return <ContactPage />;
}