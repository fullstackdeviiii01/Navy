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

import connectDB from "../lib/db";
import SiteSettings from "./models/SiteSettings";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const robotoMono = Roboto_Mono({ subsets: ["latin"], variable: "--font-mono" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-serif" });

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || "https://talalwoodenlamp.com";

async function getCompanySettings() {
  try {
    await connectDB();
    const settings = await (SiteSettings as any).findOne({ is_global_settings: true }).lean();
    return settings?.company_info || null;
  } catch (error) {
    console.error("Failed to load site settings for layout:", error);
    return null;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const companyInfo = await getCompanySettings();
  const dbLogo = companyInfo?.company_logo || "/company/company_logo_1787545112127_e99pp05qeb7.webp";
  const absoluteLogoUrl = dbLogo.startsWith("http") ? dbLogo : `${siteUrl}${dbLogo}`;

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: "Talal Wooden Lamp",
      template: "%s | Talal Wooden Lamp",
    },
    description:
      "Handcrafted solid wood table lamps, artisanal floor lamps, and luxury ambient lighting atelier in Pakistan. Crafted with seasoned timber. Free nationwide delivery.",
    keywords: [
      "talal wooden lamp",
      "wooden lamp",
      "wooden lamps",
      "handcrafted wooden lamps",
      "solid wood table lamp",
      "lathe turned lamps",
      "floor lamps pakistan",
      "ambient lighting",
      "sheesham wood lamps",
      "teak lamps",
      "luxury lighting atelier",
      "rustic wooden lights",
      "natural timber decor",
    ],
    authors: [{ name: "Talal Wooden Lamp", url: siteUrl }],
    creator: "Talal Wooden Lamp",
    publisher: "Talal Wooden Lamp",
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
      siteName: "Talal Wooden Lamp",
      title: "Talal Wooden Lamp",
      description:
        "Handcrafted solid wood table lamps, artisanal floor lamps, and luxury ambient lighting atelier in Pakistan. Crafted with seasoned timber.",
      images: [
        {
          url: absoluteLogoUrl,
          width: 400,
          height: 400,
          alt: "Talal Wooden Lamp Logo",
        },
        {
          url: "/images/heroimageone.png",
          width: 1200,
          height: 630,
          alt: "Talal Wooden Lamp - Handcrafted Solid Wood Table Lamp with Warm Ambient Glow",
        },
      ],
    },
    twitter: {
      card: "summary",
      title: "Talal Wooden Lamp",
      description:
        "Handcrafted solid wood table lamps, artisanal floor lamps, and luxury ambient lighting in Pakistan.",
      images: [absoluteLogoUrl],
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
        { url: dbLogo, type: "image/webp" },
        { url: "/icon.png", sizes: "512x512", type: "image/png" },
        { url: "/favicon-48x48.png", sizes: "48x48", type: "image/png" },
        { url: "/favicon.ico" },
      ],
      apple: [
        { url: dbLogo, type: "image/webp" },
        { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
      ],
      shortcut: [dbLogo],
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const companyInfo = await getCompanySettings();
  const dbLogo = companyInfo?.company_logo || "/company/company_logo_1787545112127_e99pp05qeb7.webp";
  const absoluteLogoUrl = dbLogo.startsWith("http") ? dbLogo : `${siteUrl}${dbLogo}`;

  // Get the pathname server-side
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "";
  const isAdminPage = pathname.startsWith("/admin");

  // Schema.org Organization & WebSite JSON-LD
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Talal Wooden Lamp",
    url: siteUrl,
    logo: absoluteLogoUrl,
    image: absoluteLogoUrl,
    description:
      "Artisanal solid wood lighting atelier specializing in handcrafted table lamps, floor lamps, and rustic ambient luminaires.",
    address: {
      "@type": "PostalAddress",
      addressLocality: companyInfo?.company_address || "Sahiwal, Punjab",
      addressCountry: "PK",
    },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      telephone: companyInfo?.company_phone || "+92 300 9692765",
      email: companyInfo?.company_email || "contact@talalwoodenlamp.com",
      availableLanguage: ["English", "Urdu"],
    },
  };

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Talal Wooden Lamp",
    alternateName: ["Talal Wooden Lamps", "talalwoodenlamp.com"],
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
        <link rel="icon" href={dbLogo} type="image/webp" />
        <link rel="apple-touch-icon" href={dbLogo} />
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