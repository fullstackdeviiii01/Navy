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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 max-w-sm mx-4">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          Access Restricted
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Executive permissions are required to access the administrative dashboard.
        </p>
      </div>
    </div>
  ),
  showLoading: true,
});