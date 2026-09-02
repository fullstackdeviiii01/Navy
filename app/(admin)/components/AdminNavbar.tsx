// app/(admin)/components/AdminNavbar.tsx
"use client";

import Link from "next/link";
import { Menu, ExternalLink } from "lucide-react";
import { useUser } from "../../context/UserContext";

interface AdminNavbarProps {
  onToggleSidebar: () => void;
}

export default function AdminNavbar({ onToggleSidebar }: AdminNavbarProps) {
  const { name } = useUser();

  return (
    <header className="sticky top-0 z-30 bg-theme-surface-light/90 dark:bg-theme-surface-dark/90 backdrop-blur-md border-b border-theme-border-light dark:border-theme-border-dark px-4 sm:px-6 py-3 transition-colors">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Mobile Sidebar Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            type="button"
            className="lg:hidden p-2 text-theme-text-secondary-light dark:text-theme-text-secondary-dark hover:text-theme-text-primary-light dark:hover:text-theme-text-primary-dark hover:bg-theme-card-light dark:hover:bg-theme-card-dark rounded-lg transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            <Menu className="w-4 h-4" />
          </button>
        </div>

        {/* Right: Actions & Profile Pill */}
        <div className="flex items-center gap-2.5 sm:gap-3.5 shrink-0">
          {/* View Live Storefront Quick Link */}
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-bg-light/60 dark:bg-theme-bg-dark/60 text-theme-text-secondary-light dark:text-theme-text-secondary-dark hover:text-neutral-900 dark:hover:text-neutral-100 hover:border-theme-hover-light transition-colors"
          >
            <span>View Store</span>
            <ExternalLink className="w-3 h-3 opacity-70" />
          </Link>

          {/* Admin Profile Chip */}
          <div className="flex items-center gap-2 pl-2.5 border-l border-theme-border-light dark:border-theme-border-dark">
            <div className="flex flex-col text-left leading-none">
              <span className="text-xs font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
                {name || "Admin"}
              </span>
              <span className="text-[10px] uppercase tracking-wider text-theme-text-muted-light font-medium mt-0.5">
                Administrator
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
