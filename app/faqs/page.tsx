// app/faqs/page.tsx
import { Metadata } from "next";
import FAQPage from "../components/faq/FAQPage";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "FAQ",
    description: "Find answers to commonly asked questions",
  };
}

export default async function FAQ() {
  return <FAQPage />;
}