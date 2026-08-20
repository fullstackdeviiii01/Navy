// app/(admin)/components/reports/reports/SalesReport/index.tsx
"use client";
import { useState, useEffect } from "react";
import { Download } from "lucide-react";
import { reportsApi } from "../../../../../lib/api/reports";
import { exportToPDF } from "../export/exportUtils";
import SalesStats from "./SalesStats";
import SalesChart from "./SalesChart";
import TopProducts from "./TopProducts";
import Loader from "../../../../components/shared/Loader";

interface SalesReportProps {
  dateRange: string;
  customDates: { startDate: string; endDate: string };
}

export default function SalesReport({ dateRange, customDates }: SalesReportProps) {
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

      const response = await reportsApi.getSalesReport(params);
      setData(response);
    } catch (error) {
      console.error("Failed to fetch sales report:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (!data) return;
    exportToPDF("sales", data, dateRange);
  };

  if (loading) {
    return (
      <div className="relative h-64">
        <Loader />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-4 sm:space-y-5 lg:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
          Sales Performance Report
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

      <SalesStats summary={data.data.summary} />
      <SalesChart dailyData={data.data.dailyData} />
      <TopProducts products={data.data.topProducts} />
    </div>
  );
}