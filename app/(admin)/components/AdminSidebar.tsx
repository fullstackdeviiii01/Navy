"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { GiNewspaper } from "react-icons/gi";
import {
  FaHome,
  FaUsers,
  FaUserShield,
  FaChartLine,
  FaShoppingCart,
  FaSignOutAlt,
  FaBox,
  FaFolderOpen,
  FaTicketAlt,
  FaBars,
  FaTimes,
  FaFileAlt,
  FaUndo,
  FaShippingFast,
  FaChevronDown,
} from "react-icons/fa";
import {
  FaChartBar,
  FaCreditCard,
  FaEnvelope,
  FaRobot,
  FaStar,
  FaUserTie,
} from "react-icons/fa6";

import { useUser } from "../../context/UserContext";
import { useState } from "react";
import { BsFillPatchQuestionFill } from "react-icons/bs";

type LinkItem = {
  type: "link";
  href: string;
  label: string;
  icon: React.ElementType;
};

type GroupItem = {
  type: "group";
  key: string;
  label: string;
  icon: React.ElementType;
  children: { href: string; label: string; icon: React.ElementType }[];
};

type MenuItem = LinkItem | GroupItem;

export default function AdminSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { name, avatar, logout } = useUser();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  const handleSignOut = async () => {
    try {
      await logout();
      router.push("/sign-in");
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  const closeSidebar = () => setIsSidebarOpen(false);

  const toggleGroup = (key: string) => {
    setOpenGroups((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const isGroupActive = (children: { href: string }[]) =>
    children.some((c) => pathname === c.href);

  const menuItems: MenuItem[] = [
    {
      type: "link",
      href: "/admin/dashboard",
      label: "Dashboard",
      icon: FaHome,
    },
    { type: "link", href: "/admin/products", label: "Products", icon: FaBox },
    {
      type: "link",
      href: "/admin/categories",
      label: "Categories",
      icon: FaFolderOpen,
    },
    {
      type: "link",
      href: "/admin/site-settings",
      label: "Site Settings",
      icon: FaFileAlt,
    },
    {
      type: "link",
      href: "/admin/orders",
      label: "Orders",
      icon: FaShoppingCart,
    },
    { type: "link", href: "/admin/returns", label: "Returns", icon: FaUndo },
    {
      type: "link",
      href: "/admin/coupons",
      label: "Coupons",
      icon: FaTicketAlt,
    },
    { type: "link", href: "/admin/chatbot", label: "Chatbot", icon: FaRobot },
    {
      type: "link",
      href: "/admin/customers",
      label: "Customers",
      icon: FaUserTie,
    },

    {
      type: "group",
      key: "users",
      label: "Users",
      icon: FaUsers,
      children: [
        {
          href: "/admin/users/UserManagement",
          label: "User Management",
          icon: FaUsers,
        },
        {
          href: "/admin/users/RoleManagement",
          label: "Role Management",
          icon: FaUserShield,
        },
      ],
    },
    {
      type: "link",
      href: "/admin/reviews",
      label: "User Reviews",
      icon: FaStar,
    },
    {
      type: "link",
      href: "/admin/faqs",
      label: "FAQs",
      icon: BsFillPatchQuestionFill,
    },
    {
      type: "link",
      href: "/admin/shipping-services",
      label: "Shipping Services",
      icon: FaShippingFast,
    },
    {
      type: "link",
      href: "/admin/email-configuration",
      label: "Email Config",
      icon: FaEnvelope,
    },
    {
      type: "link",
      href: "/admin/newsletter",
      label: "Newsletter",
      icon: GiNewspaper,
    },
    {
      type: "link",
      href: "/admin/reports",
      label: "Report & Analytics",
      icon: FaChartBar,
    },
    {
      type: "link",
      href: "/admin/payment-gateways",
      label: "Payment Gateways",
      icon: FaCreditCard,
    },
    {
      type: "link",
      href: "/admin/activity",
      label: "Activity",
      icon: FaChartLine,
    },
  ];

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-theme-surface-light dark:bg-theme-surface-dark border-b border-theme-border-light dark:border-theme-border-dark px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-theme-hover-bg-light dark:hover:bg-theme-hover-bg-dark rounded-lg transition-colors"
          >
            <FaBars className="h-5 w-5 text-theme-text-primary-light dark:text-theme-text-primary-dark" />
          </button>
          <h1 className="text-lg font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
            Admin Panel
          </h1>
        </div>
        <img
          src={
            avatar ||
            "https://www.shutterstock.com/image-vector/default-avatar-profile-icon-social-600nw-1906669723.jpg"
          }
          alt="Avatar"
          className="w-8 h-8 rounded-full object-cover"
        />
      </div>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-full w-64 bg-theme-surface-light dark:bg-theme-surface-dark shadow-lg border-r border-theme-border-light dark:border-theme-border-dark flex flex-col z-50 transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        {/* Close button for mobile */}
        <button
          onClick={closeSidebar}
          className="lg:hidden absolute top-4 right-4 p-2 hover:bg-theme-hover-bg-light dark:hover:bg-theme-hover-bg-dark rounded-lg"
        >
          <FaTimes className="h-5 w-5 text-theme-text-secondary-light dark:text-theme-text-secondary-dark" />
        </button>

        {/* Header */}
        <div className="flex-shrink-0 p-6 border-b border-theme-border-light dark:border-theme-border-dark">
          <div className="flex items-center space-x-3">
            <img
              src={
                avatar ||
                "https://www.shutterstock.com/image-vector/default-avatar-profile-icon-social-600nw-1906669723.jpg"
              }
              alt="Admin Avatar"
              className="w-10 h-10 rounded-full object-cover"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark truncate">
                {name || "Admin User"}
              </p>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                Admin
              </span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-5">
          <ul className="space-y-2 px-4">
            {menuItems.map((item) => {
              if (item.type === "group") {
                const groupActive = isGroupActive(item.children);
                const isOpen = openGroups[item.key] ?? groupActive;
                const Icon = item.icon;

                return (
                  <li key={item.key}>
                    <button
                      onClick={() => toggleGroup(item.key)}
                      className={`w-full flex items-center px-4 py-2.5 rounded-lg transition-colors ${
                        groupActive
                          ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                          : "text-theme-text-secondary-light dark:text-theme-text-secondary-dark hover:bg-theme-hover-bg-light dark:hover:bg-theme-hover-bg-dark"
                      }`}
                    >
                      <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                      <span className="flex-1 text-left">{item.label}</span>
                      <FaChevronDown
                        className={`h-3 w-3 flex-shrink-0 transition-transform duration-200 ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    <div
                      className={`overflow-hidden transition-all duration-200 ease-in-out ${
                        isOpen ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
                      }`}
                    >
                      <ul className="mt-1 ml-4 pl-3 border-l border-theme-border-light dark:border-theme-border-dark space-y-1">
                        {item.children.map((child) => {
                          const ChildIcon = child.icon;
                          const isActive = pathname === child.href;
                          return (
                            <li key={child.href}>
                              <Link
                                href={child.href}
                                onClick={closeSidebar}
                                className={`w-full flex items-center px-3 py-2 rounded-lg transition-colors text-sm ${
                                  isActive
                                    ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                                    : "text-theme-text-secondary-light dark:text-theme-text-secondary-dark hover:bg-theme-hover-bg-light dark:hover:bg-theme-hover-bg-dark"
                                }`}
                              >
                                <ChildIcon className="mr-2.5 h-4 w-4 flex-shrink-0" />
                                {child.label}
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </li>
                );
              }

              // type === "link"
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={closeSidebar}
                    className={`w-full flex items-center px-4 py-2.5 rounded-lg transition-colors ${
                      isActive
                        ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                        : "text-theme-text-secondary-light dark:text-theme-text-secondary-dark hover:bg-theme-hover-bg-light dark:hover:bg-theme-hover-bg-dark"
                    }`}
                  >
                    <Icon className="mr-3 h-5 w-5" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="flex-shrink-0 p-4 border-t border-theme-border-light dark:border-theme-border-dark">
          <a
            href="https://ecomm.sysfoc.com"
            target="_blank"
            rel="noopener noreferrer"
            onClick={closeSidebar}
            className="flex items-center px-4 py-2 text-theme-text-secondary-light dark:text-theme-text-secondary-dark hover:bg-theme-hover-bg-light dark:hover:bg-theme-hover-bg-dark rounded-lg transition-colors mb-2"
          >
            <FaHome className="mr-3 h-5 w-5" />
            Back to Site
          </a>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center px-4 py-2 text-theme-error dark:text-theme-error hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            <FaSignOutAlt className="mr-3 h-5 w-5" />
            Sign Out
          </button>
        </div>
      </div>
    </>
  );
}
