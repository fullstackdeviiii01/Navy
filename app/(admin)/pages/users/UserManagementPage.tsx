"use client";

import { useState, useEffect } from "react";
import UserManagementHeader from "../../components/users/user-management/UserManagementHeader";
import UserManagementTable from "../../components/users/user-management/UserManagementTable";
import UserDetailsModal from "../../components/users/user-management/UserDetailsModal";
import Loader from "../../../components/shared/Loader";

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

export default function UserManagementPage() {
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
      const response = await fetch("/api/users", {
        headers: {
          Authorization: `Bearer ${
            document.cookie.split("__session=")[1]?.split(";")[0]
          }`,
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

  const filteredUsers = users.filter(
    (user) =>
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const viewUserDetails = (user: User) => {
    setSelectedUser(user);
    setShowUserDetails(true);
  };

  const promoteToAdmin = async (userId: string) => {
    try {
      const response = await fetch(`/api/users/${userId}/promote`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${
            document.cookie.split("__session=")[1]?.split(";")[0]
          }`,
        },
      });

      if (response.ok) {
        fetchUsers(); // Refresh the list
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
      const response = await fetch(`/api/users/${userId}/${action}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${
            document.cookie.split("__session=")[1]?.split(";")[0]
          }`,
        },
      });

      if (response.ok) {
        fetchUsers(); // Refresh the list
      }
    } catch (error) {
      console.error(`Failed to ${action} user:`, error);
    }
  };

  if (loading) {
    return (
      <div className="relative h-64">
        <Loader />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-5 lg:space-y-6">
      <UserManagementHeader
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      {/* Results Summary */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs sm:text-sm text-theme-text-muted-light dark:text-theme-text-muted-dark">
        <p className="break-words">
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
      <UserManagementTable
        users={filteredUsers}
        onViewDetails={viewUserDetails}
        onPromoteToAdmin={promoteToAdmin}
        onToggleStatus={toggleUserStatus}
      />

      {/* User Details Modal */}
      <UserDetailsModal
        isOpen={showUserDetails}
        user={selectedUser}
        onClose={() => setShowUserDetails(false)}
      />
    </div>
  );
}