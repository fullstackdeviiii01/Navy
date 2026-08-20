// app/components/account/AccountNavigation.tsx
"use client";

import {
  User,
  ShoppingBag,
  MapPin,
  Settings,
  MessageSquare,
} from "lucide-react";

interface AccountNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function AccountNavigation({
  activeTab,
  onTabChange,
}: AccountNavigationProps) {
  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "orders", label: "Orders", icon: ShoppingBag },
    { id: "addresses", label: "Addresses", icon: MapPin },
    { id: "reviews", label: "Reviews", icon: MessageSquare },
    { id: "preferences", label: "Settings", icon: Settings },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      <nav className="flex overflow-x-auto hide-scrollbar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              aria-label={`${tab.label} tab`}
              role="tab"
              aria-selected={isActive}
              aria-controls={`${tab.id}-panel`}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-2 px-4 sm:px-6 py-3 sm:py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors flex-shrink-0 ${
                isActive
                  ? "border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20"
                  : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700/50"
              }`}
            >
              <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
