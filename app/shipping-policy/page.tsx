// app/shipping-policy/page.tsx
import { Metadata } from "next";
import Link from "next/link";
import {
  ChevronRight,
  Truck,
  Box,
  ShieldCheck,
  Clock,
  MapPin,
  CheckCircle2,
  ArrowRight,
  PhoneCall,
  Sparkles,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Shipping & Delivery Policy | Rehan Wooden Lamps",
  description:
    "Learn about our insured domestic shipping across Pakistan, delivery timeframes by city, fragile packaging standards, and tracking.",
};

export default function ShippingPolicyPage() {
  const highlights = [
    {
      icon: Truck,
      title: "Nationwide Tracked Delivery",
      description: "We ship to all major cities and towns across Pakistan via trusted express couriers (TCS, Leopards, Trax).",
    },
    {
      icon: Box,
      title: "Custom Protective Packaging",
      description: "High-density molded foam inserts and heavy-duty corrugated crates safeguard delicate wood and glass components.",
    },
    {
      icon: Clock,
      title: "24–48h Dispatch",
      description: "Standard catalogue orders are packed and dispatched from our workshop within 1–2 business days.",
    },
    {
      icon: ShieldCheck,
      title: "100% Insured In Transit",
      description: "Every shipment is fully covered against courier handling damage, loss, or transit mishaps.",
    },
  ];

  const deliverySchedules = [
    {
      region: "Karachi (Local Hub)",
      timeframe: "1 – 2 Business Days",
      rate: "Standard Courier Rate / Free on Qualifying Orders",
      courier: "Direct Express Courier",
    },
    {
      region: "Lahore, Islamabad & Rawalpindi",
      timeframe: "2 – 3 Business Days",
      rate: "Standard Courier Rate / Free on Qualifying Orders",
      courier: "TCS / Leopards Express",
    },
    {
      region: "Faisalabad, Multan, Peshawar, Quetta",
      timeframe: "3 – 4 Business Days",
      rate: "Standard Courier Rate / Free on Qualifying Orders",
      courier: "TCS / Leopards / Trax",
    },
    {
      region: "Other Cities & Remote Districts",
      timeframe: "4 – 6 Business Days",
      rate: "Standard Courier Rate / Free on Qualifying Orders",
      courier: "Tracked Postal / Courier Network",
    },
  ];

  const packingStandards = [
    {
      title: "Custom Molded High-Density Foam",
      description: "Each lamp body is cradled in contoured foam shock barriers that absorb road vibrations during transit.",
    },
    {
      title: "Isolated Electrical & Shade Housing",
      description: "Ceramic sockets, braided fabric cords, and artisanal shades are isolated to eliminate scuff marks.",
    },
    {
      title: "Reinforced Multi-Ply Corrugated Boxing",
      description: "Heavy-duty 5-ply cartons with moisture-barrier seals protect against humid storage and stacking pressure.",
    },
    {
      title: "Fragile Glass & Precision Labels",
      description: "Prominent 'Handle with Care / Fragile Glass' markings alert courier handlers at every sorting hub.",
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
            Shipping Policy
          </span>
        </nav>

        {/* Hero Header */}
        <div className="border-b border-theme-border-light dark:border-theme-border-dark pb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-theme-hover-light/10 text-theme-hover-light dark:text-theme-hover-dark mb-3">
            <Truck className="w-3.5 h-3.5" />
            <span>Careful Packaging & Fast Dispatch</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark tracking-tight mb-3">
            Shipping & Delivery
          </h1>
          <p className="text-xs sm:text-sm text-theme-text-secondary-light dark:text-theme-text-secondary-dark max-w-2xl leading-relaxed">
            We take tremendous care in delivering our handcrafted solid wood lamps to your doorstep anywhere in Pakistan. Learn about our delivery schedules, rates, and packaging standards below.
          </p>
        </div>

        {/* 4 Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {highlights.map((h, idx) => {
            const Icon = h.icon;
            return (
              <div
                key={idx}
                className="p-5 rounded-xl border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark space-y-2.5 shadow-2xs hover:border-theme-hover-light/60 transition-all"
              >
                <div className="w-9 h-9 rounded-lg bg-theme-hover-light/10 dark:bg-theme-hover-dark/10 flex items-center justify-center text-theme-hover-light dark:text-theme-hover-dark">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-serif font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
                  {h.title}
                </h3>
                <p className="text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark leading-relaxed">
                  {h.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Delivery Timelines Table */}
        <div className="space-y-4">
          <div className="border-b border-theme-border-light/80 dark:border-theme-border-dark/80 pb-3">
            <h2 className="text-xl font-serif font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
              Estimated Delivery Timeframes
            </h2>
            <p className="text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark mt-0.5">
              Calculated from the date of workshop dispatch
            </p>
          </div>

          <div className="rounded-xl border border-theme-border-light dark:border-theme-border-dark overflow-hidden bg-theme-surface-light dark:bg-theme-surface-dark shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-theme-border-light dark:border-theme-border-dark bg-theme-bg-light/60 dark:bg-theme-bg-dark/40 text-[10px] uppercase tracking-wider font-semibold text-theme-text-muted-light">
                    <th className="py-3 px-4 sm:px-6">Destination Region</th>
                    <th className="py-3 px-4 sm:px-6">Estimated Transit</th>
                    <th className="py-3 px-4 sm:px-6">Carrier Partner</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-theme-border-light/60 dark:divide-theme-border-dark/60">
                  {deliverySchedules.map((row, i) => (
                    <tr key={i} className="hover:bg-theme-bg-light/40 dark:hover:bg-theme-bg-dark/20 transition-colors">
                      <td className="py-3.5 px-4 sm:px-6 font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-theme-hover-light shrink-0" />
                        <span>{row.region}</span>
                      </td>
                      <td className="py-3.5 px-4 sm:px-6 text-theme-text-secondary-light dark:text-theme-text-secondary-dark font-medium">
                        {row.timeframe}
                      </td>
                      <td className="py-3.5 px-4 sm:px-6 text-theme-text-muted-light dark:text-theme-text-muted-dark">
                        {row.courier}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Packaging Quality Standards */}
        <div className="space-y-6">
          <div className="border-b border-theme-border-light/80 dark:border-theme-border-dark/80 pb-3">
            <h2 className="text-xl font-serif font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
              Fragile Packaging Standards
            </h2>
            <p className="text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark mt-0.5">
              Engineered to ensure your handcrafted piece arrives in pristine condition
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {packingStandards.map((std, idx) => (
              <div
                key={idx}
                className="p-5 rounded-xl border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark space-y-2 shadow-2xs"
              >
                <div className="flex items-center gap-2 text-sm font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>{std.title}</span>
                </div>
                <p className="text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark leading-relaxed pl-6">
                  {std.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Live Tracking Information */}
        <div className="p-6 sm:p-8 rounded-xl border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark space-y-4">
          <h2 className="text-lg font-serif font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark flex items-center gap-2">
            <Clock className="w-5 h-5 text-theme-hover-light dark:text-theme-hover-dark" />
            <span>Order Tracking & Dispatch Alerts</span>
          </h2>
          <p className="text-xs sm:text-sm text-theme-text-secondary-light dark:text-theme-text-secondary-dark leading-relaxed">
            As soon as your package is handed over to the courier partner, an automated dispatch notification is sent to your email and phone with a live consignment tracking code. You can also view live delivery progress anytime using our <strong>Track Order</strong> portal.
          </p>
        </div>

        {/* Action CTA Box */}
        <div className="p-6 sm:p-8 rounded-2xl border border-theme-hover-light/30 dark:border-theme-hover-dark/30 bg-theme-card-light dark:bg-theme-card-dark flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xs">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-base sm:text-lg font-serif font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
              Track your current parcel shipment
            </h3>
            <p className="text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
              Enter your Order Number and phone or email to check real-time courier status.
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap justify-center">
            <Link
              href="/track-order"
              className="px-5 py-2.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-neutral-100 dark:hover:bg-neutral-200 dark:text-neutral-900 text-xs font-semibold uppercase tracking-wider transition-all inline-flex items-center gap-1.5"
            >
              <span>Track Order</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/contact"
              className="px-5 py-2.5 rounded-lg border border-theme-border-light dark:border-theme-border-dark hover:border-theme-hover-light bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-primary-light dark:text-theme-text-primary-dark text-xs font-semibold uppercase tracking-wider transition-colors"
            >
              <span>Contact Support</span>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
