// app/(admin)/components/AdminSidebar.tsx
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import {
  LayoutDashboard,
  Box,
  FolderTree,
  ShoppingBag,
  RotateCcw,
  Tag,
  Users,
  ShieldCheck,
  Star,
  Sliders,
  Truck,
  Mail,
  BarChart3,
  LogOut,
  ChevronDown,
  X,
} from "lucide-react";
import { useUser } from "../../context/UserContext";
import { useState, useEffect } from "react";
import { siteSettingsApi } from "../../../lib/api/siteSettings";

interface AdminSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

type NavLink = {
  type: "link";
  href: string;
  label: string;
  icon: React.ElementType;
};

type NavGroup = {
  type: "group";
  key: string;
  label: string;
  icon: React.ElementType;
  children: { href: string; label: string; icon: React.ElementType }[];
};

type NavSection = {
  sectionTitle?: string;
  items: (NavLink | NavGroup)[];
};

export default function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { name, logout } = useUser();
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const [companyInfo, setCompanyInfo] = useState<{
    company_name?: string;
    company_logo?: string;
  }>({
    company_name: "Talal Wooden Lamps",
    company_logo: "",
  });

  useEffect(() => {
    const fetchCompanyInfo = async () => {
      try {
        const data = await siteSettingsApi.getCompanyInfo();
        if (data?.company_info) {
          setCompanyInfo({
            company_name: data.company_info.company_name || "Talal Wooden Lamps",
            company_logo: data.company_info.company_logo || "",
          });
        }
      } catch (error) {
        console.error("Failed to fetch company info for sidebar:", error);
      }
    };
    fetchCompanyInfo();
  }, []);

  const handleSignOut = async () => {
    try {
      await logout();
      router.push("/sign-in");
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  const toggleGroup = (key: string) => {
    setOpenGroups((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const isGroupActive = (children: { href: string }[]) =>
    children.some((c) => pathname === c.href || pathname.startsWith(c.href + "/"));

  const navSections: NavSection[] = [
    {
      sectionTitle: "MAIN",
      items: [
        {
          type: "link",
          href: "/admin/dashboard",
          label: "Dashboard",
          icon: LayoutDashboard,
        },
      ],
    },
    {
      sectionTitle: "PRODUCTS & ORDERS",
      items: [
        {
          type: "link",
          href: "/admin/products",
          label: "Products",
          icon: Box,
        },
        {
          type: "link",
          href: "/admin/categories",
          label: "Categories",
          icon: FolderTree,
        },
        {
          type: "link",
          href: "/admin/orders",
          label: "Orders",
          icon: ShoppingBag,
        },
        {
          type: "link",
          href: "/admin/returns",
          label: "Returns & Refunds",
          icon: RotateCcw,
        },
        {
          type: "link",
          href: "/admin/coupons",
          label: "Coupons & Discounts",
          icon: Tag,
        },
      ],
    },
    {
      sectionTitle: "CUSTOMERS & REVIEWS",
      items: [
        {
          type: "link",
          href: "/admin/customers",
          label: "Customers",
          icon: Users,
        },
        {
          type: "group",
          key: "users",
          label: "Staff & Roles",
          icon: ShieldCheck,
          children: [
            {
              href: "/admin/users/UserManagement",
              label: "All Users",
              icon: Users,
            },
            {
              href: "/admin/users/RoleManagement",
              label: "User Roles",
              icon: ShieldCheck,
            },
          ],
        },
        {
          type: "link",
          href: "/admin/reviews",
          label: "Customer Reviews",
          icon: Star,
        },
      ],
    },
    {
      sectionTitle: "SETTINGS & REPORTS",
      items: [
        {
          type: "link",
          href: "/admin/site-settings",
          label: "Website Settings",
          icon: Sliders,
        },
        {
          type: "link",
          href: "/admin/shipping-services",
          label: "Shipping Methods",
          icon: Truck,
        },
        {
          type: "link",
          href: "/admin/email-configuration",
          label: "Email Settings",
          icon: Mail,
        },
        {
          type: "link",
          href: "/admin/reports",
          label: "Reports & Analytics",
          icon: BarChart3,
        },
        // {
        //   type: "link",
        //   href: "/admin/activity",
        //   label: "Activity Logs",
        //   icon: Activity,
        // },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-xs z-40 transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Shell */}
      <aside
        className={`fixed left-0 top-0 bottom-0 h-full w-64 bg-theme-surface-light dark:bg-theme-surface-dark border-r border-theme-border-light dark:border-theme-border-dark flex flex-col z-50 transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 shadow-xl lg:shadow-none`}
      >
        {/* Brand Header */}
        <div className="flex-shrink-0 px-5 py-4 border-b border-theme-border-light dark:border-theme-border-dark flex items-center justify-between">
          <Link href="/admin/dashboard" onClick={onClose} className="flex items-center gap-2.5 group min-w-0">
            {companyInfo.company_logo ? (
              <div className="relative h-9 w-9 shrink-0">
                <Image
                  src={companyInfo.company_logo}
                  alt={companyInfo.company_name || "Logo"}
                  fill
                  className="object-contain mix-blend-multiply dark:mix-blend-normal"
                  sizes="36px"
                  priority
                />
              </div>
            ) : (
              /* Monogram Emblem (R | L) fallback */
              <div className="flex items-center border border-theme-border-light dark:border-theme-border-dark bg-theme-bg-light dark:bg-theme-bg-dark px-2.5 py-1 rounded-md shadow-xs shrink-0 group-hover:border-neutral-900 dark:group-hover:border-neutral-100 transition-colors">
                <span className="text-base text-theme-text-primary-light dark:text-theme-text-primary-dark tracking-tight font-normal">
                  R
                </span>
                <span className="h-3 w-[1px] bg-theme-border-light dark:border-theme-border-dark mx-1.5 inline-block" />
                <span className="text-base text-neutral-500 tracking-tight font-normal">
                  L
                </span>
              </div>
            )}
            <div className="flex flex-col leading-none min-w-0">
              <span className="text-xs tracking-wider font-bold text-theme-text-primary-light dark:text-theme-text-primary-dark truncate">
                {companyInfo.company_name || "TALAL WOODEN LAMPS"}
              </span>
              <span className="text-[9px] uppercase tracking-[0.2em] text-theme-text-muted-light font-medium mt-0.5">
                Admin Panel
              </span>
            </div>
          </Link>

          {/* Close button on mobile */}
          <button
            onClick={onClose}
            type="button"
            className="lg:hidden p-1.5 text-theme-text-secondary-light dark:text-theme-text-secondary-dark hover:text-theme-text-primary-light rounded-lg"
            aria-label="Close Sidebar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Navigation Sections */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5 scrollbar-thin">
          {navSections.map((section, sIdx) => (
            <div key={sIdx} className="space-y-1">
              {section.sectionTitle && (
                <p className="px-3 pb-1 text-[9px] uppercase tracking-[0.2em] font-semibold text-theme-text-muted-light">
                  {section.sectionTitle}
                </p>
              )}

              <ul className="space-y-0.5">
                {section.items.map((item) => {
                  if (item.type === "group") {
                    const groupActive = isGroupActive(item.children);
                    const isExpanded = openGroups[item.key] ?? groupActive;
                    const Icon = item.icon;

                    return (
                      <li key={item.key}>
                        <button
                          type="button"
                          onClick={() => toggleGroup(item.key)}
                          className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${
                            groupActive
                              ? "bg-neutral-100 dark:bg-neutral-800/80 text-theme-text-primary-light dark:text-theme-text-primary-dark"
                              : "text-theme-text-secondary-light dark:text-theme-text-secondary-dark hover:bg-theme-card-light dark:hover:bg-theme-card-dark hover:text-theme-text-primary-light"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <Icon className="w-3.5 h-3.5 shrink-0 opacity-80" />
                            <span className="truncate">{item.label}</span>
                          </div>
                          <ChevronDown
                            className={`w-3 h-3 transition-transform duration-200 opacity-60 ${
                              isExpanded ? "rotate-180" : ""
                            }`}
                          />
                        </button>

                        {isExpanded && (
                          <ul className="mt-1 ml-4 pl-2.5 border-l border-theme-border-light/70 dark:border-theme-border-dark/70 space-y-0.5">
                            {item.children.map((child) => {
                              const ChildIcon = child.icon;
                              const isActive = pathname === child.href;
                              return (
                                <li key={child.href}>
                                  <Link
                                    href={child.href}
                                    onClick={onClose}
                                    className={`flex items-center gap-2 px-2.5 py-1.5 text-xs rounded-md transition-colors ${
                                      isActive
                                        ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 font-semibold shadow-xs"
                                        : "text-theme-text-muted-light hover:text-theme-text-primary-light hover:bg-theme-card-light/50"
                                    }`}
                                  >
                                    <ChildIcon className="w-3 h-3 shrink-0 opacity-70" />
                                    <span className="truncate">{child.label}</span>
                                  </Link>
                                </li>
                              );
                            })}
                          </ul>
                        )}
                      </li>
                    );
                  }

                  // Single Link
                  const Icon = item.icon;
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/admin/dashboard" && pathname.startsWith(item.href + "/"));

                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onClose}
                        className={`flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-lg transition-all ${
                          isActive
                            ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 shadow-xs"
                            : "text-theme-text-secondary-light dark:text-theme-text-secondary-dark hover:bg-theme-card-light dark:hover:bg-theme-card-dark hover:text-theme-text-primary-light"
                        }`}
                      >
                        <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? "" : "opacity-75"}`} />
                        <span className="truncate">{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Footer Actions */}
        <div className="flex-shrink-0 p-3 border-t border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light/50 dark:bg-theme-surface-dark/50">
          <button
            type="button"
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors border border-rose-200/60 dark:border-rose-900/40"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
