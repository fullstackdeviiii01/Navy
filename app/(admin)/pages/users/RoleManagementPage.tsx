// // RoleManagementPage.tsx
"use client";

import { useState, useEffect } from "react";
import RoleManagementHeader from "../../components/users/role-management/RoleManagementHeader";
import RoleStatsCards from "../../components/users/role-management/RoleStatsCards";
import RoleManagementTable from "../../components/users/role-management/RoleManagementTable";
import PromoteConfirmationModal from "../../components/users/role-management/PromoteConfirmationModal";
import Loader from "../../../components/shared/Loader";

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

export default function RoleManagementPage() {
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
      const response = await fetch("/api/users", {
        headers: {
          Authorization: `Bearer ${document.cookie.split("__session=")[1]?.split(";")[0]}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === "all" || user.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const adminUsers = users.filter((user) => user.role === "admin");
  const regularUsers = users.filter((user) => user.role === "user");

  const handlePromoteClick = (user: RoleUser) => {
    setUserToPromote(user);
    setShowConfirmModal(true);
  };

  const confirmPromotion = async () => {
    if (!userToPromote) return;

    try {
      const response = await fetch(`/api/users/${userToPromote._id}/promote`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${document.cookie.split("__session=")[1]?.split(";")[0]}`,
        },
      });

      if (response.ok) {
        fetchUsers(); // Refresh the list
        setShowConfirmModal(false);
        setUserToPromote(null);
      }
    } catch (error) {
      console.error("Failed to promote user:", error);
    }
  };

  const handleFiltersChange = (newFilters: { role: string; search: string }) => {
    setSelectedRole(newFilters.role);
    setSearchTerm(newFilters.search);
  };

 if (loading) {
  return (
    <div className="relative h-32 sm:h-48 lg:h-64">
      <Loader />
    </div>
  );
}

  return (
    <div className="space-y-3 sm:space-y-4 lg:space-y-6">
      <RoleManagementHeader
        searchTerm={searchTerm}
        selectedRole={selectedRole}
        onFiltersChange={handleFiltersChange}
      />

      <RoleStatsCards
        adminCount={adminUsers.length}
        regularCount={regularUsers.length}
      />

      {/* Results Summary */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 sm:gap-2 text-xs sm:text-sm text-theme-text-muted-light dark:text-theme-text-muted-dark">
        <p className="truncate">
          Showing{" "}
          <span className="font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
            {filteredUsers.length}
          </span>{" "}
          of{" "}
          <span className="font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
            {users.length}
          </span>{" "}
          users
        </p>
      </div>

      {/* Users Table */}
      <RoleManagementTable
        users={filteredUsers}
        onPromoteClick={handlePromoteClick}
      />

      {/* Confirmation Modal */}
      <PromoteConfirmationModal
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