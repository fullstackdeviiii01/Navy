// app/contact/page.tsx
import { Metadata } from "next";
import ContactPage from "../components/contact/ContactPage";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Contact Us",
    description: "Get in touch with us",
  };
}

export default async function Contact() {
  return <ContactPage />;
}