import { Inter } from "next/font/google";
import { Roboto_Mono } from "next/font/google";
import "./globals.css";
import { headers } from "next/headers";
import ClientProviders from "./ClientProviders";
import Header from "./components/Header";
import Footerr from "./components/Footerr";
import { Analytics } from "@vercel/analytics/next";
import { ReactNode } from "react";
import ChatbotProvider from "./components/chatbot/ChatbotProvider";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const robotoMono = Roboto_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata = {
  title: "Ecommerce Auth",
  description: "Minimal ecommerce authentication system",
  generator: "v0.app",
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
        className={`${inter.variable} ${robotoMono.variable} bg-white dark:bg-gray-900 dark:text-gray-300 text-black transition-colors duration-300`}
      >
        <ClientProviders>
          {!isAdminPage && <Header />}
          {children}
          <ChatbotProvider />
          <Analytics />
          {!isAdminPage && <Footerr />}
        </ClientProviders>
      </body>
    </html>
  );
}