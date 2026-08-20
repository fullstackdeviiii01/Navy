// // app/(admin)/admin/customers/page.tsx
"use client";

import { useState, useEffect } from "react";
import { FaSearch } from "react-icons/fa";
import { usersApi } from "../../../../lib/api/users";
import { auth } from "../../../../lib/firebase/firebaseClient";
import CustomerManagementHeader from "../../components/customers/CustomerManagementHeader";
import CustomerStatsCards from "../../components/customers/CustomerStatsCards";
import CustomerFilters from "../../components/customers/CustomerFilters";
import CustomersTable from "../../components/customers/CustomersTable";
import CustomerDetailsModal from "../../components/customers/CustomerDetailsModal";
import Loader from "../../../components/shared/Loader";

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

export default function CustomersPage() {
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
    customerType: "all", // new filter
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

      // Get registered customers
      const usersData = await usersApi.getAll();
      const registeredCustomers = usersData.users.filter(
        (user: Customer) => user.order_count > 0
      );

      // Get guest customers
      const currentUser = auth.currentUser;
      if (!currentUser) {
        setCustomers(registeredCustomers);
        calculateStats(registeredCustomers);
        setLoading(false);
        return;
      }

      const token = await currentUser.getIdToken();
      const guestResponse = await fetch("/api/users/guests", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (guestResponse.ok) {
        const guestData = await guestResponse.json();
        const allCustomers = [...registeredCustomers, ...guestData.guests];
        setCustomers(allCustomers);
        calculateStats(allCustomers);
      } else {
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

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (customer) =>
          customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          customer.phone?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Customer Type Filter
    if (filters.customerType !== "all") {
      if (filters.customerType === "registered") {
        filtered = filtered.filter((c) => !c.isGuest);
      } else if (filters.customerType === "guest") {
        filtered = filtered.filter((c) => c.isGuest);
      }
    }

    // Status filter
    if (filters.status !== "all") {
      if (filters.status === "active") {
        filtered = filtered.filter((c) => c.is_active && !c.is_banned);
      } else if (filters.status === "inactive") {
        filtered = filtered.filter((c) => !c.is_active);
      } else if (filters.status === "banned") {
        filtered = filtered.filter((c) => c.is_banned);
      }
    }

    // Order range filter
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

    // Joined date filter
    if (filters.joinedDate !== "all") {
      const now = new Date();
      if (filters.joinedDate === "week") {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        filtered = filtered.filter(
          (c) => new Date(c.customer_since) >= weekAgo
        );
      } else if (filters.joinedDate === "month") {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        filtered = filtered.filter(
          (c) => new Date(c.customer_since) >= monthAgo
        );
      } else if (filters.joinedDate === "year") {
        const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        filtered = filtered.filter(
          (c) => new Date(c.customer_since) >= yearAgo
        );
      }
    }

    // Spending range filter
    if (filters.spendingRange !== "all") {
      if (filters.spendingRange === "0") {
        filtered = filtered.filter((c) => c.total_spent === 0);
      } else if (filters.spendingRange === "1-100") {
        filtered = filtered.filter(
          (c) => c.total_spent > 0 && c.total_spent <= 100
        );
      } else if (filters.spendingRange === "101-500") {
        filtered = filtered.filter(
          (c) => c.total_spent > 100 && c.total_spent <= 500
        );
      } else if (filters.spendingRange === "500+") {
        filtered = filtered.filter((c) => c.total_spent > 500);
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
    // Check if it's a guest customer
    if (customerId.startsWith("guest-")) {
      alert("Cannot modify guest customer status");
      return;
    }

    try {
      await usersApi.updateStatus(customerId, { is_active: !currentStatus });
      fetchCustomers();
    } catch (error) {
      console.error("Failed to update status:", error);
      alert("Failed to update customer status");
    }
  };

  const handleToggleBan = async (
    customerId: string,
    currentBanStatus: boolean
  ) => {
    // Check if it's a guest customer
    if (customerId.startsWith("guest-")) {
      alert("Cannot ban guest customers");
      return;
    }

    if (
      !confirm(
        `Are you sure you want to ${
          currentBanStatus ? "unban" : "ban"
        } this customer?`
      )
    ) {
      return;
    }

    try {
      await usersApi.updateStatus(customerId, { is_banned: !currentBanStatus });
      fetchCustomers();
    } catch (error) {
      console.error("Failed to update ban status:", error);
      alert("Failed to update ban status");
    }
  };

  const handleSearch = () => {
    applyFilters();
  };

  if (loading) {
    return (
      <div className="relative h-64">
        <Loader />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <CustomerManagementHeader totalCustomers={stats.totalCustomers} />

      <CustomerStatsCards stats={stats} />

      {/* Search and Filters */}
      <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-lg shadow border border-theme-border-light dark:border-theme-border-dark p-3 sm:p-4">
        <div className="flex flex-col lg:flex-row gap-3 sm:gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <FaSearch className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-theme-text-muted-light dark:text-theme-text-muted-dark text-sm" />
              <input
                type="text"
                placeholder="Search by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-1.5 sm:py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-primary-light dark:text-theme-text-primary-dark text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-theme-primary"
                aria-label="Search customers"
              />
            </div>
          </div>

          {/* Filter Button (Mobile) */}
          <button
            onClick={handleSearch}
            className="lg:hidden px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm"
          >
            <FaSearch className="text-xs sm:text-sm" />
            Search
          </button>
        </div>

        {/* Filters Component */}
        <CustomerFilters filters={filters} onFiltersChange={setFilters} />
      </div>

      {/* Results Summary */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-theme-text-muted-light dark:text-theme-text-muted-dark">
        <p className="break-words">
          Showing{" "}
          <span className="font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
            {filteredCustomers.length}
          </span>{" "}
          of{" "}
          <span className="font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
            {customers.length}
          </span>{" "}
          customers
          {filters.customerType !== "all" && (
            <span className="ml-2 text-theme-primary">
              ({filters.customerType === "registered" ? "Registered" : "Guest"} only)
            </span>
          )}
        </p>
      </div>

      {/* Customers Table */}
      <CustomersTable
        customers={filteredCustomers}
        onViewCustomer={handleViewCustomer}
        onToggleStatus={handleToggleStatus}
        onToggleBan={handleToggleBan}
      />

      {/* Customer Details Modal */}
      {showDetailsModal && selectedCustomer && (
        <CustomerDetailsModal
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