// app/wishlist/page.tsx
import { Metadata } from "next";
import WishlistPage from "../(public)/pages/WishlistPage";

export const metadata: Metadata = {
  title: "Your Saved Luminaires & Wishlist",
  description: "View and manage your curated wishlist of handcrafted solid wood table lamps and artisanal home lighting.",
  robots: {
    index: false,
    follow: true,
  },
};

export default async function Wishlist() {
  return <WishlistPage />;
}