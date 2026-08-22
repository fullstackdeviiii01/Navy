// app/(admin)/intelligence/views/BusinessIntelligenceView.tsx
"use client";

import { useState } from "react";
import IntelligenceFilterToolbar from "../components/IntelligenceFilterToolbar";
import SalesReportStudio from "../components/SalesReportStudio";
import ProductPerformanceStudio from "../components/ProductPerformanceStudio";
import PatronAnalyticsStudio from "../components/PatronAnalyticsStudio";
import InventoryValuationStudio from "../components/InventoryValuationStudio";

type ReportType = "sales" | "products" | "customers" | "inventory";

export default function BusinessIntelligenceView() {
  const [activeReport, setActiveReport] = useState<ReportType>("sales");
  const [dateRange, setDateRange] = useState("30d");
  const [customDates, setCustomDates] = useState({
    startDate: "",
    endDate: "",
  });

  const renderActiveReport = () => {
    switch (activeReport) {
      case "sales":
        return <SalesReportStudio dateRange={dateRange} customDates={customDates} />;
      case "products":
        return <ProductPerformanceStudio dateRange={dateRange} customDates={customDates} />;
      case "customers":
        return <PatronAnalyticsStudio dateRange={dateRange} customDates={customDates} />;
      case "inventory":
        return <InventoryValuationStudio />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 pb-16">
      <IntelligenceFilterToolbar
        activeReport={activeReport}
        onReportChange={setActiveReport}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        customDates={customDates}
        onCustomDatesChange={setCustomDates}
      />
      {renderActiveReport()}
    </div>
  );
}
