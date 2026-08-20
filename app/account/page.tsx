// app/account/page.tsx (Updated)
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getStaticPageSettings, checkPageVisibility } from "../../lib/metadata/homeMetadata";
import AccountPageClient from "../(public)/pages/AccountPage";
export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getStaticPageSettings('account');
  
  return {
    title: settings?.meta_title || "My Account",
    description: settings?.meta_description || "Manage your account",
  };
}

export default async function UserAccount() {
  const isVisible = await checkPageVisibility('account');
  
  if (!isVisible) {
    notFound();
  }

  return <AccountPageClient />;
}