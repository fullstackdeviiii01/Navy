// app/contact/page.tsx
import { Metadata } from "next";
import ContactPage from "../components/contact/ContactPage";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Contact Our Atelier | Custom Wooden Lighting & Customer Care",
    description:
      "Get in touch with Talal Wooden Lamps. Inquire about custom bespoke lighting, trade orders, interior design collaborations, and customer care in Pakistan.",
    keywords: [
      "contact talal wooden lamps",
      "custom wooden lamps pakistan",
      "bespoke lighting inquiry",
      "wooden lamp atelier support",
    ],
    alternates: {
      canonical: "/contact",
    },
  };
}

export default async function Contact() {
  return <ContactPage />;
}