import { Inter, Playfair_Display, Roboto_Mono } from "next/font/google";
import "./globals.css";
import { headers } from "next/headers";
import ClientProviders from "./ClientProviders";
import Header from "./components/Header";
import Footerr from "./components/Footerr";
import WhatsAppButton from "./components/shared/WhatsAppButton";
import MetaPixel from "./components/meta/MetaPixel";
import { Analytics } from "@vercel/analytics/next";
import { ReactNode, Suspense } from "react";
import { Metadata } from "next";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const robotoMono = Roboto_Mono({ subsets: ["latin"], variable: "--font-mono" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-serif" });

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://talalwoodenlamps.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Talal Wooden Lamps | Handcrafted Solid Wood Lighting & Luminaires",
    template: "%s | Talal Wooden Lamps",
  },
  description:
    "Discover bespoke handcrafted solid wood table lamps, lathe-turned floor lamps, rustic lanterns, and luxury ambient lighting in Pakistan. Crafted with seasoned Sheesham and Teak wood. Free nationwide delivery.",
  keywords: [
    "wooden lamps",
    "handcrafted wooden lamps",
    "solid wood table lamp",
    "lathe turned lamps",
    "floor lamps pakistan",
    "ambient lighting",
    "sheesham wood lamps",
    "teak lamps",
    "talal wooden lamps",
    "luxury lighting atelier",
    "rustic wooden lights",
    "natural timber decor",
  ],
  authors: [{ name: "Talal Wooden Lamps", url: siteUrl }],
  creator: "Talal Wooden Lamps",
  publisher: "Talal Wooden Lamps",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    type: "website",
    locale: "en_PK",
    url: siteUrl,
    siteName: "Talal Wooden Lamps",
    title: "Talal Wooden Lamps | Handcrafted Solid Wood Lighting & Luminaires",
    description:
      "Artisanal solid wood table lamps, floor lamps, and bespoke ambient luminaires handcrafted in Pakistan.",
    images: [
      {
        url: "/images/heroimageone.png",
        width: 1200,
        height: 630,
        alt: "Talal Wooden Lamps - Handcrafted Solid Wood Table Lamp with Warm Ambient Glow",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Talal Wooden Lamps | Handcrafted Solid Wood Lighting",
    description:
      "Artisanal solid wood table lamps, floor lamps, and bespoke ambient luminaires handcrafted in Pakistan.",
    images: ["/images/heroimageone.png"],
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "IQKFfdQVHEtBSWkv_KMDl-PKUDv6TkDtEKWS4u0ydiI",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/icon.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  // Get the pathname server-side
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "";
  const isAdminPage = pathname.startsWith("/admin");

  // Schema.org Organization & WebSite JSON-LD
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Talal Wooden Lamps",
    url: siteUrl,
    logo: `${siteUrl}/images/logo.png`,
    description:
      "Artisanal solid wood lighting atelier specializing in handcrafted table lamps, floor lamps, and rustic ambient luminaires.",
    address: {
      "@type": "PostalAddress",
      addressCountry: "PK",
    },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      availableLanguage: ["English", "Urdu"],
    },
  };

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Talal Wooden Lamps",
    url: siteUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteUrl}/products?search={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <html lang="en">
      <head>
        <meta
          name="google-site-verification"
          content="IQKFfdQVHEtBSWkv_KMDl-PKUDv6TkDtEKWS4u0ydiI"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </head>
      <body
        className={`${inter.variable} ${robotoMono.variable} ${playfair.variable} bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark antialiased min-h-screen`}
      >
        <ClientProviders>
          <Suspense fallback={null}>
            <MetaPixel />
          </Suspense>
          {!isAdminPage && <Header />}
          {children}
          {!isAdminPage && <WhatsAppButton />}
          <Analytics />
          {!isAdminPage && <Footerr />}
        </ClientProviders>
      </body>
    </html>
  );
}