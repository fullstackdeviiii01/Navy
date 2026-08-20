// app/admin/reports/page.tsx
"use client";

import { useState } from "react";
import ReportsHeader from "../../(admin)/components/reports/ReportsHeader";
import SalesReport from "../../(admin)/components/reports/SalesReport";
import ProductReport from "../../(admin)/components/reports/ProductReport/ProductReport";
import CustomerReport from "../../(admin)/components/reports/CustomerReport/CustomerReport";
import InventoryReport from "../../(admin)/components/reports/Inventoryreport/InventoryReport";

type ReportType = "sales" | "products" | "customers" | "inventory";

export default function ReportsPage() {
  const [activeReport, setActiveReport] = useState<ReportType>("sales");
  const [dateRange, setDateRange] = useState("30d");
  const [customDates, setCustomDates] = useState({
    startDate: "",
    endDate: "",
  });

  const renderReport = () => {
    switch (activeReport) {
      case "sales":
        return <SalesReport dateRange={dateRange} customDates={customDates} />;
      case "products":
        return <ProductReport dateRange={dateRange} customDates={customDates} />;
      case "customers":
        return <CustomerReport dateRange={dateRange} customDates={customDates} />;
      case "inventory":
        return <InventoryReport />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <ReportsHeader
        activeReport={activeReport}
        onReportChange={setActiveReport}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        customDates={customDates}
        onCustomDatesChange={setCustomDates}
      />
      {renderReport()}
    </div>
  );
}