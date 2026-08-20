import { Inter } from "next/font/google";
import { Roboto_Mono } from "next/font/google";
import "./globals.css";
import { headers } from "next/headers";
import ClientProviders from "./ClientProviders";
import Header from "./components/Header";
import Footerr from "./components/Footerr";
import { Analytics } from "@vercel/analytics/next";
import { ReactNode } from "react";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const robotoMono = Roboto_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata = {
  title: "Ecommerce Store",
  description: "Minimal ecommerce store",
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
        className={`${inter.variable} ${robotoMono.variable} bg-white text-gray-900 antialiased`}
      >
        <ClientProviders>
          {!isAdminPage && <Header />}
          {children}
          <Analytics />
          {!isAdminPage && <Footerr />}
        </ClientProviders>
      </body>
    </html>
  );
}