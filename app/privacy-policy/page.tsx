// app/privacy-policy/page.tsx
import { Metadata } from "next";
import Link from "next/link";
import {
  ChevronRight,
  ShieldCheck,
  Lock,
  Eye,
  Database,
  UserCheck,
  Mail,
  ArrowRight,
  PhoneCall,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy | Rehan Wooden Lamps",
  description:
    "Learn how we protect and respect your personal information, order data, and payment privacy.",
};

export default function PrivacyPolicyPage() {
  const commitments = [
    {
      icon: Lock,
      title: "No Data Selling",
      description: "We never sell, rent, or trade your personal contact or order details to third-party advertisers.",
    },
    {
      icon: ShieldCheck,
      title: "Encrypted Transactions",
      description: "Payment receipts and customer authentication tokens are protected with industry-standard encryption.",
    },
    {
      icon: Database,
      title: "Essential Storage Only",
      description: "We retain only the operational data needed to craft, fulfill, and support your handcrafted lamp orders.",
    },
    {
      icon: UserCheck,
      title: "Complete User Control",
      description: "You have the right to request a copy of your stored records or account deletion at any time.",
    },
  ];

  const sections = [
    {
      title: "1. Information We Collect",
      content: (
        <div className="space-y-2">
          <p>We collect only the information necessary to fulfill your orders and deliver excellent customer support:</p>
          <ul className="list-disc pl-5 space-y-1 text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
            <li><strong>Personal Contact:</strong> Full name, email address, phone number, and delivery street address.</li>
            <li><strong>Order History:</strong> Product selections, custom dimension requests, order status, and tracking records.</li>
            <li><strong>Payment Confirmations:</strong> Bank transfer reference IDs and payment receipt screenshots submitted for verification (we do not store raw credit card numbers or banking PINs).</li>
            <li><strong>Customer Reviews:</strong> Submitted star ratings, testimonials, and verified customer photographs.</li>
          </ul>
        </div>
      ),
    },
    {
      title: "2. How We Utilize Your Data",
      content: (
        <div className="space-y-2">
          <p>Your information is used strictly for operational purposes:</p>
          <ul className="list-disc pl-5 space-y-1 text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
            <li>Processing, packing, and dispatching your orders with courier partners (TCS, Leopards, Trax).</li>
            <li>Sending transactional emails (Order Confirmation, Receipt Approval, Dispatch Manifest, Delivery Updates).</li>
            <li>Processing customer returns, warranty assistance, and refund disbursements.</li>
            <li>Improving website usability, performance, and catalogue navigation.</li>
          </ul>
        </div>
      ),
    },
    {
      title: "3. Information Sharing & Third Parties",
      content: (
        <p>
          We do not disclose your personal information to third parties except as strictly necessary to fulfill your orders (such as sharing delivery addresses with our logistics courier partners for delivery) or when required by governing law.
        </p>
      ),
    },
    {
      title: "4. Cookies & Local Storage",
      content: (
        <p>
          Our storefront utilizes essential session cookies and local storage tokens to preserve your shopping cart, maintain your login session, and save your theme preferences (Light / Dark mode). You can disable cookies in your browser settings, though some shopping cart features may be limited.
        </p>
      ),
    },
    {
      title: "5. Your Privacy Rights & Data Deletion",
      content: (
        <p>
          You have full authority over your personal data. If you wish to update your saved addresses, download a copy of your purchase history, or request full deletion of your account and personal records, please reach out to our privacy desk at <strong>support@rehanwoodenlamps.com</strong>.
        </p>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-theme-bg-light dark:bg-theme-bg-dark py-10 sm:py-16 transition-colors">
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Breadcrumb Navigation */}
        <nav
          className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em]"
          aria-label="Breadcrumb"
        >
          <Link
            href="/"
            className="text-theme-text-muted-light dark:text-theme-text-muted-dark hover:text-theme-hover-light transition-colors"
          >
            Home
          </Link>
          <ChevronRight className="w-3 h-3 text-theme-text-muted-light" />
          <span className="text-theme-text-primary-light dark:text-theme-text-primary-dark font-medium">
            Privacy Policy
          </span>
        </nav>

        {/* Hero Header */}
        <div className="border-b border-theme-border-light dark:border-theme-border-dark pb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-theme-hover-light/10 text-theme-hover-light dark:text-theme-hover-dark mb-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Data Protection & Privacy</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark tracking-tight mb-3">
            Privacy Policy
          </h1>
          <p className="text-xs sm:text-sm text-theme-text-secondary-light dark:text-theme-text-secondary-dark max-w-2xl leading-relaxed">
            We value your trust above all else. This Privacy Policy outlines our transparent practices regarding data collection, security, and customer privacy across our website and order services.
          </p>
        </div>

        {/* 4 Privacy Commitments */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {commitments.map((c, idx) => {
            const Icon = c.icon;
            return (
              <div
                key={idx}
                className="p-5 rounded-xl border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark space-y-2.5 shadow-2xs hover:border-theme-hover-light/60 transition-all"
              >
                <div className="w-9 h-9 rounded-lg bg-theme-hover-light/10 dark:bg-theme-hover-dark/10 flex items-center justify-center text-theme-hover-light dark:text-theme-hover-dark">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-serif font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
                  {c.title}
                </h3>
                <p className="text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark leading-relaxed">
                  {c.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Policy Sections */}
        <div className="space-y-6">
          {sections.map((sec, idx) => (
            <div
              key={idx}
              className="p-6 sm:p-8 rounded-xl border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark space-y-3 shadow-2xs"
            >
              <h2 className="text-base sm:text-lg font-serif font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
                {sec.title}
              </h2>
              <div className="text-xs sm:text-sm text-theme-text-secondary-light dark:text-theme-text-secondary-dark leading-relaxed">
                {sec.content}
              </div>
            </div>
          ))}
        </div>

        {/* Action CTA Box */}
        <div className="p-6 sm:p-8 rounded-2xl border border-theme-hover-light/30 dark:border-theme-hover-dark/30 bg-theme-card-light dark:bg-theme-card-dark flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xs">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-base sm:text-lg font-serif font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
              Have questions regarding your data privacy?
            </h3>
            <p className="text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
              Contact our team directly for privacy inquiries or account data requests.
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap justify-center">
            <Link
              href="/contact"
              className="px-5 py-2.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-neutral-100 dark:hover:bg-neutral-200 dark:text-neutral-900 text-xs font-semibold uppercase tracking-wider transition-all inline-flex items-center gap-1.5"
            >
              <span>Contact Us</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
