// app/(admin)/access-control/views/RoleGovernanceView.tsx
"use client";

import { useState, useEffect } from "react";
import RoleGovernanceTable from "../components/RoleGovernanceTable";
import RoleElevationModal from "../components/RoleElevationModal";
import Loader from "../../../components/shared/Loader";
import { Shield, ShieldCheck, Search } from "lucide-react";

interface RoleUser {
  _id: string;
  uid: string;
  email: string;
  name: string;
  role: string;
  is_active: boolean;
  is_banned: boolean;
  customer_since: string;
  last_login_at: string;
  order_count: number;
  total_spent: number;
}

export default function RoleGovernanceView() {
  const [users, setUsers] = useState<RoleUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [userToPromote, setUserToPromote] = useState<RoleUser | null>(null);

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
      console.error("Failed to fetch users for roles:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === "all" || user.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const adminUsers = users.filter((user) => user.role === "admin");
  const regularUsers = users.filter((user) => user.role !== "admin");

  const handlePromoteClick = (user: RoleUser) => {
    setUserToPromote(user);
    setShowConfirmModal(true);
  };

  const confirmPromotion = async () => {
    if (!userToPromote) return;

    try {
      const token = document.cookie.split("__session=")[1]?.split(";")[0] || localStorage.getItem("auth_token");
      const response = await fetch(`/api/users/${userToPromote._id}/promote`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        fetchUsers();
        setShowConfirmModal(false);
        setUserToPromote(null);
      }
    } catch (error) {
      console.error("Failed to promote user:", error);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-theme-border-light/80 dark:border-theme-border-dark/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-serif font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark tracking-tight">
              User Roles & Permissions
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300">
              <ShieldCheck className="w-3 h-3" />
              Roles
            </span>
          </div>
          <p className="text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark mt-0.5">
            Manage admin permissions and user roles.
          </p>
        </div>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl border border-purple-200 dark:border-purple-900/60 bg-purple-50/50 dark:bg-purple-950/30 flex items-center justify-between">
          <div>
            <span className="text-[11px] uppercase font-mono tracking-wider font-semibold text-purple-900 dark:text-purple-200">
              Administrators
            </span>
            <p className="text-2xl font-bold font-serif text-purple-900 dark:text-purple-100 mt-1">
              {adminUsers.length}
            </p>
            <p className="text-[11px] text-purple-700 dark:text-purple-300">
              Full admin access
            </p>
          </div>
          <div className="p-2.5 rounded-xl bg-purple-100 dark:bg-purple-900/80 text-purple-700 dark:text-purple-200">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark flex items-center justify-between">
          <div>
            <span className="text-[11px] uppercase font-mono tracking-wider font-semibold text-theme-text-muted-light">
              Regular Users
            </span>
            <p className="text-2xl font-bold font-serif text-theme-text-primary-light dark:text-theme-text-primary-dark mt-1">
              {regularUsers.length}
            </p>
            <p className="text-[11px] text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
              Customer accounts
            </p>
          </div>
          <div className="p-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200">
            <Shield className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-theme-surface-light dark:bg-theme-surface-dark p-3.5 sm:p-4 rounded-xl border border-theme-border-light dark:border-theme-border-dark shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
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

        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          className="px-3 py-2 text-xs border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-neutral-500/40 cursor-pointer"
        >
          <option value="all">All Roles</option>
          <option value="admin">Administrators Only</option>
          <option value="user">Regular Users</option>
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="min-h-[300px] flex items-center justify-center bg-theme-surface-light dark:bg-theme-surface-dark rounded-xl border border-theme-border-light dark:border-theme-border-dark p-12">
          <Loader />
        </div>
      ) : (
        <RoleGovernanceTable
          users={filteredUsers}
          onPromoteClick={handlePromoteClick}
        />
      )}

      {/* Confirmation Modal */}
      <RoleElevationModal
        isOpen={showConfirmModal}
        user={userToPromote}
        onConfirm={confirmPromotion}
        onCancel={() => {
          setShowConfirmModal(false);
          setUserToPromote(null);
        }}
      />
    </div>
  );
}
