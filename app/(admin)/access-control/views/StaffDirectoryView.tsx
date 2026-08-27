// app/(admin)/access-control/views/StaffDirectoryView.tsx
"use client";

import { useState, useEffect } from "react";
import StaffManagementTable from "../components/StaffManagementTable";
import StaffProfileModal from "../components/StaffProfileModal";
import Loader from "../../../components/shared/Loader";
import { Users, Search } from "lucide-react";

interface User {
  _id: string;
  uid: string;
  email: string;
  name: string;
  role: string;
  is_active: boolean;
  is_banned: boolean;
  order_count: number;
  total_spent: number;
  customer_since: string;
  last_login_at: string;
  cart: any[];
  wishlist: any[];
  addresses: any[];
  login_history: any[];
}

export default function StaffDirectoryView() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserDetails, setShowUserDetails] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = document.cookie.split("__session=")[1]?.split(";")[0] || localStorage.getItem("auth_token");
      const response = await fetch("/api/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const viewUserDetails = (user: User) => {
    setSelectedUser(user);
    setShowUserDetails(true);
  };

  const promoteToAdmin = async (userId: string) => {
    try {
      const token = document.cookie.split("__session=")[1]?.split(";")[0] || localStorage.getItem("auth_token");
      const response = await fetch(`/api/users/${userId}/promote`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        fetchUsers();
      }
    } catch (error) {
      console.error("Failed to promote user:", error);
    }
  };

  const toggleUserStatus = async (
    userId: string,
    action: "ban" | "unban" | "activate" | "deactivate"
  ) => {
    try {
      const token = document.cookie.split("__session=")[1]?.split(";")[0] || localStorage.getItem("auth_token");
      const response = await fetch(`/api/users/${userId}/${action}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        fetchUsers();
      }
    } catch (error) {
      console.error(`Failed to ${action} user:`, error);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-theme-border-light/80 dark:border-theme-border-dark/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark tracking-tight">
              User Management
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300">
              <Users className="w-3 h-3" />
              All Users
            </span>
          </div>
          <p className="text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark mt-0.5">
            Manage user accounts, change roles, and handle account status.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-theme-surface-light dark:bg-theme-surface-dark p-3.5 sm:p-4 rounded-xl border border-theme-border-light dark:border-theme-border-dark shadow-xs flex items-center justify-between gap-3">
        <div className="flex-1 relative max-w-md">
          <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-theme-text-muted-light w-3.5 h-3.5 pointer-events-none" />
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark placeholder:text-theme-text-muted-light focus:outline-none focus:ring-2 focus:ring-neutral-500/40"
          />
        </div>
      </div>

      {/* Main Table */}
      {loading ? (
        <div className="min-h-[300px] flex items-center justify-center bg-theme-surface-light dark:bg-theme-surface-dark rounded-xl border border-theme-border-light dark:border-theme-border-dark p-12">
          <Loader />
        </div>
      ) : (
        <StaffManagementTable
          users={filteredUsers}
          onViewDetails={viewUserDetails}
          onPromoteToAdmin={promoteToAdmin}
          onToggleStatus={toggleUserStatus}
        />
      )}

      {/* User Details Modal */}
      {showUserDetails && selectedUser && (
        <StaffProfileModal
          isOpen={showUserDetails}
          user={selectedUser}
          onClose={() => {
            setShowUserDetails(false);
            setSelectedUser(null);
          }}
        />
      )}
    </div>
  );
}
