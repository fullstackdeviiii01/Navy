"use client";

import { withRoleAccess } from "../context/UserContext";
import AdminSidebar from "../(admin)/components/AdminSidebar";

function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-theme-bg-light dark:bg-theme-bg-dark">
      <AdminSidebar />
      <div className="flex-1 lg:ml-64 overflow-y-auto pt-16 lg:pt-0">
        <div className="p-4 lg:p-6">{children}</div>
      </div>
    </div>
  );
}

export default withRoleAccess(AdminLayout, ["admin"], {
  fallback: (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Access Denied
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          You need admin privileges to access this page.
        </p>
      </div>
    </div>
  ),
  showLoading: true,
});