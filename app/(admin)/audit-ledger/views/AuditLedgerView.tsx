// app/(admin)/audit-ledger/views/AuditLedgerView.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import AuditFilterToolbar from "../components/AuditFilterToolbar";
import AuditLedgerTable from "../components/AuditLedgerTable";
import AuditIdentityModal from "../components/AuditIdentityModal";
import Loader from "../../../components/shared/Loader";
import { usersApi } from "../../../../lib/api/users";

interface LoginActivity {
  _id: string;
  email: string;
  name: string;
  login_at: string;
  ip: string;
  method: string;
  user_agent?: string;
}

const PAGE_SIZE = 15;

export default function AuditLedgerView() {
  const [loginActivities, setLoginActivities] = useState<LoginActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState<string>("7");
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchActivities();
  }, [dateFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const data = await usersApi.getActivities(Number(dateFilter));
      setLoginActivities(data.loginActivities || []);
    } catch (error) {
      console.error("Failed to fetch activities:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredActivities = useMemo(() => {
    if (!searchTerm.trim()) return loginActivities;
    const q = searchTerm.toLowerCase();
    return loginActivities.filter(
      (a) =>
        a.email?.toLowerCase().includes(q) ||
        a.name?.toLowerCase().includes(q)
    );
  }, [loginActivities, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredActivities.length / PAGE_SIZE));
  const paginatedActivities = filteredActivities.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const viewUserDetails = async (user: LoginActivity) => {
    try {
      const userData = await usersApi.getById(user._id);
      setSelectedUser({ ...user, ...userData });
      setShowUserModal(true);
    } catch (error) {
      setSelectedUser(user);
      setShowUserModal(true);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      <AuditFilterToolbar
        dateFilter={dateFilter}
        onDateFilterChange={(val) => {
          setDateFilter(val);
          setCurrentPage(1);
        }}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      {loading ? (
        <div className="min-h-[300px] flex items-center justify-center bg-theme-surface-light dark:bg-theme-surface-dark rounded-xl border border-theme-border-light dark:border-theme-border-dark p-12">
          <Loader />
        </div>
      ) : (
        <AuditLedgerTable
          activities={paginatedActivities}
          onViewUserDetails={viewUserDetails}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}

      <AuditIdentityModal
        isOpen={showUserModal}
        onClose={() => setShowUserModal(false)}
        user={selectedUser}
      />
    </div>
  );
}
