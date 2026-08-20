// app/account/page.tsx
import { Metadata } from "next";
import AccountPageClient from "../(public)/pages/AccountPage";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "My Account",
    description: "Manage your account",
  };
}

export default async function UserAccount() {
  return <AccountPageClient />;
}