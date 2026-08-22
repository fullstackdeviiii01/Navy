// app/(admin)/patrons/views/PatronDirectoryView.tsx
"use client";

import { useState, useEffect } from "react";
import { usersApi } from "../../../../lib/api/users";
import PatronAnalyticsRibbon from "../components/PatronAnalyticsRibbon";
import PatronFilterToolbar from "../components/PatronFilterToolbar";
import PatronDataTable from "../components/PatronDataTable";
import PatronProfileModal from "../components/PatronProfileModal";
import Loader from "../../../components/shared/Loader";
import { Users2 } from "lucide-react";

interface Customer {
  _id: string;
  uid: string;
  email: string;
  name: string;
  phone?: string;
  role: string;
  is_active: boolean;
  is_banned: boolean;
  order_count: number;
  total_spent: number;
  customer_since: string;
  last_login_at: string;
  addresses: any[];
  cart: any[];
  wishlist: any[];
  preferred_currency?: string;
  marketing_opt_in?: boolean;
  isGuest?: boolean;
}

interface Stats {
  totalCustomers: number;
  activeCustomers: number;
  bannedCustomers: number;
  newThisMonth: number;
  totalRevenue: number;
  averageOrderValue: number;
  registeredCustomers: number;
  guestCustomers: number;
}

export default function PatronDirectoryView() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const [stats, setStats] = useState<Stats>({
    totalCustomers: 0,
    activeCustomers: 0,
    bannedCustomers: 0,
    newThisMonth: 0,
    totalRevenue: 0,
    averageOrderValue: 0,
    registeredCustomers: 0,
    guestCustomers: 0,
  });

  const [filters, setFilters] = useState({
    status: "all",
    orderRange: "all",
    joinedDate: "all",
    spendingRange: "all",
    customerType: "all",
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [customers, searchTerm, filters]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);

      const usersData = await usersApi.getAll();
      const registeredCustomers = (usersData.users || []).filter(
        (user: Customer) => user.order_count > 0 || user.role === "customer"
      );

      const token = localStorage.getItem("auth_token");
      if (!token) {
        setCustomers(registeredCustomers);
        calculateStats(registeredCustomers);
        setLoading(false);
        return;
      }

      try {
        const guestResponse = await fetch("/api/users/guests", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (guestResponse.ok) {
          const guestData = await guestResponse.json();
          const allCustomers = [...registeredCustomers, ...(guestData.guests || [])];
          setCustomers(allCustomers);
          calculateStats(allCustomers);
        } else {
          setCustomers(registeredCustomers);
          calculateStats(registeredCustomers);
        }
      } catch {
        setCustomers(registeredCustomers);
        calculateStats(registeredCustomers);
      }
    } catch (error) {
      console.error("Failed to fetch customers:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (customerData: Customer[]) => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const totalCustomers = customerData.length;
    const registeredCustomers = customerData.filter((c) => !c.isGuest).length;
    const guestCustomers = customerData.filter((c) => c.isGuest).length;
    const activeCustomers = customerData.filter(
      (c) => c.is_active && !c.is_banned
    ).length;
    const bannedCustomers = customerData.filter((c) => c.is_banned).length;

    const newThisMonth = customerData.filter((c) => {
      const joinDate = new Date(c.customer_since);
      return (
        joinDate.getMonth() === currentMonth &&
        joinDate.getFullYear() === currentYear
      );
    }).length;

    const totalRevenue = customerData.reduce(
      (sum, c) => sum + (c.total_spent || 0),
      0
    );
    const customersWithOrders = customerData.filter(
      (c) => c.order_count > 0
    ).length;
    const averageOrderValue =
      customersWithOrders > 0 ? totalRevenue / customersWithOrders : 0;

    setStats({
      totalCustomers,
      activeCustomers,
      bannedCustomers,
      newThisMonth,
      totalRevenue,
      averageOrderValue,
      registeredCustomers,
      guestCustomers,
    });
  };

  const applyFilters = () => {
    let filtered = [...customers];

    if (searchTerm) {
      filtered = filtered.filter(
        (customer) =>
          customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          customer.phone?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filters.customerType !== "all") {
      if (filters.customerType === "registered") {
        filtered = filtered.filter((c) => !c.isGuest);
      } else if (filters.customerType === "guest") {
        filtered = filtered.filter((c) => c.isGuest);
      }
    }

    if (filters.status !== "all") {
      if (filters.status === "active") {
        filtered = filtered.filter((c) => c.is_active && !c.is_banned);
      } else if (filters.status === "inactive") {
        filtered = filtered.filter((c) => !c.is_active);
      } else if (filters.status === "banned") {
        filtered = filtered.filter((c) => c.is_banned);
      }
    }

    if (filters.orderRange !== "all") {
      if (filters.orderRange === "0") {
        filtered = filtered.filter((c) => c.order_count === 0);
      } else if (filters.orderRange === "1-5") {
        filtered = filtered.filter(
          (c) => c.order_count >= 1 && c.order_count <= 5
        );
      } else if (filters.orderRange === "6-20") {
        filtered = filtered.filter(
          (c) => c.order_count >= 6 && c.order_count <= 20
        );
      } else if (filters.orderRange === "20+") {
        filtered = filtered.filter((c) => c.order_count > 20);
      }
    }

    setFilteredCustomers(filtered);
  };

  const handleViewCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowDetailsModal(true);
  };

  const handleToggleStatus = async (
    customerId: string,
    currentStatus: boolean
  ) => {
    if (customerId.startsWith("guest-")) {
      alert("Cannot modify guest customer status");
      return;
    }

    try {
      await usersApi.updateStatus(customerId, { is_active: !currentStatus });
      fetchCustomers();
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  const handleToggleBan = async (
    customerId: string,
    currentBanStatus: boolean
  ) => {
    if (customerId.startsWith("guest-")) {
      alert("Cannot block guest customers");
      return;
    }

    if (
      !confirm(
        `Are you sure you want to ${
          currentBanStatus ? "unblock" : "block"
        } this customer?`
      )
    ) {
      return;
    }

    try {
      await usersApi.updateStatus(customerId, { is_banned: !currentBanStatus });
      fetchCustomers();
    } catch (error) {
      console.error("Failed to update block status:", error);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-theme-border-light/80 dark:border-theme-border-dark/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-serif font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark tracking-tight">
              Customer Management
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
              <Users2 className="w-3 h-3" />
              All Customers
            </span>
          </div>
          <p className="text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark mt-0.5">
            Manage registered customers, view order history, and handle guest accounts.
          </p>
        </div>
      </div>

      {/* KPI Stats Ribbon */}
      <PatronAnalyticsRibbon stats={stats} />

      {/* Filter Toolbar */}
      <PatronFilterToolbar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filters={filters}
        onFiltersChange={setFilters}
      />

      {/* Main Table */}
      {loading ? (
        <div className="min-h-[300px] flex items-center justify-center bg-theme-surface-light dark:bg-theme-surface-dark rounded-xl border border-theme-border-light dark:border-theme-border-dark p-12">
          <Loader />
        </div>
      ) : (
        <PatronDataTable
          customers={filteredCustomers}
          onViewCustomer={handleViewCustomer}
          onToggleStatus={handleToggleStatus}
          onToggleBan={handleToggleBan}
        />
      )}

      {/* Modal */}
      {showDetailsModal && selectedCustomer && (
        <PatronProfileModal
          customer={selectedCustomer}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedCustomer(null);
          }}
          onUpdate={fetchCustomers}
        />
      )}
    </div>
  );
}
