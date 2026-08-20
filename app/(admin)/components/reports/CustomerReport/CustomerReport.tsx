// app/(admin)/components/reports/reports/CustomerReport.tsx
"use client";

import { useState, useEffect } from "react";
import { Download, Users, UserPlus, DollarSign } from "lucide-react";
import { reportsApi } from "../../../../../lib/api/reports";
import { exportToPDF } from "../export/exportUtils";
import Loader from "../../../../components/shared/Loader";

interface CustomerReportProps {
  dateRange: string;
  customDates: { startDate: string; endDate: string };
}

export default function CustomerReport({ dateRange, customDates }: CustomerReportProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReport();
  }, [dateRange, customDates]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const params =
        dateRange === "custom"
          ? { startDate: customDates.startDate, endDate: customDates.endDate }
          : { range: dateRange };

      const response = await reportsApi.getCustomerReport(params);
      setData(response);
    } catch (error) {
      console.error("Failed to fetch customer report:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (!data) return;
    exportToPDF("customers", data, dateRange);
  };

  if (loading) {
    return (
      <div className="relative h-64">
        <Loader />
      </div>
    );
  }

  if (!data) return null;

  const report = data.data;

  return (
    <div className="space-y-4 sm:space-y-5 lg:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
          Customer Analytics Report
        </h2>
        <button
          onClick={handleExport}
          className="flex items-center justify-center sm:justify-start gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-theme-primary text-white rounded-lg hover:bg-theme-primary-hover transition-colors text-sm font-medium w-full sm:w-auto"
        >
          <Download className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="hidden xs:inline">Export PDF</span>
          <span className="xs:hidden">Export</span>
        </button>
      </div>

      <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-lg border border-theme-border-light dark:border-theme-border-dark p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <UserPlus className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-theme-text-secondary-light dark:text-theme-text-muted-dark">
                New Customers
              </p>
              <p className="text-lg sm:text-xl font-bold text-theme-text-primary-light dark:text-theme-text-primary-dark">
                {report.newCustomers}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-lg border border-theme-border-light dark:border-theme-border-dark p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
              <Users className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-xs text-theme-text-secondary-light dark:text-theme-text-muted-dark">
                Active Customers
              </p>
              <p className="text-lg sm:text-xl font-bold text-theme-text-primary-light dark:text-theme-text-primary-dark">
                {report.activeCustomers}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-lg border border-theme-border-light dark:border-theme-border-dark p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
              <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-xs text-theme-text-secondary-light dark:text-theme-text-muted-dark">
                Avg Orders/Customer
              </p>
              <p className="text-lg sm:text-xl font-bold text-theme-text-primary-light dark:text-theme-text-primary-dark">
                {report.averageOrdersPerCustomer.toFixed(1)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-lg border border-theme-border-light dark:border-theme-border-dark p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
              <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-xs text-theme-text-secondary-light dark:text-theme-text-muted-dark">
                Avg Revenue/Customer
              </p>
              <p className="text-lg sm:text-xl font-bold text-theme-text-primary-light dark:text-theme-text-primary-dark">
                ${report.averageRevenuePerCustomer.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-lg border border-theme-border-light dark:border-theme-border-dark p-4 sm:p-5 lg:p-6">
        <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark mb-3 sm:mb-4">
          Top 10 Customers by Revenue
        </h3>
        <div className="overflow-x-auto -mx-2 sm:mx-0">
          <div className="min-w-full inline-block align-middle">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-theme-border-light dark:border-theme-border-dark">
                  <th className="text-left py-2 px-3 sm:py-3 sm:px-4 text-xs font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark whitespace-nowrap">
                    Rank
                  </th>
                  <th className="text-left py-2 px-3 sm:py-3 sm:px-4 text-xs font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark whitespace-nowrap min-w-[150px]">
                    Customer
                  </th>
                  <th className="text-right py-2 px-3 sm:py-3 sm:px-4 text-xs font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark whitespace-nowrap">
                    Orders
                  </th>
                  <th className="text-right py-2 px-3 sm:py-3 sm:px-4 text-xs font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark whitespace-nowrap">
                    Total Spent
                  </th>
                  <th className="text-left py-2 px-3 sm:py-3 sm:px-4 text-xs font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark whitespace-nowrap hidden sm:table-cell">
                    Last Order
                  </th>
                </tr>
              </thead>
              <tbody>
                {report.topCustomers.map((customer: any, index: number) => (
                  <tr
                    key={index}
                    className="border-b border-theme-border-light dark:border-theme-border-dark hover:bg-theme-hover-bg-light dark:hover:bg-theme-hover-bg-dark"
                  >
                    <td className="py-2 px-3 sm:py-3 sm:px-4">
                      <span className="inline-flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-theme-primary/10 text-theme-primary text-xs font-semibold">
                        {index + 1}
                      </span>
                    </td>
                    <td className="py-2 px-3 sm:py-3 sm:px-4 min-w-0">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark truncate">
                          {customer.name || "N/A"}
                        </p>
                        <p className="text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark truncate">
                          {customer.email}
                        </p>
                      </div>
                    </td>
                    <td className="py-2 px-3 sm:py-3 sm:px-4 text-right text-sm text-theme-text-primary-light dark:text-theme-text-primary-dark whitespace-nowrap">
                      {customer.orders}
                    </td>
                    <td className="py-2 px-3 sm:py-3 sm:px-4 text-right text-sm font-semibold text-green-600 dark:text-green-400 whitespace-nowrap">
                      ${customer.revenue.toFixed(2)}
                    </td>
                    <td className="py-2 px-3 sm:py-3 sm:px-4 text-sm text-theme-text-primary-light dark:text-theme-text-primary-dark hidden sm:table-cell whitespace-nowrap">
                      {new Date(customer.lastOrder).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}