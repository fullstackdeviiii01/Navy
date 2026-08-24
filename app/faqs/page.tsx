// app/faqs/page.tsx
import { Metadata } from "next";
import FAQPage from "../components/faq/FAQPage";

export const metadata: Metadata = {
  title: "Frequently Asked Questions | Atelier FAQ & Guidance",
  description:
    "Explore answers regarding our handcrafted solid wood luminaires, bespoke commissions, domestic shipping across Pakistan, warranty, and care recommendations.",
};

export default function FAQ() {
  return <FAQPage />;
}