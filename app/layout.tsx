import { Inter, Playfair_Display } from "next/font/google";
import { Roboto_Mono } from "next/font/google";
import "./globals.css";
import { headers } from "next/headers";
import ClientProviders from "./ClientProviders";
import Header from "./components/Header";
import Footerr from "./components/Footerr";
import WhatsAppButton from "./components/shared/WhatsAppButton";
import MetaPixel from "./components/meta/MetaPixel";
import { Analytics } from "@vercel/analytics/next";
import { ReactNode, Suspense } from "react";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const robotoMono = Roboto_Mono({ subsets: ["latin"], variable: "--font-mono" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-serif" });

export const metadata = {
  title: "Talal Wooden Lamps | Handcrafted Architectural Lighting",
  description: "Artisanal solid-wood lighting and bespoke architectural luminaires.",
};

export default async function RootLayout({ 
  children 
}: { 
  children: ReactNode 
}) {
  // Get the pathname server-side
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "";
  const isAdminPage = pathname.startsWith("/admin");

  return (
    <html lang="en">
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