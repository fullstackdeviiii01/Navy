// app/faqs/page.tsx
import { Metadata } from "next";
import FAQPage from "../components/faq/FAQPage";

export const metadata: Metadata = {
  title: "Frequently Asked Questions & Customer Support",
  description:
    "Find comprehensive answers about our handcrafted solid wood lamps, custom dimensions, bulb specifications, nationwide shipping in Pakistan, and easy 7-day returns.",
  keywords: [
    "wooden lamps faq",
    "lamp delivery pakistan",
    "custom wooden lighting",
    "wooden lamp warranty",
    "lamp return policy",
  ],
  alternates: {
    canonical: "/faqs",
  },
};

export default function FAQ() {
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://talalwoodenlamps.com";

  // Google Rich Snippet FAQPage Schema.org JSON-LD
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What type of wood is used in your lamps?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "We exclusively craft our lamps from seasoned solid hardwoods including premium Sheesham (Rosewood), Teak, and Ash timber kiln-dried to optimal moisture content.",
        },
      },
      {
        "@type": "Question",
        name: "Do you deliver all over Pakistan?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, we provide secure nationwide shipping across Pakistan with multi-layered shock-absorbing packaging. Delivery typically takes 3 to 5 business days.",
        },
      },
      {
        "@type": "Question",
        name: "What bulb types and voltage are compatible?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "All our lamps feature standard E27 / B22 brass or ceramic holders compatible with 220V warm LED filament bulbs, dimmable LEDs, and vintage Edison bulbs.",
        },
      },
      {
        "@type": "Question",
        name: "What is your return and replacement policy?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "We offer a 7-day hassle-free return and replacement guarantee for any transit damages or craftsmanship issues.",
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <FAQPage />
    </>
  );
}