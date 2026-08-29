// app/admin/layout.tsx
"use client";

import { useState } from "react";
import { withRoleAccess } from "../context/UserContext";
import AdminSidebar from "../(admin)/components/AdminSidebar";
import AdminNavbar from "../(admin)/components/AdminNavbar";

function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark">
      {/* Sidebar Navigation */}
      <AdminSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64 overflow-hidden">
        {/* Top Navbar */}
        <AdminNavbar onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)} />

        {/* Scrollable Page Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">{children}</div>
        </main>
      </div>
    </div>
  );
}

export default withRoleAccess(AdminLayout, ["admin"], {
  fallback: (
    <div className="min-h-screen flex items-center justify-center bg-theme-bg-light dark:bg-theme-bg-dark p-4">
      <div className="text-center p-8 bg-theme-surface-light dark:bg-theme-surface-dark rounded-2xl shadow-xl border border-theme-border-light dark:border-theme-border-dark max-w-md w-full space-y-4">
        <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center font-bold text-xl">
          !
        </div>
        <h1 className="text-xl font-bold font-serif text-theme-text-primary-light dark:text-theme-text-primary-dark">
          Admin Access Required
        </h1>
        <p className="text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark leading-relaxed">
          You need an authorized administrator session to view this dashboard.
        </p>
        <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href="/sign-in?redirect=/admin/dashboard"
            className="inline-flex items-center justify-center px-5 py-2.5 bg-theme-primary hover:bg-theme-hover-light dark:hover:bg-theme-hover-dark text-theme-btn-text text-xs uppercase tracking-wider font-semibold transition-colors"
          >
            Sign In as Admin
          </a>
          <a
            href="/"
            className="inline-flex items-center justify-center px-4 py-2.5 border border-theme-border-light dark:border-theme-border-dark text-theme-text-primary-light text-xs uppercase tracking-wider font-semibold hover:bg-theme-card-light dark:hover:bg-theme-card-dark transition-colors"
          >
            Back to Store
          </a>
        </div>
      </div>
    </div>
  ),
  showLoading: true,
});